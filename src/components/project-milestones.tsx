/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMilestoneStatus } from "@/lib/milestone-utils";
import { Milestone } from "@prisma/client";


interface ProjectMilestonesProps {
  projectId: string;
  milestones: Milestone[];
  progress: number;
  isOwner: boolean;
  className?: string;
}

export function ProjectMilestones({
  projectId,
  milestones,
  progress,
  isOwner,
  className = "",
}: ProjectMilestonesProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const sortedMilestones = milestones.sort((a, b) => a.order - b.order);

  const handleMilestoneToggle = async (
    milestoneId: string,
    isCompleted: boolean
  ) => {
    if (!isOwner) return;

    setIsUpdating(milestoneId);

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          milestoneId,
          isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update milestone");
      }

      toast.success(
        isCompleted ? "Milestone completed!" : "Milestone reopened"
      );
      router.refresh();
    } catch (error) {
      toast.error("Failed to update milestone");
    } finally {
      setIsUpdating(null);
    }
  };

  const getMilestoneIcon = (milestone: Milestone) => {
    if (milestone.isCompleted) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    const status = getMilestoneStatus(milestone);
    switch (status) {
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "current":
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getMilestoneStatusBadge = (milestone: Milestone) => {
    if (milestone.isCompleted) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Completed{" "}
          {formatDistanceToNow(milestone.completedAt!, { addSuffix: true })}
        </Badge>
      );
    }

    const status = getMilestoneStatus(milestone);
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "current":
        return <Badge variant="default">Current Target</Badge>;
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Milestones
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">{progress}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          {sortedMilestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);

            return (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                  milestone.isCompleted && "bg-green-50 border-green-200",
                  status === "overdue" &&
                    !milestone.isCompleted &&
                    "bg-red-50 border-red-200",
                  status === "current" &&
                    !milestone.isCompleted &&
                    "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Milestone Icon */}
                  <div className="flex-shrink-0">
                    {getMilestoneIcon(milestone)}
                  </div>

                  {/* Milestone Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        Milestone {milestone.order}: {milestone.title}
                      </h4>
                      {getMilestoneStatusBadge(milestone)}
                    </div>

                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {milestone.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due: {format(milestone.targetDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {milestone.isCompleted
                            ? `Completed ${formatDistanceToNow(
                                milestone.completedAt!,
                                { addSuffix: true }
                              )}`
                            : formatDistanceToNow(milestone.targetDate, {
                                addSuffix: true,
                              })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Checkbox (only for owners) */}
                  {isOwner && (
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={milestone.isCompleted}
                        disabled={isUpdating === milestone.id}
                        onCheckedChange={(checked: any) =>
                          handleMilestoneToggle(milestone.id, !!checked)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Progress Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Milestones Completed:</span>
              <span className="font-medium">
                {sortedMilestones.filter((m) => m.isCompleted).length} /{" "}
                {sortedMilestones.length}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Time-based Progress:</span>
              <span className="font-medium">{progress}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
