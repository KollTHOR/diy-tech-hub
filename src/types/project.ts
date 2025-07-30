// src/types/project.ts

import type { LucideIcon } from "lucide-react";

// For main project creation/edit flows
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
  usageCount?: number;
}

export interface Milestone {
  title: string;
  description: string | null;
  targetDate: string;
  isCompleted: boolean;
  isFromTemplate?: boolean;
  templateId?: string;
  icon?: string;
  completedAt?: Date | null;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  suggestedDuration: number; // days from project start
  category: "planning" | "development" | "testing" | "launch" | "review";
  icon: LucideIcon;
}

export interface FormData {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  difficulty: string;
  status: string;
  isPublished: boolean;
}
