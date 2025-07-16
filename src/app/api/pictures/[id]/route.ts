import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { updatePictureCategory, deletePicture } from "@/lib/data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categoryId } = body;

    await updatePictureCategory(id, categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update picture" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Delete from database and get the blob URL
    const blobUrl = await deletePicture(id);

    // Delete from Vercel Blob storage if URL exists
    if (blobUrl) {
      await del(blobUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete picture" },
      { status: 500 }
    );
  }
}
