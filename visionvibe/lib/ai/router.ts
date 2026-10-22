import { AI_CONFIG } from "./config";
import { pollinationsGenerateImage, pollinationsText } from "./providers/pollinations";
import {
  geminiAnalyzeRoom,
  geminiGenerateImage,
  geminiText,
  isGeminiConfigured,
} from "./providers/gemini";
import {
  isOpenRouterConfigured,
  openRouterAnalyzeRoom,
  openRouterText,
} from "./providers/openrouter";
import { huggingFaceGenerateImage, isHuggingFaceConfigured } from "./providers/huggingface";
import { hordeGenerateImage, isHordeConfigured } from "./providers/horde";
import { buildFallbackDescription } from "./prompt";
import type { GeneratedImage, GeneratedText, RoomAnalysis } from "./types";

export interface ProviderAttempt {
  provider: string;
  capability: string;
  ok: boolean;
  error?: string;
  ms: number;
}

/**
 * The router picks the best available provider for a capability and
 * transparently falls back to the next one when something fails.
 * Free, key-less providers (Pollinations) are always available, so the
 * app never hard-fails for a missing API key.
 */

export async function routeImageGeneration(params: {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  referenceImage?: { base64: string; mimeType: string };
}): Promise<{ result: GeneratedImage; attempts: ProviderAttempt[] }> {
  const attempts: ProviderAttempt[] = [];
  const run = async (
    provider: string,
    capability: string,
    fn: () => Promise<GeneratedImage>
  ): Promise<GeneratedImage | null> => {
    const started = Date.now();
    try {
      const result = await fn();
      attempts.push({ provider, capability, ok: true, ms: Date.now() - started });
      return result;
    } catch (error) {
      attempts.push({
        provider,
        capability,
        ok: false,
        error: (error as Error)?.message,
        ms: Date.now() - started,
      });
      return null;
    }
  };

  // 1. Accurate mode: real image-to-image editing of the uploaded room.
  if (params.referenceImage) {
    const editChain: [string, () => Promise<GeneratedImage>][] = [];

    if (isGeminiConfigured()) {
      editChain.push([
        "gemini",
        () =>
          geminiGenerateImage({
            prompt: params.prompt,
            referenceImage: params.referenceImage,
            width: params.width,
            height: params.height,
          }),
      ]);
    }

    if (isHordeConfigured()) {
      editChain.push([
        "aihorde",
        () =>
          hordeGenerateImage({
            prompt: params.prompt,
            width: params.width,
            height: params.height,
            seed: params.seed,
            referenceImage: params.referenceImage,
          }),
      ]);
    }

    for (const [provider, fn] of editChain) {
      const result = await run(provider, "img->img", fn);
      if (result) return { result, attempts };
    }
  }

  // 2. Text-to-image chain (free first).
  const textToImageChain: [string, () => Promise<GeneratedImage>][] = [
    [
      "pollinations",
      () =>
        pollinationsGenerateImage({
          prompt: params.prompt,
          width: params.width,
          height: params.height,
          seed: params.seed,
        }),
    ],
  ];

  if (isGeminiConfigured()) {
    textToImageChain.unshift([
      "gemini",
      () =>
        geminiGenerateImage({
          prompt: params.prompt,
          width: params.width,
          height: params.height,
        }),
    ]);
  }

  if (isHuggingFaceConfigured()) {
    textToImageChain.push([
      "huggingface",
      () =>
        huggingFaceGenerateImage({
          prompt: params.prompt,
          width: params.width,
          height: params.height,
        }),
    ]);
  }

  if (isHordeConfigured()) {
    textToImageChain.push([
      "aihorde",
      () =>
        hordeGenerateImage({
          prompt: params.prompt,
          width: params.width,
          height: params.height,
          seed: params.seed,
        }),
    ]);
  }

  for (const [provider, fn] of textToImageChain) {
    const result = await run(provider, "text->img", fn);
    if (result) return { result, attempts };
  }

  const summary = attempts.map((a) => `${a.provider}: ${a.error}`).join(" | ");
  throw new Error(`All image providers failed. ${summary}`);
}

export async function routeText(params: {
  system?: string;
  user: string;
  image?: { base64: string; mimeType: string };
  /** Text used by providers without vision support. */
  fallbackUser?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ result: GeneratedText; attempts: ProviderAttempt[] }> {
  const attempts: ProviderAttempt[] = [];
  const run = async (
    provider: string,
    fn: () => Promise<GeneratedText>
  ): Promise<GeneratedText | null> => {
    const started = Date.now();
    try {
      const result = await fn();
      attempts.push({ provider, capability: params.image ? "vision" : "text", ok: true, ms: Date.now() - started });
      return result;
    } catch (error) {
      attempts.push({
        provider,
        capability: params.image ? "vision" : "text",
        ok: false,
        error: (error as Error)?.message,
        ms: Date.now() - started,
      });
      return null;
    }
  };

  if (isGeminiConfigured()) {
    const result = await run("gemini", () =>
      geminiText({
        system: params.system,
        user: params.user,
        image: params.image,
        maxTokens: params.maxTokens,
      })
    );
    if (result) return { result, attempts };
  }

  if (isOpenRouterConfigured()) {
    const result = await run("openrouter", () =>
      openRouterText({
        system: params.system,
        user: params.user,
        image: params.image,
        maxTokens: params.maxTokens,
      })
    );
    if (result) return { result, attempts };
  }

  const result = await run("pollinations", () =>
    pollinationsText({
      system: params.system,
      user: params.fallbackUser ?? params.user,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    })
  );
  if (result) return { result, attempts };

  throw new Error("All text providers failed");
}

export async function routeRoomAnalysis(params: {
  base64: string;
  mimeType: string;
}): Promise<RoomAnalysis | null> {
  if (isGeminiConfigured()) {
    try {
      return await geminiAnalyzeRoom(params);
    } catch {
      /* fall through */
    }
  }
  if (isOpenRouterConfigured()) {
    try {
      return await openRouterAnalyzeRoom(params);
    } catch {
      /* fall through */
    }
  }
  return null;
}

export function buildFallbackDescriptionSafe(controls: {
  theme: string;
  subTheme: string;
  budget: string;
  roomType?: string;
}) {
  return buildFallbackDescription(controls);
}

export { AI_CONFIG };
