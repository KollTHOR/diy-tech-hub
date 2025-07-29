"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { ProgressPostComments } from "./progress-post-comments";

interface ProgressPostCardProps {
  post: {
    id: string;
    title: string;
    createdAt: Date;
    content: string;
    author: { id: string; name: string | null; image: string | null };
    project: {
      id: string;
      title: string;
      imageUrl: string | null;
      progress: number;
      tags: { tag: { id: string; name: string; color: string | null } }[];
    };
  };
}

export function ProgressPostCard({ post }: ProgressPostCardProps) {
  const preview =
    post.content.slice(0, 160) + (post.content.length > 160 ? "…" : "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          <Link
            href={`/projects/${post.project.id}`}
            className="hover:underline"
          >
            {post.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {post.author.name ?? "Unknown"} •{" "}
          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {post.project.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <Image
            src={post.project.imageUrl}
            alt={post.project.title}
            className="w-full h-48 object-cover rounded-md border"
          />
        )}

        <p>{preview}</p>

        <div className="flex flex-wrap gap-2">
          {post.project.tags.map(({ tag }) => (
            <Badge key={tag.id} style={{ background: tag.color ?? undefined }}>
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">Progress:</span>
          <Progress value={post.project.progress} className="flex-1" />
          <span className="text-xs">{post.project.progress}%</span>
        </div>

        <Link
          href={`/projects/${post.project.id}`}
          className="inline-block text-sm font-medium underline"
        >
          Read more →
        </Link>

        <ProgressPostComments progressPostId={post.id} />
      </CardContent>
    </Card>
  );
}
