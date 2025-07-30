/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X, Plus, Upload, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProjectDeleteDialog } from "@/components/project-delete-dialog";
import { MilestoneInput } from "@/components/milestone-input";

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date;
  isCompleted: boolean;
  completedAt: Date | null;
  order: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  content: string;
  imageUrl: string | null;
  status: string;
  progress: number;
  difficulty: string;
  isPublished: boolean;
  tags: Array<{
    tag: Tag;
  }>;
  milestones: Milestone[]; // Add milestones to project interface
}

interface ProjectEditFormProps {
  project: Project;
}

interface MilestoneInputType {
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
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
  { value: "ON_HOLD", label: "On Hold", description: "Temporarily paused" },
  { value: "CANCELLED", label: "Cancelled", description: "Project cancelled" },
];

export default function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    project.tags.map((pt) => pt.tag)
  );
  const [newTagName, setNewTagName] = useState("");
  const [imagePreview, setImagePreview] = useState<string>(
    project.imageUrl || ""
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state initialized with project data
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    content: project.content,
    imageUrl: project.imageUrl || "",
    status: project.status,
    difficulty: project.difficulty,
    isPublished: project.isPublished,
  });

  // Initialize milestones from project data
  const [milestones, setMilestones] = useState<MilestoneInputType[]>(
    project.milestones.length > 0
      ? project.milestones
          .sort((a, b) => a.order - b.order)
          .map((m) => ({
            title: m.title,
            description: m.description || "",
            targetDate: m.targetDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
            isCompleted: m.isCompleted,
          }))
      : [
          {
            title: "",
            description: "",
            targetDate: "",
            isCompleted: false,
          },
        ]
  );

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

    const invalidMilestone = milestones.find(
      (m) => !m.title.trim() || !m.targetDate
    );
    if (invalidMilestone) {
      toast.error("Please fill in all milestone titles and dates");
      return;
    }

    // Validate milestone dates are in chronological order
    const sortedMilestones = [...milestones].sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
    for (let i = 1; i < sortedMilestones.length; i++) {
      if (
        new Date(sortedMilestones[i].targetDate) <=
        new Date(sortedMilestones[i - 1].targetDate)
      ) {
        toast.error("Milestone dates must be in chronological order");
        return;
      }
    }

    setIsLoading(true);

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl,
        status: formData.status,
        difficulty: formData.difficulty,
        isPublished: formData.isPublished,
        tagIds: selectedTags.map((t) => t.id),
        milestones: milestones, // Add milestones to the request
      };

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Project updated successfully!");
        router.push(`/projects/${project.id}`);
      } else {
        toast.error(data.error || "Failed to update project");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">
            Update your project details and content
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Project
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your project details</CardDescription>
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
            <CardDescription>Update your project cover image</CardDescription>
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
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </div>
                </Label>
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-md">
                  <Image
                    src={imagePreview}
                    alt="Project preview"
                    width={400}
                    height={192}
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
              Update tags to help others find your project
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

        {/* Milestones - Replace the estimated/actual hours section */}
        <MilestoneInput milestones={milestones} onChange={setMilestones} />

        {/* Project Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>
              Update project status and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
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
                  onValueChange={(value) => handleInputChange("status", value)}
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
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
            <CardDescription>Update visibility settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="publish"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublished", checked)
                }
              />
              <Label htmlFor="publish">Published (visible to everyone)</Label>
            </div>
            {!formData.isPublished && (
              <p className="text-sm text-muted-foreground mt-2">
                Your project is currently saved as a draft and only visible to
                you
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Updating Project..." : "Update Project"}
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

        {/* Delete Confirmation Dialog */}
        <ProjectDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          projectId={project.id}
          projectName={project.title}
        />
      </form>
    </div>
  );
}
