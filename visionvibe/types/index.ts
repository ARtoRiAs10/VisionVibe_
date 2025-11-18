export interface VisionVibeControls {
  theme: string;
  subTheme: string;
  budget: string;
  prompt: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
