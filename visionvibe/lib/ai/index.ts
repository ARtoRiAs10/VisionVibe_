import { buildDesignPrompt, buildEditPrompt, buildFallbackDescription } from "./prompt";
import { routeImageGeneration, routeRoomAnalysis, routeText } from "./router";
import type { GeneratedImage, RoomAnalysis } from "./types";
import type { VisionVibeControls } from "@/types";

export interface DesignControls extends VisionVibeControls {
  roomType?: string;
  lighting?: string;
  aspectRatio?: string;
  seed?: number;
}

export interface DesignOutcome {
  image: GeneratedImage;
  description: string;
  descriptionProvider: string;
  prompt: string;
  analysis: RoomAnalysis | null;
  attempts: { provider: string; capability: string; ok: boolean; error?: string; ms: number }[];
}

function dimensionsFor(aspectRatio?: string) {
  const map: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1024, height: 576 },
    "4:3": { width: 1024, height: 768 },
    "1:1": { width: 1024, height: 1024 },
    "3:4": { width: 768, height: 1024 },
    "9:16": { width: 576, height: 1024 },
  };
  return map[aspectRatio || "4:3"] ?? map["4:3"];
}

/**
 * Full generation pipeline:
 *  1. (optional) analyse the uploaded room with a vision model
 *  2. build the art-directed prompt from the user's selections
 *  3. generate the image (accurate edit when possible, else text-to-image)
 *  4. write a design description with a text model
 */
export async function generateDesign(params: {
  controls: DesignControls;
  image?: { base64: string; mimeType: string; name?: string };
}): Promise<DesignOutcome> {
  const { controls, image } = params;
  const attempts: DesignOutcome["attempts"] = [];

  // 1. Vision analysis of the real room (optional, adds accuracy)
  let analysis: RoomAnalysis | null = null;
  if (image?.base64) {
    analysis = await routeRoomAnalysis({ base64: image.base64, mimeType: image.mimeType });
  }

  const effectiveRoomType = controls.roomType || analysis?.roomType;
  const effectiveLighting = controls.lighting || analysis?.light;

  // 2. Prompt
  const promptParts = {
    theme: controls.theme,
    subTheme: controls.subTheme,
    budget: controls.budget,
    prompt: controls.prompt,
    roomType: effectiveRoomType,
    lighting: effectiveLighting,
  };

  const canEdit = !!image?.base64;
  const prompt = canEdit ? buildEditPrompt(promptParts) : buildDesignPrompt(promptParts);

  // 3. Image
  const { width, height } = dimensionsFor(controls.aspectRatio);
  const { result: generated, attempts: imageAttempts } = await routeImageGeneration({
    prompt,
    width,
    height,
    seed: controls.seed,
    referenceImage: image?.base64 ? { base64: image.base64, mimeType: image.mimeType } : undefined,
  });
  attempts.push(...imageAttempts);

  // 4. Description — vision models describe the *generated* image, text-only
  //    models describe the concept itself.
  let description = "";
  let descriptionProvider = "fallback";

  const generatedBase64 = generated.dataUrl.split(",")[1];
  const generatedMime = generated.dataUrl.startsWith("data:image/png")
    ? "image/png"
    : "image/jpeg";

  try {
    const { result, attempts: textAttempts } = await routeText({
      system:
        "You are a senior interior designer writing for a design magazine. Be vivid, specific and concise. No markdown headings, no bullet lists, one flowing paragraph of 2-4 sentences.",
      user: "Describe this newly decorated interior design image: the theme, the key furniture pieces, the colour palette, the lighting and the overall mood.",
      fallbackUser: `Write a short magazine-style description of this interior design concept: ${controls.theme} / ${controls.subTheme} for a ${effectiveRoomType || "living room"} at a ${controls.budget} budget.${
        controls.prompt ? ` Client notes: ${controls.prompt}.` : ""
      }`,
      image: { base64: generatedBase64, mimeType: generatedMime },
      maxTokens: 260,
      temperature: 0.8,
    });
    attempts.push(...textAttempts);
    description = result.text;
    descriptionProvider = result.provider;
  } catch (error) {
    attempts.push({
      provider: "text-fallback",
      capability: "text",
      ok: false,
      error: (error as Error)?.message,
      ms: 0,
    });
  }

  if (!description) {
    description = buildFallbackDescription({
      theme: controls.theme,
      subTheme: controls.subTheme,
      budget: controls.budget,
      roomType: effectiveRoomType,
    });
  }

  return {
    image: generated,
    description,
    descriptionProvider,
    prompt,
    analysis,
    attempts,
  };
}

/** Turn a rough user request into a professional design brief. */
export async function enhancePrompt(params: {
  prompt: string;
  controls: DesignControls;
}): Promise<{ prompt: string; provider: string }> {
  const { result } = await routeText({
    system:
      "You rewrite short interior design notes into a vivid, professional design brief for an image generation model. Reply with the brief only, no preamble, no quotes, max 60 words.",
    user: `Room type: ${params.controls.roomType || "living room"}.
Theme: ${params.controls.theme}. Style: ${params.controls.subTheme}. Budget: ${params.controls.budget}.
Lighting: ${params.controls.lighting || "Natural daylight"}.
User notes: ${params.prompt || "none"}.
Write the brief:`,
    maxTokens: 160,
    temperature: 0.7,
  });

  return { prompt: result.text, provider: result.provider };
}

/** Describe an arbitrary image (kept for the standalone endpoint). */
export async function describeImage(imageFile: {
  base64: string;
  mimeType: string;
}): Promise<{ description: string; provider: string }> {
  try {
    const { result } = await routeText({
      system:
        "You are an expert interior designer. Describe the room in 2-3 vivid sentences covering theme, key furniture, palette and ambiance. No markdown.",
      user: "Describe this interior design image.",
      fallbackUser:
        "Describe a finished interior design: describe the style, the key furniture pieces, the colour palette, the lighting and the overall mood. Write 2-3 vivid sentences.",
      image: { base64: imageFile.base64, mimeType: imageFile.mimeType },
      maxTokens: 220,
      temperature: 0.7,
    });
    return { description: result.text, provider: result.provider };
  } catch {
    return {
      description:
        "A newly designed interior: coordinated furniture, a considered colour palette and layered ambient lighting, captured as a professional interior photograph.",
      provider: "fallback",
    };
  }
}

export { buildDesignPrompt, buildEditPrompt };
