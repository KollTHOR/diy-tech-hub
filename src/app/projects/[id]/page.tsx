import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProjectView from "./project-view";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

async function getProject(id: string) {
  try {
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return <ProjectView project={project} />;
}
