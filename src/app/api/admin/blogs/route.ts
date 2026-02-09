// src/app/api/admin/blogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();
const dbUrl = process.env.DATABASE_URL!;

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
  created_at: string;
  updated_at: string;
}

// -------------------- GET all blogs --------------------
export async function GET(req: NextRequest) {
  const connection = await mysql.createConnection(dbUrl);
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM blogs ORDER BY created_at DESC"
    );
    return NextResponse.json(rows as Blog[]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}

// -------------------- POST new blog --------------------
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
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO blogs 
      (title, slug, meta_title, meta_description, keywords, schema_markup, content, image, image_alt, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, metaTitle, metaDescription, keywords, schemaMarkup, content, imagePath, imageAlt, isPublished]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
