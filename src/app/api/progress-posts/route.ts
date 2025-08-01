import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/progress-posts?take=10&cursor=<id>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") ?? 10);
  const cursor = searchParams.get("cursor") ?? undefined;

  const posts = await prisma.progressPost.findMany({
    where: { project: { isPublished: true } },
    orderBy: { createdAt: "desc" },
    take: take + 1, // grab one extra to know if there’s more
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      author: { select: { id: true, name: true, image: true } },
      project: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          tags: { include: { tag: true } },
        },
      },
    },
  });

  const nextCursor = posts.length > take ? posts.pop()!.id : undefined;
  return NextResponse.json({ posts, nextCursor });
}

// POST /api/progress-posts - create new progress post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, imageUrl, projectId } = await req.json();

    // Validation
    if (!title || !content || !projectId) {
      return NextResponse.json(
        { error: "Title, content, and project ID are required" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Verify project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        authorId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Create progress post
    const progressPost = await prisma.progressPost.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        projectId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        project: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json(progressPost, { status: 201 });
  } catch (error) {
    console.error("Error creating progress post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
