/**
 * Central configuration for every AI provider used by Vision Vibe.
 *
 * The whole point of this file is that the app works with ZERO keys
 * (free, key-less providers) and automatically upgrades itself when the
 * user supplies keys for higher quality / more accurate image editing.
 *
 * Capability matrix
 * -----------------
 * provider      key needed   text->img   img->img   vision   text
 * pollinations  no           yes         no          no       yes
 * gemini        yes          yes         yes         yes      yes
 * openrouter    yes          no          no          yes      yes
 * huggingface   yes          yes         no          no       no
 * stability     yes          yes         no          no       no
 */

import { envValue, hasEnv } from "@/lib/env";

export const AI_CONFIG = {
  pollinations: {
    imageBase:
      envValue("POLLINATIONS_IMAGE_BASE") || "https://image.pollinations.ai/prompt",
    textBase: envValue("POLLINATIONS_TEXT_BASE") || "https://text.pollinations.ai/openai",
    imageModel: envValue("POLLINATIONS_IMAGE_MODEL") || "flux",
    imageFallbackModel: "sana",
    textModel: envValue("POLLINATIONS_TEXT_MODEL") || "openai-fast",
  },
  gemini: {
    imageModel: envValue("GEMINI_IMAGE_MODEL") || "gemini-2.5-flash-image",
    editModel: envValue("GEMINI_EDIT_MODEL") || "gemini-2.5-flash-image",
    textModel: envValue("GEMINI_TEXT_MODEL") || "gemini-2.5-flash",
  },
  openrouter: {
    base: envValue("OPENROUTER_BASE") || "https://openrouter.ai/api/v1",
    textModel: envValue("OPENROUTER_TEXT_MODEL") || "meta-llama/llama-3.3-70b-instruct:free",
    visionModel: envValue("OPENROUTER_VISION_MODEL") || "google/gemini-2.0-flash-exp:free",
  },
  huggingface: {
    base: "https://api-inference.huggingface.co/models",
    model: envValue("HF_IMAGE_MODEL") || "black-forest-labs/FLUX.1-schnell",
  },
  stability: {
    base: "https://api.stability.ai/v2beta/stable-image",
    model: envValue("STABILITY_MODEL") || "sd3.5-large",
  },
} as const;

/** Is a given provider usable with the current environment? */
export function providerStatus() {
  return {
    pollinations: {
      available: true,
      free: true,
      capabilities: ["text->img", "text"] as const,
    },
    aihorde: {
      available: true,
      free: true,
      capabilities: ["text->img", "img->img"] as const,
    },
    gemini: {
      available: hasEnv("GEMINI_API_KEY"),
      free: true,
      capabilities: ["text->img", "img->img", "vision", "text"] as const,
    },
    openrouter: {
      available: hasEnv("OPENROUTER_API_KEY"),
      free: true,
      capabilities: ["vision", "text"] as const,
    },
    huggingface: {
      available: hasEnv("HF_TOKEN"),
      free: true,
      capabilities: ["text->img"] as const,
    },
    stability: {
      available: hasEnv("STABILITY_API_KEY"),
      free: false,
      capabilities: ["text->img"] as const,
    },
  };
}

export const DEMO_MODE = {
  noDatabase: !hasEnv("DATABASE_URL"),
  noAuth: !(hasEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") && hasEnv("CLERK_SECRET_KEY")),
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
