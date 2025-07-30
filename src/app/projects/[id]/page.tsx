import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProjectView from "./project-view";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
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
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      progressPosts: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      milestones: {
        select: {
          id: true,
          projectId: true, // <-- ADD THIS
          title: true,
          description: true,
          targetDate: true,
          isCompleted: true,
          completedAt: true,
          order: true,
          createdAt: true, // <-- ADD THIS
          updatedAt: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return project;
}



export default async function ProjectPage({ params }: ProjectPageProps) {
  // Fix: Await params before accessing its properties
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <ProjectView project={project} />;
}
