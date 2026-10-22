import { envValue, hasEnv } from "@/lib/env";
import type { GeneratedImage } from "../types";

/**
 * AI Horde — free, crowdsourced, key-less (anonymous "0000000000" key).
 *
 * Why it is in the router:
 *  • it is a completely free fallback when Pollinations is rate limited
 *    (1 image / 45 s per IP on the anonymous tier),
 *  • it supports true image-to-image ("source_processing": "img2img") so the
 *    uploaded room photo can guide the render even without a Gemini key.
 */

const BASE = "https://aihorde.net/api/v2";
const ANON_KEY = "0000000000";

export function isHordeConfigured() {
  return true;
}

function hordeKey() {
  return envValue("HORDE_API_KEY") || ANON_KEY;
}

function snap(value: number) {
  const min = 256;
  // Anonymous (key-less) AI Horde workers only accept up to 576px requests.
  const max = 576;
  const step = 64;
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

export async function hordeGenerateImage(params: {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  referenceImage?: { base64: string; mimeType: string };
  timeoutMs?: number;
  negativePrompt?: string;
}): Promise<GeneratedImage> {
  const key = hordeKey();
  const width = snap(params.width);
  const height = snap(params.height);
  const timeoutMs = params.timeoutMs ?? 90_000;

  const body: Record<string, unknown> = {
    prompt: params.prompt,
    params: {
      width,
      height,
      steps: params.referenceImage ? 20 : 16,
      cfg_scale: 7.5,
      sampler_name: "k_euler_a",
      n: 1,
      seed: params.seed ?? "random",
      clip_skip: 2,
    },
    nsfw: false,
    censor_nsfw: true,
    r2: true,
    shared: true,
    models: ["stable_diffusion", "Anything Diffusion", "Deliberate"],
    dry_run: false,
  };

  if (params.referenceImage) {
    body.source_image = params.referenceImage.base64;
    body.source_processing = "img2img";
  }

  const submit = await fetch(`${BASE}/generate/async`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify(body),
  });

  if (!submit.ok) {
    const text = await submit.text().catch(() => "");
    throw new Error(`AI Horde submit HTTP ${submit.status}: ${text.slice(0, 200)}`);
  }

  const { id } = (await submit.json()) as { id: string };
  if (!id) throw new Error("AI Horde did not return a job id");

  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 3000));

    const statusRes = await fetch(`${BASE}/generate/status/${id}`, {
      headers: { apikey: key },
    });
    if (!statusRes.ok) continue;

    const status = (await statusRes.json()) as {
      done?: boolean;
      faulted?: boolean;
      generations?: { img?: string }[];
    };

    if (status.faulted) throw new Error("AI Horde job faulted");
    if (status.done && status.generations?.length) {
      const img = status.generations[0].img;
      if (!img) throw new Error("AI Horde returned an empty image");
      // AI Horde returns a temporary R2 url — inline it so the design stays
      // viewable forever in the gallery.
      const dataUrl = img.startsWith("http")
        ? await inlineRemoteImage(img)
        : `data:image/png;base64,${img}`;
      return {
        dataUrl,
        provider: "aihorde",
        model: "stable_diffusion",
        usedReference: !!params.referenceImage,
      };
    }
  }

  // Cancel the queued job so it does not consume resources
  fetch(`${BASE}/generate/status/${id}`, {
    method: "DELETE",
    headers: { apikey: key },
  }).catch(() => undefined);

  throw new Error("AI Horde timed out while waiting for the render");
}

export function hordeHasKey() {
  return hasEnv("HORDE_API_KEY");
}

async function inlineRemoteImage(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) return url;
  const contentType = res.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
