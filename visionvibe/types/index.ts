export interface VisionVibeControls {
  theme: string;
  subTheme: string;
  budget: string;
  prompt: string;
  /** Optional extras (added for accuracy + control) */
  roomType?: string;
  lighting?: string;
  aspectRatio?: string;
  seed?: number;
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface DesignResult {
  id?: number;
  originalImageUrl: string;
  generatedImageUrl: string;
  description?: string;
  theme: string;
  subTheme: string;
  budget: string;
  prompt: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  roomType?: string;
  lighting?: string;
  aspectRatio?: string;
  provider?: string;
  model?: string;
  createdAt?: Date;
}

export interface UserProfile {
  id: number;
  clerkId: string;
  email: string;
  name?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerationResult {
  imageUrl: string;
  description: string;
  prompt: string;
  provider: string;
  model: string;
  usedReference: boolean;
  descriptionProvider: string;
  analysis?: {
    roomType: string;
    description: string;
    light: string;
    palette: string[];
    features: string[];
  } | null;
  designId?: number | null;
  saved: boolean;
}
