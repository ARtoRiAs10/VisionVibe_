import { NextResponse } from "next/server";
import { providerStatus } from "@/lib/ai/config";
import { isClerkEnabled } from "@/lib/auth";
import { isDatabaseEnabled } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    providers: providerStatus(),
    app: {
      clerk: isClerkEnabled,
      database: isDatabaseEnabled,
    },
  });
}
