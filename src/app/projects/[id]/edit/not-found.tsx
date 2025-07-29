import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditProjectNotFound() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The project you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have
            permission to edit it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/my-projects">My Projects</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/projects">Browse Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
