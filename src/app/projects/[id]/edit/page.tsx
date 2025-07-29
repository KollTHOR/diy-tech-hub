import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import ProjectEditForm from "./project-edit-form";

interface ProjectEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      // Add milestones to the query
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Ensure user can only edit their own projects
  if (project && project.authorId !== userId) {
    return null;
  }

  return project;
}

export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const session = await requireAuth();

  // Fix: Await params before accessing its properties
  const { id } = await params;
  const project = await getProject(id, session.user.id);

  if (!project) {
    notFound();
  }

  return <ProjectEditForm project={project} />;
}
