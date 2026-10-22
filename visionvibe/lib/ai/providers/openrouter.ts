import { AI_CONFIG } from "../config";
import type { GeneratedText, RoomAnalysis } from "../types";
import { envValue, hasEnv } from "@/lib/env";

/** OpenRouter — optional key, has free text + free vision-capable models. */

export function isOpenRouterConfigured() {
  return hasEnv("OPENROUTER_API_KEY");
}

/**
 * The free model list rotates, so we try a few candidates until one works.
 * The first entry is whatever the user configured.
 */
const TEXT_FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-235b-a22b:free",
  "nvidia/nemotron-3-super:free",
  "google/gemma-4-26b-a4b-it:free",
];

const VISION_FALLBACK_MODELS = [
  "nvidia/nemotron-3.5-super-vl:free",
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.5-flash:free",
];

function candidateModels(preferred: string, fallbacks: string[]) {
  return Array.from(new Set([preferred, ...fallbacks]));
}

async function chatOnce(params: {
  model: string;
  messages: any[];
  maxTokens?: number;
  temperature?: number;
}): Promise<GeneratedText> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  const res = await fetch(`${AI_CONFIG.openrouter.base}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envValue("OPENROUTER_API_KEY")}`,
      "HTTP-Referer": envValue("NEXT_PUBLIC_APP_URL") || "https://visionvibe.app",
      "X-Title": "Vision Vibe",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 500,
      temperature: params.temperature ?? 0.7,
    }),
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${params.model} HTTP ${res.status}: ${body.slice(0, 160)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[]; model?: string };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenRouter returned an empty response");
  return { text, provider: "openrouter", model: json.model || params.model };
}

async function chatWithFallback(params: {
  models: string[];
  buildMessages: (model: string) => any[];
  maxTokens?: number;
  temperature?: number;
}): Promise<GeneratedText> {
  let lastError: unknown = null;
  for (const model of params.models) {
    try {
      return await chatOnce({
        model,
        messages: params.buildMessages(model),
        maxTokens: params.maxTokens,
        temperature: params.temperature,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    `OpenRouter models failed: ${(lastError as Error)?.message ?? "unknown error"}`
  );
}

export async function openRouterText(params: {
  system?: string;
  user: string;
  image?: { base64: string; mimeType: string };
  maxTokens?: number;
}): Promise<GeneratedText> {
  const content: any[] = [{ type: "text", text: params.user }];
  if (params.image) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${params.image.mimeType};base64,${params.image.base64}` },
    });
  }

  const models = params.image
    ? candidateModels(AI_CONFIG.openrouter.visionModel, VISION_FALLBACK_MODELS)
    : candidateModels(AI_CONFIG.openrouter.textModel, TEXT_FALLBACK_MODELS);

  return chatWithFallback({
    models,
    buildMessages: () => [
      ...(params.system ? [{ role: "system", content: params.system }] : []),
      { role: "user", content },
    ],
    maxTokens: params.maxTokens,
  });
}

export async function openRouterAnalyzeRoom(params: {
  base64: string;
  mimeType: string;
}): Promise<RoomAnalysis> {
  const result = await openRouterText({
    system: "You are an expert interior designer. Reply with strict JSON only.",
    user: `Look at this room photo and reply ONLY with JSON: {"roomType":"","description":"","light":"","palette":[],"features":[]}.
roomType must be one of: Living Room, Bedroom, Kitchen, Dining Room, Home Office, Bathroom, Kids Room, Entryway, Balcony, Reading Nook.
light must be one of: Natural daylight, Warm & cozy, Bright & airy, Moody & dramatic, Golden hour, Evening lamp light.`,
    image: { base64: params.base64, mimeType: params.mimeType },
    maxTokens: 500,
  });

  const jsonMatch = result.text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result.text);
  return {
    roomType: parsed.roomType || "Living Room",
    description: parsed.description || "",
    light: parsed.light || "Natural daylight",
    palette: Array.isArray(parsed.palette) ? parsed.palette : [],
    features: Array.isArray(parsed.features) ? parsed.features : [],
    provider: "openrouter",
  };
}
