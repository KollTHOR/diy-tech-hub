"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/types/project";
import { calculateProgressFromMilestones } from "@/lib/milestone-utils";
import {
  ClipboardList,
  Brush,
  Rocket,
  Settings,
  CheckCircle,
  Search,
  MessageCircle,
  Eye,
  Flag,
  BarChart2,
  Target,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_OPTIONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ClipboardList,
  Brush,
  Rocket,
  Settings,
  CheckCircle,
  Search,
  MessageCircle,
  Eye,
  Flag,
  BarChart2,
  Target,
};

function getMilestoneIcon(milestone: Milestone) {
  const Icon =
    milestone.icon && ICON_OPTIONS[milestone.icon]
      ? ICON_OPTIONS[milestone.icon]
      : Target;
  return <Icon className="w-6 h-6" />;
}

interface ProjectMilestoneProgressBarProps {
  milestones: Milestone[];
  creationDate: string | Date;
  className?: string;
}

export function ProjectMilestoneProgressBar({
  milestones,
  creationDate,
  className,
}: ProjectMilestoneProgressBarProps) {
  const projectStart = new Date(creationDate);
  const sorted = [...milestones].sort(
    (a, b) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  const progress = useMemo(() => {
    return calculateProgressFromMilestones(
      sorted.map((m) => ({
        ...m,
        targetDate: new Date(m.targetDate),
        completedAt: m.completedAt ? new Date(m.completedAt) : null,
      }))
    );
  }, [sorted]);

  if (sorted.length === 0) return null;

  const projectEnd = new Date(sorted[sorted.length - 1].targetDate);
  const totalSpanMs = Math.max(
    projectEnd.getTime() - projectStart.getTime(),
    1
  );

  const points = sorted.map((ms, index) => {
    const msTime = new Date(ms.targetDate).getTime();
    const position = Math.max(
      0,
      Math.min(1, (msTime - projectStart.getTime()) / totalSpanMs)
    );
    const milestoneProgress = position * 100;
    const isActive = progress >= milestoneProgress;
    const isCurrentMilestone =
      !isActive &&
      (index === 0 ||
        progress >=
          ((new Date(sorted[index - 1].targetDate).getTime() -
            projectStart.getTime()) /
            totalSpanMs) *
            100);

    return {
      ...ms,
      position,
      isActive,
      isCurrentMilestone,
      index,
    };
  });

  return (
    <TooltipProvider>
      <div className={cn("w-full px-2 py-6", className)}>
        <div className="relative h-20">
          {/* Base Line */}
          <div className="absolute top-1/2 left-0 right-0 h-2.5 bg-muted rounded-full -translate-y-1/2 z-0" />

          {/* Progress Fill */}
          <div
            className="absolute top-1/2 left-0 h-2.5 bg-primary rounded-full -translate-y-1/2 z-10"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />

          {/* Milestones */}
          {points.map((milestone, idx) => {
            const isLast = idx === points.length - 1;
            const leftStyle = isLast
              ? { right: "0", transform: "translateX(50%)" }
              : {
                  left: `${(milestone.position * 100).toFixed(2)}%`,
                  transform: "translateX(-50%)",
                };

            const iconColor = milestone.isActive
              ? "bg-primary text-black"
              : milestone.isCurrentMilestone
              ? "bg-background border border-primary text-primary"
              : "bg-muted text-muted-foreground";

            return (
              <Tooltip key={milestone.title + milestone.targetDate + idx}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute z-20 -translate-y-1/2",
                      "rounded-md p-1 w-10 h-10 flex items-center justify-center",
                      iconColor
                    )}
                    style={{ ...leftStyle, top: "50%" }}
                  >
                    {getMilestoneIcon(milestone)}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="text-xs px-2 py-1 text-center"
                >
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-muted-foreground">
                    {new Date(milestone.targetDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Progress label */}
        <div className="mt-4 text-center text-sm text-muted-foreground font-medium">
          {Math.round(progress)}% Complete
        </div>
      </div>
    </TooltipProvider>
  );
}
