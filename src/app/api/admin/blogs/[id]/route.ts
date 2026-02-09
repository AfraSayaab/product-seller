//src\app\api\admin\blogs\[id]\route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import dotenv from "dotenv";

import path from "path";
import fs from "fs/promises";

dotenv.config();
const dbUrl = process.env.DATABASE_URL!;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 🔥 IMPORTANT: await params
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
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}



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

  let imagePath: string | null = null;

  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(imageFile.name);
    const fileName = `blog-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    imagePath = `/uploads/${fileName}`;
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
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
      imagePath,
      imageAlt,
      isPublished ? 1 : 0,
      blogId,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const blogId = Number(id);

  if (Number.isNaN(blogId)) {
    return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
  }

  const connection = await mysql.createConnection(dbUrl);

  try {
    // 1️⃣ First, fetch the blog to get the image path
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT image FROM blogs WHERE id = ? LIMIT 1",
      [blogId]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const blog = rows[0];
    const imagePath = blog.image ? path.join(process.cwd(), "public", blog.image) : null;

    // 2️⃣ Delete the blog from database
    await connection.execute("DELETE FROM blogs WHERE id = ?", [blogId]);

    // 3️⃣ Delete the image file if exists
    if (imagePath) {
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (err) {
        console.warn(`Failed to delete image file: ${imagePath}`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to delete blog" }, { status: 500 });
  } finally {
    await connection.end();
  }
}