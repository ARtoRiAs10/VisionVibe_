import { NextRequest, NextResponse } from "next/server";
import { generateDesign, type DesignControls } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { createDesign } from "@/lib/db/repository";
import type { ImageFile } from "@/types";

export const maxDuration = 300;

/**
 * Legacy endpoint kept for backwards compatibility — it now delegates to
 * the same generation pipeline as /api/generate.
 */
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

    if (!controls) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const outcome = await generateDesign({
      controls,
      image: imageFile
        ? { base64: imageFile.base64, mimeType: imageFile.mimeType, name: imageFile.name }
        : undefined,
    });

    let designId: number | null = null;
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
        roomType: controls.roomType ?? null,
        lighting: controls.lighting ?? null,
        aspectRatio: controls.aspectRatio ?? null,
        provider: outcome.image.provider,
        model: outcome.image.model,
      });
      designId = design.id;
    } catch (error) {
      console.error("Could not persist design:", error);
    }

    return NextResponse.json({
      generatedImageUrl: outcome.image.dataUrl,
      imageUrl: outcome.image.dataUrl,
      description: outcome.description,
      prompt: outcome.prompt,
      provider: outcome.image.provider,
      model: outcome.image.model,
      usedReference: outcome.image.usedReference,
      designId,
    });
  } catch (error) {
    console.error("Error in decorate-image API:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate decorated image" },
      { status: 500 }
    );
  }
}
