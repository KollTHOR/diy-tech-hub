import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Fetch tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new tag
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if tag already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [{ name: { equals: name.trim(), mode: "insensitive" } }, { slug }],
      },
    });

    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        color: generateRandomColor(),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
