import { GoogleGenAI, Modality } from "@google/genai";
import { AI_CONFIG } from "../config";
import type { GeneratedImage, GeneratedText, RoomAnalysis } from "../types";
import { envValue, hasEnv } from "@/lib/env";

/**
 * Google Gemini — the "accurate" route.
 * When GEMINI_API_KEY is present we can do true image-to-image editing,
 * i.e. the generated picture keeps the real geometry, windows and light
 * direction of the uploaded room. It also gives us vision (room analysis)
 * and high quality copywriting.
 */

let client: GoogleGenAI | null = null;

export function isGeminiConfigured() {
  return hasEnv("GEMINI_API_KEY");
}

function getClient() {
  const key = envValue("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

export async function geminiGenerateImage(params: {
  prompt: string;
  width?: number;
  height?: number;
  referenceImage?: { base64: string; mimeType: string };
}): Promise<GeneratedImage> {
  const ai = getClient();
  const model = params.referenceImage
    ? AI_CONFIG.gemini.editModel
    : AI_CONFIG.gemini.imageModel;

  const parts: any[] = [];
  if (params.referenceImage) {
    parts.push({
      inlineData: { data: params.referenceImage.base64, mimeType: params.referenceImage.mimeType },
    });
  }
  parts.push({ text: params.prompt });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: [Modality.IMAGE],
      ...(params.width && params.height
        ? { imageConfig: { aspectRatio: aspectFromSize(params.width, params.height) } }
        : {}),
    },
  } as any);

  const responseParts = response.candidates?.[0]?.content?.parts;
  for (const part of responseParts ?? []) {
    if (part.inlineData?.data) {
      return {
        dataUrl: `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`,
        provider: "gemini",
        model,
        usedReference: !!params.referenceImage,
      };
    }
  }

  throw new Error("Gemini did not return an image part");
}

function aspectFromSize(width: number, height: number): string {
  const ratio = width / height;
  const options: [string, number][] = [
    ["1:1", 1],
    ["16:9", 16 / 9],
    ["9:16", 9 / 16],
    ["4:3", 4 / 3],
    ["3:4", 3 / 4],
  ];
  let best = options[0];
  for (const option of options) {
    if (Math.abs(option[1] - ratio) < Math.abs(best[1] - ratio)) best = option;
  }
  return best[0];
}

export async function geminiAnalyzeRoom(params: {
  base64: string;
  mimeType: string;
}): Promise<RoomAnalysis> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: AI_CONFIG.gemini.textModel,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: params.base64, mimeType: params.mimeType } },
          {
            text: `You are an expert interior designer analysing a photo of an empty room.
Return ONLY valid JSON with this exact shape:
{
  "roomType": "Living Room | Bedroom | Kitchen | Dining Room | Home Office | Bathroom | Kids Room | Entryway | Balcony | Reading Nook",
  "description": "one or two sentences describing the room, its architecture and light",
  "light": "Natural daylight | Warm & cozy | Bright & airy | Moody & dramatic | Golden hour | Evening lamp light",
  "palette": ["3 dominant colours present in the room"],
  "features": ["3-5 architectural or fixed features such as window position, flooring, wall colour, ceiling height, existing furniture"]
}`,
          },
        ],
      },
    ],
    config: { responseMimeType: "application/json" },
  } as any);

  const text = response.text || "";
  const parsed = JSON.parse(text);
  return {
    roomType: parsed.roomType || "Living Room",
    description: parsed.description || "",
    light: parsed.light || "Natural daylight",
    palette: Array.isArray(parsed.palette) ? parsed.palette : [],
    features: Array.isArray(parsed.features) ? parsed.features : [],
    provider: "gemini",
  };
}

export async function geminiText(params: {
  system?: string;
  user: string;
  image?: { base64: string; mimeType: string };
  maxTokens?: number;
}): Promise<GeneratedText> {
  const ai = getClient();
  const parts: any[] = [];
  if (params.image) {
    parts.push({ inlineData: { data: params.image.base64, mimeType: params.image.mimeType } });
  }
  parts.push({ text: params.user });

  const response = await ai.models.generateContent({
    model: AI_CONFIG.gemini.textModel,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: params.system,
      maxOutputTokens: params.maxTokens ?? 500,
    },
  } as any);

  const text = (response.text || "").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return { text, provider: "gemini", model: AI_CONFIG.gemini.textModel };
}
