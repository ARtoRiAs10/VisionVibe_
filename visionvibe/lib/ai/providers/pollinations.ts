import { AI_CONFIG } from "../config";
import type { GeneratedImage, GeneratedText } from "../types";
import { stripProviderBranding } from "../image-utils";
import { envValue } from "@/lib/env";

/**
 * Pollinations — free, no API key required.
 *  - image: https://image.pollinations.ai/prompt/{prompt}
 *  - text:  https://text.pollinations.ai/openai/chat/completions (OpenAI compatible)
 */

export function isPollinationsConfigured() {
  return true;
}

function pollinationsImageUrl(prompt: string, width: number, height: number, model: string, seed?: number) {
  const url = new URL(`${AI_CONFIG.pollinations.imageBase}/${encodeURIComponent(prompt)}`);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  url.searchParams.set("model", model);
  url.searchParams.set("nologo", "true");
  url.searchParams.set("enhance", "true");
  if (seed !== undefined) url.searchParams.set("seed", String(seed));
  return url.toString();
}

export async function pollinationsGenerateImage(params: {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  model?: string;
}): Promise<GeneratedImage> {
  const models = [params.model || AI_CONFIG.pollinations.imageModel, AI_CONFIG.pollinations.imageFallbackModel];
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = pollinationsImageUrl(params.prompt, params.width, params.height, model, params.seed);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 150_000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "image/*" },
          cache: "no-store",
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          const wait = retryAfterSeconds(body);
          if ((res.status === 402 || res.status === 429) && attempt < 2) {
            // Free tier allows ~1 image per 45s per IP — wait it out.
            await new Promise((r) => setTimeout(r, (wait ?? 20) * 1000));
            continue;
          }
          throw new Error(`Pollinations image HTTP ${res.status}: ${body.slice(0, 160)}`);
        }

        const contentType = res.headers.get("content-type") || "image/jpeg";
        if (!contentType.startsWith("image/")) {
          const body = await res.text();
          throw new Error(`Pollinations returned non-image (${contentType}): ${body.slice(0, 200)}`);
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const cleaned = await stripProviderBranding(buffer, {
          crop: envValue("POLLINATIONS_KEEP_BRANDING") === undefined,
        });
        const dataUrl = `data:image/jpeg;base64,${cleaned.toString("base64")}`;

        return {
          dataUrl,
          provider: "pollinations",
          model,
          usedReference: false,
        };
      } catch (err) {
        lastError = err;
        const message = (err as Error)?.message ?? "";
        if (attempt < 2 && /HTTP (402|429)/.test(message)) {
          await new Promise((r) => setTimeout(r, 15_000));
          continue;
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  throw new Error(`Pollinations image generation failed: ${(lastError as Error)?.message ?? "unknown error"}`);
}

/** Pollinations tells us how long to wait: "Retry after 12s" */
function retryAfterSeconds(body: string): number | undefined {
  const match = body.match(/Retry after\s+(\d+)\s*s/i);
  if (!match) return undefined;
  return Math.min(60, Math.max(2, parseInt(match[1], 10)));
}

export async function pollinationsText(params: {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<GeneratedText> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await pollinationsTextOnce(params);
    } catch (error) {
      lastError = error;
      const message = (error as Error)?.message ?? "";
      if (/HTTP (402|429)/.test(message) && attempt < 2) {
        // Free tier: 1 reply every 30s per IP — wait it out.
        await new Promise((r) => setTimeout(r, 15_000));
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Pollinations text failed");
}

async function pollinationsTextOnce(params: {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<GeneratedText> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  const res = await fetch(`${AI_CONFIG.pollinations.textBase}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_CONFIG.pollinations.textModel,
      messages: [
        ...(params.system ? [{ role: "system", content: params.system }] : []),
        { role: "user", content: params.user },
      ],
      max_tokens: params.maxTokens ?? 400,
      temperature: params.temperature ?? 0.7,
    }),
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Pollinations text HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    model?: string;
  };

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Pollinations text returned an empty response");

  return { text, provider: "pollinations", model: json.model || AI_CONFIG.pollinations.textModel };
}
