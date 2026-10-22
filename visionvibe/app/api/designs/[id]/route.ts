import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deleteDesign, getDesign, updateDesign } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const design = await getDesign(Number(id), user.id);
    if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 });

    return NextResponse.json({ design });
  } catch (error) {
    console.error("Error loading design:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to load design" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.isFavorite === "boolean") updates.isFavorite = body.isFavorite;
    if (typeof body.isPublic === "boolean") updates.isPublic = body.isPublic;
    if (typeof body.title === "string") updates.theme = body.title;
    if (typeof body.prompt === "string") updates.prompt = body.prompt;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const design = await updateDesign(Number(id), updates as any, user.id);
    if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 });

    return NextResponse.json({ design });
  } catch (error) {
    console.error("Error updating design:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to update design" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const deleted = await deleteDesign(Number(id), user.id);
    if (!deleted) return NextResponse.json({ error: "Design not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting design:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to delete design" },
      { status: 500 }
    );
  }
}
