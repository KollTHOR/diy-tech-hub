"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, Plus } from "lucide-react";
import React from "react";
import { MilestoneItem } from "./milestone-item";
import { MilestoneTemplateSelector } from "./milestone-template-selector";
import type { Milestone, MilestoneTemplate } from "@/types/project";

interface MilestoneInputProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
  minMilestones?: number;
  maxMilestones?: number;
}

export function MilestoneInput({
  milestones,
  onChange,
  minMilestones = 1,
  maxMilestones = 10,
}: MilestoneInputProps) {
  const addMilestone = () => {
    if (milestones.length >= maxMilestones) return;

    onChange([
      ...milestones,
      {
        title: "",
        description: "",
        targetDate: "",
        isCompleted: false,
        icon: undefined,
        isFromTemplate: false,
      },
    ]);
  };

  const addFromTemplate = (template: MilestoneTemplate) => {
    if (milestones.length >= maxMilestones) return;

    onChange([
      ...milestones,
      {
        title: template.name,
        description: template.description,
        targetDate: "",
        isCompleted: false,
        isFromTemplate: true,
        templateId: template.id,
        // icon comes from template.icon
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > minMilestones) {
      const newMilestones = milestones.filter((_, i) => i !== index);
      onChange(newMilestones);
    }
  };

  const moveMilestone = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updated = [...milestones];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const updateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string | boolean
  ) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: value,
      ...(field === "title" && updated[index].isFromTemplate
        ? { isFromTemplate: false, templateId: undefined }
        : {}),
    };
    onChange(updated);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Milestones
              <span className="inline-block rounded-md border border-border px-2 py-1 text-xs font-mono">
                {milestones.length}/{maxMilestones}
              </span>
            </CardTitle>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Add milestones to track your project&apos;s progress. Choose from
            templates or create custom ones.
          </p>

          {milestones.length < minMilestones && (
            <Alert className="mt-3">
              <AlertDescription>
                You need at least {minMilestones} milestone
                {minMilestones > 1 ? "s" : ""} to create your project.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {milestones.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">
                No milestones yet. Get started by choosing a template or
                creating a custom milestone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <MilestoneTemplateSelector onSelectTemplate={addFromTemplate} />
                <Button variant="outline" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Milestone
                </Button>
              </div>
            </div>
          ) : (
            <>
              {milestones.map((milestone, index) => (
                <MilestoneItem
                  key={index}
                  milestone={milestone}
                  index={index}
                  onUpdate={updateMilestone}
                  onRemove={removeMilestone}
                  onMove={moveMilestone}
                  canRemove={milestones.length > minMilestones}
                  totalMilestones={milestones.length}
                />
              ))}

              {milestones.length < maxMilestones && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <MilestoneTemplateSelector
                    onSelectTemplate={addFromTemplate}
                  />
                  <Button
                    variant="outline"
                    onClick={addMilestone}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Milestone ({milestones.length}/{maxMilestones})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DndProvider>
  );
}
