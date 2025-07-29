/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateProgressFromMilestones } from "@/lib/milestone-utils";

// POST - Create new project
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      content,
      imageUrl,
      difficulty,
      status,
      isPublished,
      tags,
      milestones,
    } = await req.json();

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // FIXED: Remove tag requirement - tags are optional
    // if (!tags || tags.length === 0) {
    //   return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
    // }

    if (!milestones || milestones.length === 0) {
      return NextResponse.json(
        { error: "At least one milestone is required" },
        { status: 400 }
      );
    }

    // Validate milestone dates are in order
    const sortedMilestones = [...milestones].sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    // Create project with tags and milestones
    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        imageUrl,
        difficulty,
        status,
        isPublished,
        authorId: session.user.id,
        progress: 0, // Will be calculated after milestones are created
        // Create tags relationship - handle empty tags array
        tags:
          tags && tags.length > 0
            ? {
                create: tags.map((tagId: string, index: number) => ({
                  tag: {
                    connect: {
                      id: tagId,
                    },
                  },
                })),
              }
            : undefined,
        // Create milestones
        milestones: {
          create: sortedMilestones.map((milestone: any, index: number) => ({
            title: milestone.title,
            description: milestone.description,
            targetDate: new Date(milestone.targetDate),
            isCompleted: milestone.isCompleted || false,
            order: index + 1,
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        milestones: true,
      },
    });

    // Calculate and update progress based on milestones
    const progress = calculateProgressFromMilestones(project.milestones);
    await prisma.project.update({
      where: { id: project.id },
      data: { progress },
    });

    return NextResponse.json({ ...project, progress });
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
