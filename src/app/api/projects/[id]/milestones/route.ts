/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateProgressFromMilestones } from "@/lib/milestone-utils";

// POST - Add a new milestone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, targetDate } = await req.json();

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id, authorId: session.user.id },
      include: { milestones: { orderBy: { order: "asc" } } },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Check milestone limit (max 10)
    if (project.milestones.length >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 milestones allowed per project" },
        { status: 400 }
      );
    }

    // Get next order number
    const nextOrder =
      project.milestones.length > 0
        ? Math.max(...project.milestones.map((m) => m.order)) + 1
        : 1;

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        targetDate: new Date(targetDate),
        order: nextOrder,
        projectId: id,
      },
    });

    // Recalculate progress
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: { milestones: { orderBy: { order: "asc" } } },
    });

    if (updatedProject) {
      const newProgress = calculateProgressFromMilestones(
        updatedProject.milestones
      );
      await prisma.project.update({
        where: { id },
        data: { progress: newProgress },
      });
    }

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Add milestone error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle milestone completion or update milestone
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { milestoneId, isCompleted, title, description, targetDate } =
      await req.json();

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id, authorId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Update milestone
    const updateData: any = {};

    if (typeof isCompleted === "boolean") {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    if (title) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (targetDate) updateData.targetDate = new Date(targetDate);

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    // Recalculate progress
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: { milestones: { orderBy: { order: "asc" } } },
    });

    if (updatedProject) {
      const newProgress = calculateProgressFromMilestones(
        updatedProject.milestones
      );
      await prisma.project.update({
        where: { id },
        data: { progress: newProgress },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update milestone error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a milestone
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
    const { milestoneId } = await req.json();

    // Verify project ownership and check milestone count
    const project = await prisma.project.findUnique({
      where: { id, authorId: session.user.id },
      include: { milestones: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // Prevent deleting if only 1 milestone remains
    if (project.milestones.length <= 1) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the last milestone. Projects must have at least 1 milestone.",
        },
        { status: 400 }
      );
    }

    // Delete milestone
    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    // Recalculate progress
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: { milestones: { orderBy: { order: "asc" } } },
    });

    if (updatedProject) {
      const newProgress = calculateProgressFromMilestones(
        updatedProject.milestones
      );
      await prisma.project.update({
        where: { id },
        data: { progress: newProgress },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete milestone error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
