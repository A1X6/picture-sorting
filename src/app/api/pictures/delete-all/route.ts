import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { deleteAllPictures } from '@/lib/data';

export async function DELETE() {
  try {
    // Get all picture URLs and delete from database
    const pictureUrls = await deleteAllPictures();
    
    // Delete all blobs from Vercel Blob storage if there are any
    if (pictureUrls.length > 0) {
      await del(pictureUrls);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${pictureUrls.length} pictures from both database and blob storage` 
    });
  } catch (error) {
    console.error('Failed to delete all pictures:', error);
    return NextResponse.json({ 
      error: 'Failed to delete all pictures' 
    }, { status: 500 });
  }
} 