/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { X, Plus, Upload, FileText, Tags, Target, Settings } from "lucide-react";
import Image from "next/image";
import { MilestoneInput } from "@/components/milestone-input";

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

interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
}

export default function ProjectForm({ session }: ProjectFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    difficulty: "BEGINNER",
    status: "PLANNING",
    isPublished: false,
  });

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string>("");

  // Tags state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");

  // Milestone state - initialize with one empty milestone
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: "",
      description: "",
      targetDate: "",
      isCompleted: false,
    },
  ]);

  // Validation state for each tab
  const [tabValidation, setTabValidation] = useState({
    basic: false,
    tags: true, // Tags are optional
    milestones: false,
    settings: true, // Settings have defaults
  });

  // Fetch available tags
  useEffect(() => {
    fetchTags();
  }, []);

  // Update tab validation when form data changes
  useEffect(() => {
    // Fixed validation logic
    const basicValid = formData.title.trim() !== "" && formData.content.trim() !== "";
    
    // Milestones: at least one milestone with title and date, filter out empty ones
    const validMilestones = milestones.filter(m => m.title.trim() !== "" && m.targetDate !== "");
    const milestonesValid = validMilestones.length >= 1;
    
    setTabValidation({
      basic: basicValid,
      tags: true, // Tags are always valid (optional)
      milestones: milestonesValid,
      settings: true, // Settings always valid (have defaults)
    });
  }, [formData.title, formData.content, milestones]);

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
      // In a real app, you'd upload to a service like Cloudinary
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange("imageUrl", result);
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
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
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
        toast.success("Tag created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create tag");
      console.error("Failed to create tag:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all tabs
    const allTabsValid = Object.values(tabValidation).every(valid => valid);
    if (!allTabsValid) {
      toast.error("Please complete all required fields");
      return;
    }

    // Filter out empty milestones
    const validMilestones = milestones.filter(
      (m) => m.title.trim() !== "" && m.targetDate !== ""
    );

    if (validMilestones.length === 0) {
      toast.error("At least one milestone is required");
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags.map((tag) => tag.id), // Send tag IDs, not objects
          milestones: validMilestones,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        toast.success("Project created successfully!");
        router.push(`/projects/${project.id}`);
      } else {
        // Fixed error handling - parse JSON properly
        let errorMessage = "Failed to create project";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If not JSON, use response text
          errorMessage = await response.text() || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while creating the project");
      console.error("Project creation error:", error);
    }
  };

  const canProceedToNextTab = (currentTab: string) => {
    switch (currentTab) {
      case "basic":
        return tabValidation.basic;
      case "tags":
        return tabValidation.tags;
      case "milestones":
        return tabValidation.milestones;
      case "settings":
        return tabValidation.settings;
      default:
        return false;
    }
  };

  const goToNextTab = () => {
    const tabs = ["basic", "tags", "milestones", "settings"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1 && canProceedToNextTab(activeTab)) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
    const tabs = ["basic", "tags", "milestones", "settings"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Fixed: Prevent form submission on Enter key in non-submit contexts
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.target !== e.currentTarget) {
      // Only allow Enter to submit if we're on the last tab and it's the submit button
      if (activeTab !== "settings") {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Share your DIY tech project with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2"
              disabled={false}
            >
              <FileText className="h-4 w-4" />
              Basic Info
              {tabValidation.basic && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger 
              value="tags" 
              className="flex items-center gap-2"
              disabled={!tabValidation.basic}
            >
              <Tags className="h-4 w-4" />
              Tags
              {tabValidation.tags && tabValidation.basic && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger 
              value="milestones" 
              className="flex items-center gap-2"
              disabled={!tabValidation.basic}
            >
              <Target className="h-4 w-4" />
              Milestones
              {tabValidation.milestones && tabValidation.basic && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2"
              disabled={!tabValidation.basic || !tabValidation.milestones}
            >
              <Settings className="h-4 w-4" />
              Settings
              {tabValidation.settings && tabValidation.basic && tabValidation.milestones && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about your project. What are you building?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter your project title..."
                    className="mt-1"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of your project..."
                    className="mt-1"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Detailed Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Describe your project in detail. What will you build? What materials do you need? What's the process?"
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Project Image</Label>
                  <div className="flex flex-col gap-4 mt-1">
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
                    <div className="relative w-full max-w-md mt-4">
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
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Tags</CardTitle>
                <CardDescription>
                  Add tags to help others discover your project (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div>
                    <Label>Selected Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTag(tag.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div>
                  <Label>Available Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags
                      .filter((tag) => !selectedTags.find((selected) => selected.id === tag.id))
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => addTag(tag)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Create New Tag */}
                <div>
                  <Label>Create New Tag</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter new tag name..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          createNewTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={createNewTag} disabled={!newTagName.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Break down your project into manageable milestones (at least one required)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MilestoneInput
                  milestones={milestones}
                  onChange={setMilestones}
                  minMilestones={1}
                  maxMilestones={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure your project settings and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Difficulty */}
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleInputChange("difficulty", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Project Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Publishing Options */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publish"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
                  />
                  <Label htmlFor="publish">
                    Publish immediately (make it visible to everyone)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevTab}
              disabled={activeTab === "basic"}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {activeTab !== "settings" ? (
                <Button
                  type="button"
                  onClick={goToNextTab}
                  disabled={!canProceedToNextTab(activeTab)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="min-w-[120px]"
                  disabled={!Object.values(tabValidation).every(valid => valid)}
                >
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
