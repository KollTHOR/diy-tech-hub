/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X, Plus, Upload } from "lucide-react";

interface ProjectFormProps {
  session: Session;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
}

const DIFFICULTY_OPTIONS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    description: "Perfect for first-time makers",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "Some experience required",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    description: "Solid making experience needed",
  },
  {
    value: "EXPERT",
    label: "Expert",
    description: "Professional-level skills required",
  },
];

const STATUS_OPTIONS = [
  {
    value: "PLANNING",
    label: "Planning",
    description: "Still in planning phase",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    description: "Currently working on it",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Project is finished",
  },
];

export default function ProjectForm({ session }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    status: "PLANNING",
    progress: [0],
    difficulty: "BEGINNER",
    estimatedHours: "",
    isPublished: false,
  });

  // Fetch available tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags([...availableTags, newTag]);
        addTag(newTag);
        setNewTagName("");
        toast.success("Tag created and added!");
      } else {
        toast.error("Failed to create tag");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Project content is required");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl,
        status: formData.status,
        progress: formData.progress[0],
        difficulty: formData.difficulty,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : null,
        isPublished: formData.isPublished,
        tagIds: selectedTags.map((t) => t.id),
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Project created successfully!");
        router.push(`/projects/${data.id}`);
      } else {
        toast.error(data.error || "Failed to create project");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Share your DIY project with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome DIY Project"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                maxLength={100}
              />
              <div className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                placeholder="A brief description of your project..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                maxLength={200}
                rows={3}
              />
              <div className="text-xs text-muted-foreground">
                {formData.description.length}/200 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Project Details *</Label>
              <Textarea
                id="content"
                placeholder="Detailed instructions, materials needed, step-by-step guide..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={8}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Project Image</CardTitle>
            <CardDescription>
              Add a cover image for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </div>
                </Label>
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Project preview"
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

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags *</CardTitle>
            <CardDescription>
              Add tags to help others find your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label>Available Tags</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTags
                    .filter(
                      (tag) => !selectedTags.find((st) => st.id === tag.id)
                    )
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => addTag(tag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Create New Tag */}
            <div className="space-y-2">
              <Label>Create New Tag</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && createNewTag()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={createNewTag}
                  disabled={!newTagName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Additional information about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: any) =>
                    handleInputChange("difficulty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project Progress: {formData.progress[0]}%</Label>
              <Slider
                value={formData.progress}
                onValueChange={(value: any) => handleInputChange("progress", value)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                placeholder="How many hours do you estimate this will take?"
                value={formData.estimatedHours}
                onChange={(e) =>
                  handleInputChange("estimatedHours", e.target.value)
                }
                min="1"
                max="1000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
            <CardDescription>
              Choose how you want to share your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="publish"
                checked={formData.isPublished}
                onCheckedChange={(checked: any) =>
                  handleInputChange("isPublished", checked)
                }
              />
              <Label htmlFor="publish">
                Publish immediately (make it visible to everyone)
              </Label>
            </div>
            {!formData.isPublished && (
              <p className="text-sm text-muted-foreground mt-2">
                Your project will be saved as a draft and only visible to you
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading
              ? "Creating Project..."
              : formData.isPublished
              ? "Create & Publish Project"
              : "Save as Draft"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
