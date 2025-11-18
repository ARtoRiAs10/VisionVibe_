import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { decorateImage } from '@/lib/gemini/service';
import { db } from '@/lib/db';
import { designs, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { VisionVibeControls, ImageFile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageFile, controls }: { imageFile: ImageFile; controls: VisionVibeControls } = body;

    if (!imageFile || !controls) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate decorated image
    const generatedImageUrl = await decorateImage(imageFile, controls);

    // Save to database
    const design = await db.insert(designs).values({
      userId: user.id,
      originalImageUrl: imageFile.base64, // Or store in cloud storage
      generatedImageUrl,
      theme: controls.theme,
      subTheme: controls.subTheme,
      budget: controls.budget,
      prompt: controls.prompt,
    }).returning();

    return NextResponse.json(
      { 
        generatedImageUrl,
        designId: design[0]?.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in decorate-image API:', error);
    return NextResponse.json(
      { error: 'Failed to generate decorated image' },
      { status: 500 }
    );
  }
}
