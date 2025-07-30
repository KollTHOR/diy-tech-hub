// src/components/progress-post-card.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProgressPostComments } from "./progress-post-comments";
import { ProjectMilestoneProgressBar } from "./project-milestone-progress-bar";

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
      tags: { tag: { id: string; name: string; color: string | null } }[];
      createdAt: Date;
      milestones: Array<{
        id: string;
        title: string;
        description: string | null;
        targetDate: Date;
        isCompleted: boolean;
        completedAt: Date | null;
        order: number;
      }>;
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
          <Image
            src={post.project.imageUrl}
            alt={post.project.title}
            width={400}
            height={192}
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

        {/* ✅ Updated Progress Bar - No progress prop needed */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Progress
          </span>
          <ProjectMilestoneProgressBar
            milestones={post.project.milestones.map((m) => ({
              title: m.title,
              description: m.description,
              targetDate: m.targetDate.toISOString().split("T")[0],
              isCompleted: m.isCompleted,
              completedAt: m.completedAt,
              order: m.order,
            }))}
            creationDate={post.project.createdAt}
          />
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
