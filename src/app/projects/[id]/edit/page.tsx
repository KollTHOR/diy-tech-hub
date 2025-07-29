import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import ProjectEditForm from "./project-edit-form";

interface ProjectEditPageProps {
  params: {
    id: string;
  };
}

async function getProject(id: string, userId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
        // Ensure user can only edit their own projects
        authorId: userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return project;
  } catch (error) {
    console.error("Failed to fetch project for editing:", error);
    return null;
  }
}

export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const session = await requireAuth();
  const project = await getProject(params.id, session.user.id);

  if (!project) {
    notFound();
  }

  return <ProjectEditForm project={project} />;
}
