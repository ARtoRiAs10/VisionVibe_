import { NextRequest, NextResponse } from "next/server";
import { generateDesign, type DesignControls } from "@/lib/ai";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/ai/config";
import { requireUser } from "@/lib/auth";
import { createDesign } from "@/lib/db/repository";
import type { ImageFile } from "@/types";

export const maxDuration = 300;

function validateImage(imageFile?: ImageFile) {
  if (!imageFile) return null;
  if (!imageFile.base64) return "Image data is empty";
  if (!ALLOWED_IMAGE_TYPES.includes(imageFile.mimeType))
    return "Unsupported image type. Use JPEG, PNG or WebP.";
  const approxBytes = Math.ceil((imageFile.base64.length * 3) / 4);
  if (approxBytes > MAX_FILE_SIZE) return "Image is larger than 5MB";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageFile, controls } = body as {
      imageFile?: ImageFile;
      controls: DesignControls;
    };

    if (!controls?.theme || !controls?.subTheme || !controls?.budget) {
      return NextResponse.json(
        { error: "Theme, style and budget are required." },
        { status: 400 }
      );
    }

    const imageError = validateImage(imageFile);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }

    const outcome = await generateDesign({
      controls,
      image: imageFile
        ? { base64: imageFile.base64, mimeType: imageFile.mimeType, name: imageFile.name }
        : undefined,
    });

    let designId: number | null = null;
    let saved = false;
    try {
      const design = await createDesign({
        userId: user.id,
        originalImageUrl: imageFile ? `data:${imageFile.mimeType};base64,${imageFile.base64}` : "",
        generatedImageUrl: outcome.image.dataUrl,
        description: outcome.description,
        theme: controls.theme,
        subTheme: controls.subTheme,
        budget: controls.budget,
        prompt: controls.prompt ?? "",
        generatedPrompt: outcome.prompt,
        roomType: controls.roomType ?? outcome.analysis?.roomType ?? null,
        lighting: controls.lighting ?? outcome.analysis?.light ?? null,
        aspectRatio: controls.aspectRatio ?? "4:3",
        provider: outcome.image.provider,
        model: outcome.image.model,
      });
      designId = design.id;
      saved = true;
    } catch (error) {
      console.error("Could not persist design:", error);
    }

    return NextResponse.json({
      imageUrl: outcome.image.dataUrl,
      description: outcome.description,
      descriptionProvider: outcome.descriptionProvider,
      prompt: outcome.prompt,
      provider: outcome.image.provider,
      model: outcome.image.model,
      usedReference: outcome.image.usedReference,
      analysis: outcome.analysis,
      designId,
      saved,
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate design" },
      { status: 500 }
    );
  }
}
