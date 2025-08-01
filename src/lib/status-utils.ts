// src/lib/status-utils.ts

// Project status types (matching your Prisma schema)
export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

// Status color mappings for badges
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ON_HOLD:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

// Human-readable status labels
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
} as const;

// Status descriptions for forms/tooltips
export const PROJECT_STATUS_DESCRIPTIONS: Record<ProjectStatus, string> = {
  PLANNING: "Still in planning phase",
  IN_PROGRESS: "Currently working on it",
  COMPLETED: "Project is finished",
  ON_HOLD: "Temporarily paused",
  CANCELLED: "Project cancelled",
} as const;

// Status icons (using Lucide icon names as strings for flexibility)
export const PROJECT_STATUS_ICONS: Record<ProjectStatus, string> = {
  PLANNING: "clipboard-list",
  IN_PROGRESS: "play-circle",
  COMPLETED: "check-circle",
  ON_HOLD: "pause-circle",
  CANCELLED: "x-circle",
} as const;

// Helper function to get status badge props
export function getStatusBadgeProps(status: ProjectStatus) {
  return {
    className: PROJECT_STATUS_COLORS[status],
    children: PROJECT_STATUS_LABELS[status],
  };
}

// Helper function to get status with description (useful for forms)
export function getStatusOption(status: ProjectStatus) {
  return {
    value: status,
    label: PROJECT_STATUS_LABELS[status],
    description: PROJECT_STATUS_DESCRIPTIONS[status],
  };
}

// Get all status options for forms
export function getAllStatusOptions() {
  return Object.keys(PROJECT_STATUS_LABELS).map((status) =>
    getStatusOption(status as ProjectStatus)
  );
}

// Helper to format status for display
export function formatStatusLabel(status: string): string {
  return status.replace("_", " ");
}

// Helper to get status progress percentage (for progress tracking)
export function getStatusProgress(status: ProjectStatus): number {
  const progressMap: Record<ProjectStatus, number> = {
    PLANNING: 10,
    IN_PROGRESS: 50,
    COMPLETED: 100,
    ON_HOLD: 25,
    CANCELLED: 0,
  };
  return progressMap[status];
}

// Helper to determine if status is active/positive
export function isActiveStatus(status: ProjectStatus): boolean {
  return ["PLANNING", "IN_PROGRESS"].includes(status);
}

// Helper to determine if status is finished
export function isFinishedStatus(status: ProjectStatus): boolean {
  return ["COMPLETED", "CANCELLED"].includes(status);
}
