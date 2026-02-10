// src/app/api/admin/blogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, AWS_BUCKET, PUBLIC_CDN_URL } from "@/lib/s3";
import path from "path";

const dbUrl = process.env.DATABASE_URL!;
const AWS_REGION = process.env.AWS_REGION!;

export interface Blog {
  id: number;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  schema_markup: string | null;
  content: string | null;
  image: string | null;
  image_alt: string | null;
  is_published: boolean;
  category_id: number | null;   // 🔥 added category
  created_at: string;
  updated_at: string;
}

/* -------------------- GET all blogs -------------------- */
export async function GET(req: NextRequest) {
  const connection = await mysql.createConnection(dbUrl);

  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM blogs ORDER BY created_at DESC"
    );

    return NextResponse.json(rows as Blog[]);
  } catch (err) {
    console.error("GET blogs error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

/* -------------------- POST new blog -------------------- */
export async function POST(req: NextRequest) {
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
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null; // 🔥 new category

  
  const imageFile = formData.get("image") as File | null;

 let imageUrl: string | null = null;

if (imageFile && imageFile.size > 0) {
  if (!imageFile.type.startsWith("image/")) {
    return NextResponse.json({ message: "Invalid image file" }, { status: 400 });
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
      // ACL removed
    })
  );

  imageUrl = PUBLIC_CDN_URL
    ? `${PUBLIC_CDN_URL}/${key}`
    : `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}


  const connection = await mysql.createConnection(dbUrl);

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO blogs
        (title, slug, meta_title, meta_description, keywords, schema_markup, content, image, image_alt, is_published, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        schemaMarkup,
        content,
        imageUrl,
        imageAlt,
        isPublished,
        categoryId, // 🔥 save category
      ]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error("POST blog error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
