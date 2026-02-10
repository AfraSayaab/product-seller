import { NextRequest, NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL!;

type ContextProps = {
  params: Promise<{ slug: string }>; // ✅ params is Promise
};

export async function GET(req: NextRequest, context: ContextProps) {
  // ✅ unwrap params
  const { slug } = await context.params;

 

  if (!slug) {
    return NextResponse.json(
      { message: "Slug is missing" },
      { status: 400 }
    );
  }
 
  const connection = await mysql.createConnection(dbUrl);

  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `
      SELECT 
        b.slug,
        b.title,
        b.meta_description AS excerpt,
        b.image,
        b.content,
        b.keywords,
        DATE_FORMAT(b.created_at, '%Y-%m-%d') AS date,
        DATE_FORMAT(b.created_at, '%M %Y') AS month,
        c.name AS category
      FROM blogs b
      LEFT JOIN Category c ON b.category_id = c.id
      WHERE LOWER(b.slug) = LOWER(?) AND b.is_published = 1
      LIMIT 1
      `,
      [slug]
    );


    if (rows.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
