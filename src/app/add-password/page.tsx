import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddPasswordForm from "./add-password-form";

export default async function AddPasswordPage() {
  const session = await getServerSession(authOptions);

  // Only redirect if NOT authenticated - we need them to be logged in
  if (!session) {
    redirect("/login");
  }

  return <AddPasswordForm session={session} />;
}
