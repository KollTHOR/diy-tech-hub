"use client";

import { useSession } from "next-auth/react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  User,
  Edit,
  MessageCircle,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { ProgressPostForm } from "@/components/progress-post-form";
import Image from "next/image";
import { ProjectDeleteDialog } from "@/components/project-delete-dialog";
import { useState } from "react";

interface ProjectViewProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    imageUrl: string | null;
    status: string;
    progress: number;
    difficulty: string;
    estimatedHours: number | null;
    actualHours: number | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string | null;
      email: string;
    };
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
        color: string | null;
      };
    }>;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        name: string | null;
      };
    }>;
    // Add progress posts
    progressPosts: Array<{
      id: string;
      title: string;
      content: string;
      imageUrl: string | null;
      createdAt: Date;
      author: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
    _count: {
      comments: number;
    };
  };
}

export default function ProjectView({ project }: ProjectViewProps) {
  const { data: session } = useSession();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header with project title and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-3xl font-bold">{project.title}</h1>
            </div>

            <div className="flex gap-2">
              {/* Add Progress Post button for project owners */}
              {session?.user?.id === project.author.id && (
                <ProgressPostForm
                  projectId={project.id}
                  projectTitle={project.title}
                />
              )}

              {/* Existing Edit button */}
              {session?.user?.id === project.author.id && (
                <Button asChild variant="outline">
                  <Link href={`/projects/${project.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </Link>
                </Button>
              )}

              {/* Delete button */}
              {session?.user?.id === project.author.id && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Project Image */}
          {project.imageUrl && (
            <div className="w-full">
              <Image
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-64 sm:h-80 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Project Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Project Content */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{project.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Posts Section */}
          {project.progressPosts && project.progressPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Updates</CardTitle>
                <CardDescription>
                  Follow the journey of this project through these progress
                  updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.progressPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border-l-2 border-border pl-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant="outline">
                        {formatDistanceToNow(post.createdAt, {
                          addSuffix: true,
                        })}
                      </Badge>
                    </div>

                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    )}

                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{post.author.name || "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({project._count.comments})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.comments.length > 0 ? (
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-l-2 border-border pl-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.author.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {comment.author.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No comments yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Author */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Created by:</span>{" "}
                  {project.author.name || "Unknown"}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge variant="outline">{project.status}</Badge>
                </span>
              </div>

              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="text-muted-foreground">Difficulty:</span>{" "}
                  <Badge variant="outline">{project.difficulty}</Badge>
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>

              {/* Estimated Hours */}
              {project.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Estimated:</span>{" "}
                    {project.estimatedHours}h
                  </span>
                </div>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(({ tag }) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{ backgroundColor: tag.color || undefined }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ProjectDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        projectId={project.id}
        projectName={project.title}
      />
    </div>
  );
}
