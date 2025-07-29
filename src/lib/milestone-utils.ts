interface Milestone {
  id: string;
  title: string;
  targetDate: Date;
  isCompleted: boolean;
  completedAt: Date | null;
  order: number;
}

export function calculateProgressFromMilestones(
  milestones: Milestone[]
): number {
  if (!milestones || milestones.length === 0) return 0;

  const sortedMilestones = milestones.sort((a, b) => a.order - b.order);
  const completedMilestones = sortedMilestones.filter((m) => m.isCompleted);
  const totalMilestones = sortedMilestones.length;

  // If all milestones are completed, return 100%
  if (completedMilestones.length === totalMilestones) {
    return 100;
  }

  // Base progress from completed milestones
  const completionWeight = totalMilestones > 0 ? 80 / totalMilestones : 0; // 80% for completion
  const baseProgress = completedMilestones.length * completionWeight;

  // Find the next incomplete milestone
  const nextMilestone = sortedMilestones.find((m) => !m.isCompleted);
  if (!nextMilestone) return 100;

  const now = new Date();

  // Time-based progress for the current milestone (20% max)
  let timeProgress = 0;

  if (completedMilestones.length > 0) {
    // Use the last completed milestone as reference
    const lastCompleted = completedMilestones[completedMilestones.length - 1];
    const startDate = lastCompleted.completedAt || lastCompleted.targetDate;
    const totalTime = nextMilestone.targetDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();

    if (totalTime > 0) {
      timeProgress = Math.max(0, Math.min(1, elapsedTime / totalTime)) * 20;
    }
  } else {
    // First milestone - assume project started 30 days before first milestone
    const estimatedStart = new Date(
      nextMilestone.targetDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );
    const totalTime =
      nextMilestone.targetDate.getTime() - estimatedStart.getTime();
    const elapsedTime = now.getTime() - estimatedStart.getTime();

    if (totalTime > 0 && elapsedTime > 0) {
      timeProgress = Math.max(0, Math.min(1, elapsedTime / totalTime)) * 20;
    }
  }

  return Math.min(100, Math.round(baseProgress + timeProgress));
}

export function getNextMilestone(milestones: Milestone[]): Milestone | null {
  if (!milestones || milestones.length === 0) return null;

  const sortedMilestones = milestones.sort((a, b) => a.order - b.order);
  return sortedMilestones.find((m) => !m.isCompleted) || null;
}

export function getMilestoneStatus(
  milestone: Milestone
): "completed" | "overdue" | "upcoming" | "current" {
  const now = new Date();

  if (milestone.isCompleted) return "completed";
  if (now > milestone.targetDate) return "overdue";

  const daysDiff = Math.ceil(
    (milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff <= 7) return "current";

  return "upcoming";
}
