"use client";

import { useState } from "react";
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
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

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
    _count: {
      comments: number;
    };
  };
}

const STATUS_COLORS = {
  PLANNING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ON_HOLD:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const DIFFICULTY_COLORS = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INTERMEDIATE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ADVANCED:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  EXPERT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function ProjectView({ project }: ProjectViewProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === project.author.id;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to my projects
              </Link>
            </Button>
            {!project.isPublished && (
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-600"
              >
                Draft
              </Badge>
            )}
          </div>
          {isAuthor && (
            <Button asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Link>
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          {project.description && (
            <p className="text-xl text-muted-foreground mb-6">
              {project.description}
            </p>
          )}
        </div>

        {/* Project Image */}
        {project.imageUrl && (
          <div className="w-full max-w-2xl mx-auto">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">{project.content}</div>
              </div>
            </CardContent>
          </Card>

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
                      className="flex gap-3 p-4 border rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {comment.author.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {project.author.name || "Anonymous"}
                  </div>
                  <div className="text-xs text-muted-foreground">Creator</div>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <Badge
                  className={
                    STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]
                  }
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Difficulty</div>
                <Badge
                  className={
                    DIFFICULTY_COLORS[
                      project.difficulty as keyof typeof DIFFICULTY_COLORS
                    ]
                  }
                >
                  {project.difficulty}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="w-full" />
              </div>

              {/* Estimated Hours */}
              {project.estimatedHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{project.estimatedHours}h</div>
                    <div className="text-xs text-muted-foreground">
                      Estimated
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(({ tag }) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-muted"
                      style={{
                        backgroundColor: tag.color
                          ? `${tag.color}20`
                          : undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
