import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import MyProjectsList from "./my-projects-list";

async function getUserProjects(userId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        authorId: userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return projects;
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return [];
  }
}

export default async function MyProjectsPage() {
  const session = await requireAuth();
  const projects = await getUserProjects(session.user.id);

  return <MyProjectsList projects={projects} />;
}
