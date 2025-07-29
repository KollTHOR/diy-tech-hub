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
      // Add progress posts if you want them
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
      // Fix the _count - remove it for now or use proper syntax
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
