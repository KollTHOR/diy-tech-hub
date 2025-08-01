/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create/project-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Tags, Target, Settings, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { BasicInfoTab } from "./tabs/basic-info-tab";
import { TagsTab } from "./tabs/tags-tab";
import { MilestonesTab } from "./tabs/milestones-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { useProjectForm } from "@/hooks/use-project-form";

interface ProjectFormProps {
  session: Session;
}

export default function ProjectForm({ session }: ProjectFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    milestones,
    selectedTags,
    tabValidation,
    updateFormData,
    updateMilestones,
    updateSelectedTags,
  } = useProjectForm();

  const handleCancel = () => {
    // Navigate back to the previous page or to my projects
    router.back();
    // Alternative: router.push('/my-projects') if you want a specific destination
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate all tabs
    const allTabsValid = Object.values(tabValidation).every((valid) => valid);
    if (!allTabsValid) {
      toast.error("Please complete all required fields");
      return;
    }

    // Filter out empty milestones
    const validMilestones = milestones.filter(
      (m: any) => m.title.trim() !== "" && m.targetDate !== ""
    );

    if (validMilestones.length === 0) {
      toast.error("At least one milestone is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags.map((tag: any) => tag.id),
          milestones: validMilestones.map((m) => ({
            title: m.title,
            description: m.description,
            targetDate: m.targetDate,
            isCompleted: m.isCompleted,
            icon: m.icon, // ✅ Make sure this is included
          })),
        }),
      });

      if (response.ok) {
        const project = await response.json();
        toast.success("Project created successfully!");
        router.push(`/projects/${project.id}`);
      } else {
        let errorMessage = "Failed to create project";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while creating the project");
      console.error("Project creation error:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Cancel Button */}
      <div className="mb-8 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground mt-2">
              Share your DIY tech project with the community
            </p>
          </div>

          {/* Cancel Button - Top Right */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Basic Info
            {tabValidation.basic && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="tags"
            className="flex items-center gap-2"
            disabled={!tabValidation.basic}
          >
            <Tags className="h-4 w-4" />
            Tags
            {tabValidation.tags && tabValidation.basic && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="milestones"
            className="flex items-center gap-2"
            disabled={!tabValidation.basic}
          >
            <Target className="h-4 w-4" />
            Milestones
            {tabValidation.milestones && tabValidation.basic && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2"
            disabled={!tabValidation.basic || !tabValidation.milestones}
          >
            <Settings className="h-4 w-4" />
            Settings
            {tabValidation.settings &&
              tabValidation.basic &&
              tabValidation.milestones && (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoTab formData={formData} onUpdate={updateFormData} />
        </TabsContent>

        <TabsContent value="tags">
          <TagsTab selectedTags={selectedTags} onUpdate={updateSelectedTags} />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestonesTab milestones={milestones} onUpdate={updateMilestones} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab formData={formData} onUpdate={updateFormData} />
        </TabsContent>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevTab}
            disabled={activeTab === "basic" || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {activeTab !== "settings" ? (
              <Button
                type="button"
                onClick={goToNextTab}
                disabled={!canProceedToNextTab(activeTab) || isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="min-w-[120px]"
                disabled={
                  !Object.values(tabValidation).every((valid) => valid) ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
