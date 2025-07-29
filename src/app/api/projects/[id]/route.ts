/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateProgressFromMilestones } from "@/lib/milestone-utils";

// PUT - Update existing project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const {
      title,
      description,
      content,
      imageUrl,
      status,
      difficulty,
      isPublished,
      tagIds,
      milestones, // Add milestones
    } = await req.json();

    // Verify project ownership
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Validation (same as create)
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

    // Update project with tags and milestones
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: content.trim(),
        imageUrl: imageUrl || null,
        status: status || "PLANNING",
        difficulty: difficulty || "BEGINNER",
        isPublished: isPublished || false,
        // Update tags - remove old ones and add new ones
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
        // Update milestones - remove old ones and add new ones
        milestones: {
          deleteMany: {},
          create: milestones.map((milestone: any, index: number) => ({
            title: milestone.title.trim(),
            description: milestone.description?.trim() || null,
            targetDate: new Date(milestone.targetDate),
            order: index + 1,
            isCompleted: milestone.isCompleted || false,
            completedAt: milestone.isCompleted ? new Date() : null,
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
        milestones: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Calculate and update progress
    const calculatedProgress = calculateProgressFromMilestones(
      updatedProject.milestones
    );
    const finalProject = await prisma.project.update({
      where: { id },
      data: { progress: calculatedProgress },
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
        milestones: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(finalProject);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete project (optional, if you want users to delete projects)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Delete project (this will cascade delete related records)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
