/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create/hooks/use-project-form.ts
import { useState, useEffect } from "react";

import type {
  FormData,
  Tag,
  UiMilestone, // Import the centralized Milestone interface
} from "@/types/project";

export function useProjectForm() {

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    difficulty: "BEGINNER",
    status: "PLANNING",
    isPublished: false,
  });

  const [milestones, setMilestones] = useState<UiMilestone[]>([
    {
      title: "",
      description: "",
      targetDate: "",
      isCompleted: false,
    },
  ]);

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [tabValidation, setTabValidation] = useState({
    basic: false,
    tags: true,
    milestones: false,
    settings: true,
  });

  // Update validation when data changes
  useEffect(() => {
    const basicValid =
      formData.title.trim() !== "" && formData.content.trim() !== "";
    const validMilestones = milestones.filter(
      (m) => m.title.trim() !== "" && m.targetDate !== ""
    );
    const milestonesValid = validMilestones.length >= 1;

    setTabValidation({
      basic: basicValid,
      tags: true,
      milestones: milestonesValid,
      settings: true,
    });
  }, [formData.title, formData.content, milestones]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateMilestones = (newMilestones: UiMilestone[]) => {
    setMilestones(newMilestones);
  };

  const updateSelectedTags = (newTags: Tag[]) => {
    setSelectedTags(newTags);
  };

  return {
    formData,
    milestones,
    selectedTags,
    tabValidation,
    updateFormData,
    updateMilestones,
    updateSelectedTags,
  };
}
