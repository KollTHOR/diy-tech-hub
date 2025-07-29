import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProjectNotFound() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The project you&apos;re looking for doesn&apos;t exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/projects">Browse Projects</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/my-projects">My Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
