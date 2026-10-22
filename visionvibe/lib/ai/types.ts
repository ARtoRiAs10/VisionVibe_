import type { VisionVibeControls } from "@/types";

export type Capability = "text->img" | "img->img" | "vision" | "text";

export interface GeneratedImage {
  /** Data URL (data:image/png;base64,...) so it can be stored in the DB as text */
  dataUrl: string;
  provider: string;
  model: string;
  /** True when the source room photo was used as a reference for an edit */
  usedReference: boolean;
}

export interface GeneratedText {
  text: string;
  provider: string;
  model: string;
}

export interface RoomAnalysis {
  roomType: string;
  description: string;
  light: string;
  palette: string[];
  features: string[];
  provider: string;
}

export interface GenerationOptions {
  width: number;
  height: number;
  seed?: number;
}

export interface DesignRequest {
  controls: VisionVibeControls;
  /** Optional base64 room photo (no data-url prefix) */
  image?: { base64: string; mimeType: string; name?: string };
  options?: GenerationOptions;
}
