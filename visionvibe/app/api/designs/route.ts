import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listDesigns } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const designs = await listDesigns(user.id);
    return NextResponse.json({ designs });
  } catch (error) {
    console.error("Error listing designs:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to load designs" },
      { status: 500 }
    );
  }
}
