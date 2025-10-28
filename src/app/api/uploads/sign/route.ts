
import { NextRequest, NextResponse } from "next/server";
import { s3, AWS_BUCKET, PUBLIC_CDN_URL } from "@/lib/s3";
import { ok ,fail } from "@/lib/responses";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "crypto";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filename,
      contentType,
      folder = "uploads",
      maxSizeMB = 10, // optional—frontend should mirror this
    } = body || {};

    if (!filename || !contentType) {
      return NextResponse.json(fail("filename and contentType are required"), { status: 400 });
    }

    const key = `${folder}/${randomUUID()}-${slugify(filename)}`;

    // Enforce basic security via conditions: content type + max size
    const maxBytes = Math.max(1, Math.min(1024 * 1024 * 100, Math.floor(maxSizeMB * 1024 * 1024)));

    const presigned = await createPresignedPost(s3 as any, {
      Bucket: AWS_BUCKET,
      Key: key,
      Conditions: [["content-length-range", 1, maxBytes], ["starts-with", "$Content-Type", ""]],
      Fields: {
        // Lock the content type for S3 metadata
        "Content-Type": contentType,
      },
      Expires: 60, // seconds
    });

    const publicUrl = PUBLIC_CDN_URL
      ? `${PUBLIC_CDN_URL}/${key}`
      : `https://${AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json(ok({
      url: presigned.url,
      fields: presigned.fields,
      key,
      publicUrl,
    }));
  } catch (err: any) {
    console.error("/api/upload/sign error", err);
    return NextResponse.json(fail("Failed to sign upload", "SIGN_ERROR"), { status: 500 });
  }
}
