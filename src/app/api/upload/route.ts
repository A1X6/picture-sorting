import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate users before generating the token in production
        
        return {
          allowedContentTypes: [
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/webp', 
            'image/gif',
            'image/bmp',
            'image/tiff'
          ],
          addRandomSuffix: true,
          maxSizeInBytes: 50 * 1024 * 1024, // 50MB limit
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log('Blob upload completed:', blob.url);
        
        try {
          // You can add additional logic here if needed
          // For now, we'll handle the metadata saving on the client side
        } catch (error) {
          console.error('Upload completion error:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
} 