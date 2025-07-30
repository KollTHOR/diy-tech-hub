// src/lib/milestone-utils.ts
interface MilestoneForCalculation {
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date | null;
}

export function calculateProgressFromMilestones(
  milestones: MilestoneForCalculation[]
): number {
  if (milestones.length === 0) return 0;

  const completedMilestones = milestones.filter((m) => m.isCompleted);
  const totalMilestones = milestones.length;

  // If all milestones are completed, return 100%
  if (completedMilestones.length === totalMilestones) {
    return 100;
  }

  // Base progress from completed milestones
  const completionWeight = totalMilestones > 0 ? 80 / totalMilestones : 0; // 80% for completion
  let progress = completedMilestones.length * completionWeight;

  // Find the next incomplete milestone
  const sortedMilestones = [...milestones].sort(
    (a, b) => a.targetDate.getTime() - b.targetDate.getTime()
  );
  const nextIncomplete = sortedMilestones.find((m) => !m.isCompleted);

  if (nextIncomplete) {
    // Time-based progress for the current milestone (20% max)
    const now = new Date();
    const currentMilestoneWeight = 20 / totalMilestones;

    // Use the last completed milestone as reference
    const lastCompleted = sortedMilestones
      .filter((m) => m.isCompleted)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
      .pop();

    let startDate: Date;
    if (lastCompleted && lastCompleted.completedAt) {
      startDate = lastCompleted.completedAt;
    } else {
      // First milestone - assume project started 30 days before first milestone
      startDate = new Date(
        nextIncomplete.targetDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
    }

    const totalTime = nextIncomplete.targetDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();

    if (totalTime > 0 && elapsedTime > 0) {
      const timeProgress = Math.min(elapsedTime / totalTime, 1);
      progress += timeProgress * currentMilestoneWeight;
    }
  }

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

export function getNextMilestone(
  milestones: MilestoneForCalculation[]
): MilestoneForCalculation | null {
  return (
    milestones
      .filter((m) => !m.isCompleted)
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())[0] ||
    null
  );
}

// ✅ Add the missing getMilestoneStatus function
export function getMilestoneStatus(milestone: {
  targetDate: Date;
  isCompleted: boolean;
}): "completed" | "overdue" | "current" | "upcoming" {
  // If milestone is completed, return completed status
  if (milestone.isCompleted) {
    return "completed";
  }

  const now = new Date();
  const targetDate = new Date(milestone.targetDate);

  // Remove time component for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  // Check if milestone is overdue
  if (target < today) {
    return "overdue";
  }

  // Check if milestone is due soon (within next 7 days) - consider it "current"
  const daysUntilTarget = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilTarget <= 7) {
    return "current";
  }

  // Otherwise, it's upcoming
  return "upcoming";
}

// ✅ Optional: Add a helper to get milestone status with more detailed info
export function getMilestoneStatusDetails(milestone: {
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date | null;
}) {
  const status = getMilestoneStatus(milestone);
  const now = new Date();
  const targetDate = new Date(milestone.targetDate);

  let daysFromTarget = 0;
  let message = "";

  if (milestone.isCompleted) {
    if (milestone.completedAt) {
      const completedDate = new Date(milestone.completedAt);
      const wasEarly = completedDate < targetDate;
      const daysDiff = Math.abs(
        Math.ceil(
          (targetDate.getTime() - completedDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      if (wasEarly && daysDiff > 0) {
        message = `Completed ${daysDiff} day${daysDiff > 1 ? "s" : ""} early`;
      } else if (!wasEarly && daysDiff > 0) {
        message = `Completed ${daysDiff} day${daysDiff > 1 ? "s" : ""} late`;
      } else {
        message = "Completed on time";
      }
    } else {
      message = "Completed";
    }
  } else {
    daysFromTarget = Math.ceil(
      (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === "overdue") {
      message = `${Math.abs(daysFromTarget)} day${
        Math.abs(daysFromTarget) > 1 ? "s" : ""
      } overdue`;
    } else if (status === "current") {
      if (daysFromTarget === 0) {
        message = "Due today";
      } else {
        message = `Due in ${daysFromTarget} day${
          daysFromTarget > 1 ? "s" : ""
        }`;
      }
    } else {
      message = `Due in ${daysFromTarget} day${daysFromTarget > 1 ? "s" : ""}`;
    }
  }

  return {
    status,
    daysFromTarget,
    message,
    isOverdue: status === "overdue",
    isDueSoon: status === "current",
    isCompleted: milestone.isCompleted,
  };
}
