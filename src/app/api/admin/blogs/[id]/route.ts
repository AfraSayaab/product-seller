export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, AWS_BUCKET, PUBLIC_CDN_URL } from "@/lib/s3";
import path from "path";

const dbUrl = process.env.DATABASE_URL!;
const AWS_REGION = process.env.AWS_REGION!;

/* -------------------- GET single blog -------------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const blogId = Number(id);

  if (!id || Number.isNaN(blogId)) {
    return NextResponse.json(
      { message: "Missing or invalid blog ID" },
      { status: 400 }
    );
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM blogs WHERE id = ? LIMIT 1",
      [blogId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET blog error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* -------------------- UPDATE blog -------------------- */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const blogId = Number(id);

  if (Number.isNaN(blogId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;
  const keywords = formData.get("keywords") as string;
  const schemaMarkup = formData.get("schemaMarkup") as string;
  const content = formData.get("content") as string;
  const imageAlt = formData.get("imageAlt") as string;
  const isPublished = formData.get("isPublished") === "true";
  const categoryIdRaw = formData.get("categoryId") as string | null;
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null; // 🔥 added

  const imageFile = formData.get("image") as File | null;

  const connection = await mysql.createConnection(dbUrl);

  try {
    /* 1️⃣ Fetch existing image */
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT image FROM blogs WHERE id = ? LIMIT 1",
      [blogId]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const oldImageUrl: string | null = rows[0].image;
    let newImageUrl: string | null = null;

    /* 2️⃣ Upload new image if provided */
    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Invalid image file" },
          { status: 400 }
        );
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(imageFile.name);
      const key = `blogs/${slug}-${Date.now()}${ext}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: imageFile.type,
          ACL: "public-read",
        })
      );

      newImageUrl = PUBLIC_CDN_URL
        ? `${PUBLIC_CDN_URL}/${key}`
        : `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

      /* 3️⃣ Delete old image from S3 */
      if (oldImageUrl) {
        const oldKey = oldImageUrl.split("/").slice(-2).join("/");
        await s3.send(
          new DeleteObjectCommand({
            Bucket: AWS_BUCKET,
            Key: oldKey,
          })
        );
      }
    }

    /* 4️⃣ Update DB including category_id */
    const query = `
      UPDATE blogs SET
        title = ?,
        slug = ?,
        meta_title = ?,
        meta_description = ?,
        keywords = ?,
        schema_markup = ?,
        content = ?,
        image = COALESCE(?, image),
        image_alt = ?,
        is_published = ?,
        category_id = ?,       -- 🔥 updated
        updated_at = NOW()
      WHERE id = ?
    `;

    await connection.execute(query, [
      title,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      schemaMarkup,
      content,
      newImageUrl,
      imageAlt,
      isPublished ? 1 : 0,
      categoryId, // 🔥 pass category_id
      blogId,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH blog error:", err);
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

/* -------------------- DELETE blog -------------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const blogId = Number(id);

  if (Number.isNaN(blogId)) {
    return NextResponse.json(
      { message: "Invalid blog ID" },
      { status: 400 }
    );
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
    /* 1️⃣ Fetch blog image */
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT image FROM blogs WHERE id = ? LIMIT 1",
      [blogId]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const imageUrl: string | null = rows[0].image;

    /* 2️⃣ Delete blog */
    await connection.execute("DELETE FROM blogs WHERE id = ?", [blogId]);

    /* 3️⃣ Delete image from S3 */
    if (imageUrl) {
      const key = imageUrl.split("/").slice(-2).join("/");
      await s3.send(
        new DeleteObjectCommand({
          Bucket: AWS_BUCKET,
          Key: key,
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE blog error:", err);
    return NextResponse.json(
      { message: "Failed to delete blog" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
