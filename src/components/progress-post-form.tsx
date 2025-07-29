"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, X, PlusCircle } from "lucide-react";
import Image from "next/image";

interface ProgressPostFormProps {
  projectId: string;
  projectTitle: string;
  trigger?: React.ReactNode;
}

export function ProgressPostForm({
  projectId,
  projectTitle,
  trigger,
}: ProgressPostFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });

  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service like Cloudinary
      // For now, we'll use a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/progress-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create progress post");
      }

      toast.success("Progress post created successfully!");

      // Reset form
      setFormData({ title: "", content: "", imageUrl: "" });
      setImagePreview("");
      setOpen(false);

      // Refresh the page to show the new post
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create progress post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", imageUrl: "" });
    setImagePreview("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Progress Post
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Progress Post</DialogTitle>
          <DialogDescription>
            Share an update about your progress on &quot;{projectTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  placeholder="What did you accomplish?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={200}
                />
                <div className="text-xs text-muted-foreground">
                  {formData.title.length}/200 characters
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Progress Update *</Label>
                <Textarea
                  id="content"
                  placeholder="Describe what you worked on, what you learned, challenges you faced, next steps, etc..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Progress Photo (optional)</Label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="progress-image-upload"
                  />
                  <Label
                    htmlFor="progress-image-upload"
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      Upload Progress Photo
                    </div>
                  </Label>
                </div>

                {imagePreview && (
                  <div className="relative w-full max-w-md">
                    <Image
                      src={imagePreview}
                      alt="Progress preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview("");
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Progress Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
