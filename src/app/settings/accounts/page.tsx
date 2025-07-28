import { requireAuth } from "@/lib/auth-utils";
import AccountsSettings from "./accounts-settings";

export default async function AccountsPage() {
  // Ensure user is authenticated before showing the page
  await requireAuth();
  return <AccountsSettings />;
}
