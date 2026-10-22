import { AI_CONFIG } from "../config";
import type { GeneratedImage } from "../types";
import { envValue, hasEnv } from "@/lib/env";

/** Hugging Face Inference — optional free token, text-to-image fallback. */

export function isHuggingFaceConfigured() {
  return hasEnv("HF_TOKEN");
}

export async function huggingFaceGenerateImage(params: {
  prompt: string;
  width: number;
  height: number;
}): Promise<GeneratedImage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  const res = await fetch(`${AI_CONFIG.huggingface.base}/${AI_CONFIG.huggingface.model}`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${envValue("HF_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: params.prompt,
      parameters: { width: params.width, height: params.height, num_inference_steps: 4 },
    }),
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HuggingFace HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    const body = await res.text();
    throw new Error(`HuggingFace returned non-image: ${body.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    dataUrl: `data:${contentType};base64,${buffer.toString("base64")}`,
    provider: "huggingface",
    model: AI_CONFIG.huggingface.model,
    usedReference: false,
  };
}
