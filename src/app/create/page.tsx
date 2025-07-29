import { requireAuth } from "@/lib/auth-utils";
import ProjectForm from "./project-form";

export default async function CreateProjectPage() {
  const session = await requireAuth();
  return <ProjectForm session={session} />;
}
