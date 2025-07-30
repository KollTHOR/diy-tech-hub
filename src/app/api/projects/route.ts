/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
        // ✅ Removed progress field
        tags:
          tags && tags.length > 0
            ? {
                create: tags.map((tagId: string) => ({
                  tag: {
                    connect: {
                      id: tagId,
                    },
                  },
                })),
              }
            : undefined,
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

    // ✅ No longer need to calculate and update progress

    return NextResponse.json(project);
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
