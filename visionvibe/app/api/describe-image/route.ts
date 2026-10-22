import { NextRequest, NextResponse } from "next/server";
import { describeImage } from "@/lib/ai";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/ai/config";
import { getSessionUser } from "@/lib/auth";
import type { ImageFile } from "@/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageFile } = body as { imageFile: ImageFile };

    if (!imageFile?.base64) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.mimeType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }
    if (Math.ceil((imageFile.base64.length * 3) / 4) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image is larger than 5MB" }, { status: 400 });
    }

    const result = await describeImage({
      base64: imageFile.base64,
      mimeType: imageFile.mimeType,
    });

    return NextResponse.json({ description: result.description, provider: result.provider });
  } catch (error) {
    console.error("Error in describe-image API:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}
