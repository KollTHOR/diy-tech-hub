import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST - Create new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      title,
      description,
      content,
      imageUrl,
      status,
      progress,
      difficulty,
      estimatedHours,
      isPublished,
      tagIds,
    } = await req.json();

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Project content is required" },
        { status: 400 }
      );
    }

    if (!tagIds || tagIds.length === 0) {
      return NextResponse.json(
        { error: "At least one tag is required" },
        { status: 400 }
      );
    }

    // Create project with tags
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || null,
        status: status || "PLANNING",
        progress: progress || 0,
        difficulty: difficulty || "BEGINNER",
        estimatedHours: estimatedHours || null,
        isPublished: isPublished || false,
        authorId: session.user.id,
        tags: {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      title,
      description,
      content,
      imageUrl,
      status,
      progress,
      difficulty,
      estimatedHours,
      actualHours,
      isPublished,
      tagIds,
    } = await req.json();

    // Verify project ownership
    const existingProject = await prisma.project.findUnique({
      where: {
        id: params.id,
        authorId: session.user.id, // Ensure user owns the project
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Project content is required" },
        { status: 400 }
      );
    }

    if (!tagIds || tagIds.length === 0) {
      return NextResponse.json(
        { error: "At least one tag is required" },
        { status: 400 }
      );
    }

    // Update project with tags
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || null,
        status: status || "PLANNING",
        progress: progress || 0,
        difficulty: difficulty || "BEGINNER",
        estimatedHours: estimatedHours || null,
        actualHours: actualHours || null,
        isPublished: isPublished || false,
        // Update tags - remove old ones and add new ones
        tags: {
          deleteMany: {}, // Remove all existing tags
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
