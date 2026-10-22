import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt, type DesignControls } from "@/lib/ai";
import { getSessionUser } from "@/lib/auth";

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, controls } = body as {
      prompt?: string;
      controls: DesignControls;
    };

    if (!controls) {
      return NextResponse.json({ error: "Missing controls" }, { status: 400 });
    }

    const result = await enhancePrompt({ prompt: prompt ?? "", controls });

    return NextResponse.json({ prompt: result.prompt, provider: result.provider });
  } catch (error) {
    console.error("Error in enhance-prompt API:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
