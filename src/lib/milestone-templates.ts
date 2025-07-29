export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  suggestedDuration: number; // days from project start
  category: "planning" | "development" | "testing" | "launch" | "review";
  icon: string;
}

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  {
    id: "project-setup",
    name: "Project Planning & Setup",
    description: "Initial planning, requirements gathering, and project setup",
    suggestedDuration: 14,
    category: "planning",
    icon: "📋",
  },
  {
    id: "research-design",
    name: "Research & Design Phase",
    description: "Research, prototyping, and design work",
    suggestedDuration: 30,
    category: "planning",
    icon: "🎨",
  },
  {
    id: "development-start",
    name: "Development Kickoff",
    description: "Begin main development or implementation work",
    suggestedDuration: 45,
    category: "development",
    icon: "🚀",
  },
  {
    id: "mid-development",
    name: "Mid-Development Checkpoint",
    description: "Major progress check and course correction if needed",
    suggestedDuration: 75,
    category: "development",
    icon: "⚙️",
  },
  {
    id: "development-complete",
    name: "Development Complete",
    description: "Main development work finished, ready for testing",
    suggestedDuration: 90,
    category: "development",
    icon: "✅",
  },
  {
    id: "testing-phase",
    name: "Testing & Quality Assurance",
    description: "Testing, bug fixes, and quality improvements",
    suggestedDuration: 105,
    category: "testing",
    icon: "🔍",
  },
  {
    id: "user-feedback",
    name: "User Feedback & Iterations",
    description: "Gather feedback and make final improvements",
    suggestedDuration: 120,
    category: "review",
    icon: "💬",
  },
  {
    id: "final-review",
    name: "Final Review & Approval",
    description: "Final review, approval, and preparation for launch",
    suggestedDuration: 130,
    category: "review",
    icon: "👀",
  },
  {
    id: "launch",
    name: "Launch & Completion",
    description: "Project launch, deployment, or final delivery",
    suggestedDuration: 140,
    category: "launch",
    icon: "🎉",
  },
  {
    id: "post-launch",
    name: "Post-Launch Review",
    description:
      "Monitor results, gather insights, and document lessons learned",
    suggestedDuration: 160,
    category: "review",
    icon: "📊",
  },
];

export function getMilestoneTemplatesByCategory() {
  return MILESTONE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MilestoneTemplate[]>);
}

export function calculateSuggestedDate(
  startDate: Date,
  daysFromStart: number
): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysFromStart);
  return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}
