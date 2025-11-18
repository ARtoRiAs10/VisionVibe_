import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { describeImage } from '@/lib/gemini/service';
import { ImageFile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageFile }: { imageFile: ImageFile } = body;

    if (!imageFile) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    const description = await describeImage(imageFile);

    return NextResponse.json({ description }, { status: 200 });
  } catch (error) {
    console.error('Error in describe-image API:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
