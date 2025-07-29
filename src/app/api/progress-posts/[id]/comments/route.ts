import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/progress-posts/[id]/comments - fetch comments for a progress post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.comment.findMany({
      where: { progressPostId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching progress post comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/progress-posts/[id]/comments - create a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be 1000 characters or less" },
        { status: 400 }
      );
    }

    // Verify progress post exists and is from a published project
    const progressPost = await prisma.progressPost.findFirst({
      where: {
        id,
        project: { isPublished: true },
      },
    });

    if (!progressPost) {
      return NextResponse.json(
        { error: "Progress post not found or not public" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        progressPostId: id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating progress post comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
