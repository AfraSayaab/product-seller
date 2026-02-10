import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 6);
  const offset = (page - 1) * limit;

  const category = searchParams.get("category"); // NEW
  const exclude = searchParams.get("exclude");   // NEW

  const connection = await mysql.createConnection(dbUrl);

  try {
    /* ---------- WHERE CONDITIONS ---------- */
    let where = `WHERE b.is_published = 1`;
    const params: any[] = [];

    if (category) {
      where += ` AND c.name = ?`;
      params.push(category);
    }

    if (exclude) {
      where += ` AND b.slug != ?`;
      params.push(exclude);
    }

    /* ---------- TOTAL COUNT ---------- */
    const [[{ total }]] = await connection.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as total
      FROM blogs b
      LEFT JOIN Category c ON b.category_id = c.id
      ${where}
      `,
      params
    );

    /* ---------- BLOG LIST ---------- */
    const [rows] = await connection.query<RowDataPacket[]>(
      `
      SELECT 
        b.slug,
        b.title,
        b.meta_description AS excerpt,
        b.image,
        DATE_FORMAT(b.created_at, '%Y-%m-%d') AS date,
        DATE_FORMAT(b.created_at, '%M %Y') AS month,
        c.name AS category,
        b.keywords
      FROM blogs b
      LEFT JOIN Category c ON b.category_id = c.id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    /* ---------- TRANSFORM DATA ---------- */
    const data = rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      image: row.image || "/placeholder.webp",
      date: row.date,
      month: row.month,
      category: row.category || "Uncategorized",
      tags: row.keywords
        ? row.keywords.split(",").map((t: string) => t.trim())
        : [],
    }));

    return NextResponse.json({
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Public blog GET error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
