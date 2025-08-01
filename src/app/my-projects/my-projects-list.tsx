"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Eye, MessageCircle, Calendar } from "lucide-react";
import Image from "next/image";
import {
  getStatusBadgeProps,
  formatStatusLabel,
  type ProjectStatus,
} from "@/lib/status-utils"; // ✅ Import from centralized utility

interface Project {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  difficulty: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface MyProjectsListProps {
  projects: Project[];
}

// ✅ Remove the STATUS_COLORS constant - now using centralized utility

export default function MyProjectsList({ projects }: MyProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              Manage your DIY projects and tutorials
            </p>
          </div>
          <Button asChild>
            <Link href="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>
              You haven&apos;t created any projects yet. Start sharing your DIY
              creations!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                Create your first project to get started
              </div>
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">
            Manage your DIY projects and tutorials ({projects.length} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          // ✅ Use centralized status utility
          const statusBadgeProps = getStatusBadgeProps(
            project.status as ProjectStatus
          );

          return (
            <Card
              key={project.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="line-clamp-2 text-lg">
                      {project.title}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {!project.isPublished && (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-500 text-orange-600"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {project.imageUrl && (
                <div className="px-6 pb-3">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={400}
                    height={192}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}

              <CardContent className="space-y-4">
                {/* Status and Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {/* ✅ Use centralized status badge props */}
                    <Badge className={statusBadgeProps.className}>
                      {statusBadgeProps.children}
                    </Badge>
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map(({ tag }) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color
                            ? `${tag.color}20`
                            : undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {project._count.comments}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/projects/${project.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/projects/${project.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
