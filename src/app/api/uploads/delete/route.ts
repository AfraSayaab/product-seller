import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, AWS_BUCKET } from "@/lib/s3";
import { ok ,fail } from "@/lib/responses";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json(fail("key is required"), { status: 400 });

    await s3.send(new DeleteObjectCommand({ Bucket: AWS_BUCKET, Key: key }));
    return NextResponse.json(ok({ deleted: true }));
  } catch (err: any) {
    console.error("/api/upload DELETE error", err);
    return NextResponse.json(fail("Failed to delete file", "DELETE_ERROR"), { status: 500 });
  }
}


