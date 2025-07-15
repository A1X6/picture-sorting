import { NextRequest, NextResponse } from 'next/server';
import { getPictures, addPicture } from '@/lib/data';

export async function GET() {
  try {
    const pictures = await getPictures();
    return NextResponse.json(pictures);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pictures' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, fileName, categoryId, description } = body;
    
    if (!url || !fileName) {
      return NextResponse.json({ error: 'URL and filename are required' }, { status: 400 });
    }
    
    const picture = await addPicture({ url, fileName, categoryId, description });
    return NextResponse.json(picture, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add picture' }, { status: 500 });
  }
} 