"use client";

import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ProgressPost {
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
}

interface ProjectProgressPostsProps {
  posts: ProgressPost[];
}

export function ProjectProgressPosts({ posts }: ProjectProgressPostsProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No progress posts yet. Create your first update to share your journey!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Updates</h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <Badge variant="outline">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              )}

              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
