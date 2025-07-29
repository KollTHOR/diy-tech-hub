"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, LogIn } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ProgressPostCommentsProps {
  progressPostId: string;
  className?: string;
}

export function ProgressPostComments({
  progressPostId,
  className = "",
}: ProgressPostCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/progress-posts/${progressPostId}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [progressPostId, showComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/progress-posts/${progressPostId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post comment");
      }

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowComments(!showComments);
          if (!showComments && !comments.length) {
            fetchComments();
          }
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{comments.length} comments</span>
      </Button>

      {/* Comments Section */}
      {showComments && (
        <Card className="mt-4">
          <CardContent className="p-4 space-y-4">
            {/* Comment Form */}
            {session ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {session.user.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {newComment.length}/1000 characters
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || !newComment.trim()}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {isSubmitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 border border-border rounded-lg">
                <LogIn className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Please log in to leave a comment
                </p>
                <Button asChild size="sm">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.author.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.author.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
