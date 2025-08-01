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

export interface UiMilestone {
  // Database fields (from Prisma schema)
  id?: string; // Optional for new milestones
  title: string;
  description: string | null;
  targetDate: string | Date; // Allow both formats
  isCompleted: boolean;
  completedAt?: Date | null;
  order?: number; // Optional for new milestones
  projectId?: string; // Optional for form usage
  createdAt?: Date; // Optional for form usage
  updatedAt?: Date; // Optional for form usage

  // Form-specific fields
  isFromTemplate?: boolean;
  templateId?: string;
  icon?: string | null;
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
