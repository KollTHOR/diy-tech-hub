import { requireAuth } from "@/lib/auth-utils";
import ProfileForm from "./profile-form";

export default async function SettingsProfilePage() {
  const session = await requireAuth();
  return <ProfileForm session={session} />;
}
