/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create/hooks/use-project-form.ts
import { useState, useEffect } from "react";

interface FormData {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  difficulty: string;
  status: string;
  isPublished: boolean;
}

interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
}

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

  const [milestones, setMilestones] = useState<Milestone[]>([
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

  const updateMilestones = (newMilestones: Milestone[]) => {
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
