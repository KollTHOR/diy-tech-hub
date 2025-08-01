/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  GripVertical,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";
import {
} from "@/lib/milestone-templates";
import {
  IconSelector,
} from "./icon-selector";
import { UiMilestone } from "@/types/project";
import { getMilestoneIcon } from "@/lib/milestone-utils";

// interface Milestone {
//   title: string;
//   description: string | null;
//   targetDate: string | Date;
//   isCompleted: boolean;
//   isFromTemplate?: boolean;
//   templateId?: string;
//   icon?: string | null | undefined;
// }

interface MilestoneItemProps {
  milestone: UiMilestone;
  index: number;
  onUpdate: (
    index: number,
    field: keyof UiMilestone,
    value: string | boolean
  ) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  canRemove: boolean;
  totalMilestones: number;
}

const ItemType = "MILESTONE";

interface DragItem {
  index: number;
  type: string;
}

export function MilestoneItem({
  milestone,
  index,
  onUpdate,
  onRemove,
  onMove,
  canRemove,
  totalMilestones,
}: MilestoneItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { index, type: ItemType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (!item) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  useEffect(() => {
    if (ref.current) {
      drop(ref.current);
    }
  }, [drop]);

  useEffect(() => {
    if (dragHandleRef.current) {
      drag(dragHandleRef.current);
    }
    if (ref.current) {
      preview(ref.current);
    }
  }, [drag, preview]);

  const selectedDate = milestone.targetDate
    ? new Date(milestone.targetDate)
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      onUpdate(index, "targetDate", dateStr);
    }
    setDateOpen(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "p-4 border rounded-lg space-y-4 group transition-all",
        isDragging ? "opacity-50 rotate-1 scale-105" : "hover:shadow-md"
      )}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            ref={dragHandleRef}
            className="cursor-move p-1 rounded hover:bg-muted opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <h4 className="font-medium flex items-center gap-2">
            {getMilestoneIcon(milestone)}
            Milestone {index + 1}
            {milestone.isFromTemplate && (
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Template
              </Badge>
            )}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMove(index, index - 1)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ↑
            </Button>
          )}
          {index < totalMilestones - 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMove(index, index + 1)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ↓
            </Button>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`milestone-title-${index}`}>Milestone Title *</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`milestone-title-${index}`}
              placeholder="e.g., Complete wireframes"
              value={milestone.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              className="flex-grow"
            />
            {!milestone.isFromTemplate && (
              <IconSelector
                selectedIconName={milestone.icon as string}
                onSelectIcon={(iconName: any) => onUpdate(index, "icon", iconName)}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Target Date *</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`milestone-description-${index}`}>
          Description (optional)
        </Label>
        <Textarea
          id={`milestone-description-${index}`}
          placeholder="Describe what needs to be accomplished..."
          value={milestone.description as string}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
