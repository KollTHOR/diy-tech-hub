"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Target,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  getMilestoneTemplatesByCategory,
  MILESTONE_TEMPLATES,
  type MilestoneTemplate,
} from "@/lib/milestone-templates";

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
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import React from "react";

const ICON_OPTIONS = [
  { name: "ClipboardList", Icon: ClipboardList },
  { name: "Brush", Icon: Brush },
  { name: "Rocket", Icon: Rocket },
  { name: "Settings", Icon: Settings },
  { name: "CheckCircle", Icon: CheckCircle },
  { name: "Search", Icon: Search },
  { name: "MessageCircle", Icon: MessageCircle },
  { name: "Eye", Icon: Eye },
  { name: "Flag", Icon: Flag },
  { name: "BarChart2", Icon: BarChart2 },
  // Add more icons as needed
];

interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  isFromTemplate?: boolean;
  templateId?: string; // the id to find the template and its icon
  icon?: string; // icon name from ICON_OPTIONS for custom milestones
}

interface MilestoneInputProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
  minMilestones?: number;
  maxMilestones?: number;
}

const ItemType = "MILESTONE";

interface DragItem {
  index: number;
  type: string;
}

interface DraggableMilestoneProps {
  milestone: Milestone;
  index: number;
  onUpdate: (
    index: number,
    field: keyof Milestone,
    value: string | boolean
  ) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  canRemove: boolean;
  totalMilestones: number;
}

function renderMilestoneIcon(iconName?: string) {
  const IconComp =
    ICON_OPTIONS.find((opt) => opt.name === iconName)?.Icon || Target;
  return <IconComp className="h-5 w-5 text-primary" />;
}

function getMilestoneIcon(milestone: Milestone): React.ReactElement {
  if (milestone.isFromTemplate && milestone.templateId) {
    const template = MILESTONE_TEMPLATES.find(
      (t) => t.id === milestone.templateId
    );
    if (template && template.icon) {
      const Icon = template.icon as LucideIcon;
      return <Icon className="h-5 w-5 text-primary" />;
    }
  }
  // For custom milestone use selected icon or default
  return renderMilestoneIcon(milestone.icon);
}

function IconSelector({
  selectedIconName,
  onSelectIcon,
}: {
  selectedIconName?: string;
  onSelectIcon: (iconName: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1 border rounded hover:bg-muted flex items-center justify-center"
          aria-label="Select icon"
        >
          {selectedIconName ? (
            React.createElement(
              ICON_OPTIONS.find((opt) => opt.name === selectedIconName)?.Icon ||
                ClipboardList,
              { className: "w-5 h-5" }
            )
          ) : (
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-5 gap-2 max-w-xs p-2">
        {ICON_OPTIONS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectIcon(name)}
            className="p-1 hover:bg-muted rounded flex items-center justify-center"
            aria-label={`Select ${name}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function DraggableMilestone({
  milestone,
  index,
  onUpdate,
  onRemove,
  onMove,
  canRemove,
  totalMilestones,
}: DraggableMilestoneProps) {
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

  // Connect drag and drop to the main container
  useEffect(() => {
    if (ref.current) {
      drop(ref.current);
    }
  }, [drop]);

  // Connect drag to the handle and preview to the entire element
  useEffect(() => {
    if (dragHandleRef.current) {
      drag(dragHandleRef.current);
    }
    if (ref.current) {
      preview(ref.current);
    }
  }, [drag, preview]);

  // Convert string date to Date object for the calendar
  const selectedDate = milestone.targetDate
    ? new Date(milestone.targetDate)
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to YYYY-MM-DD string format
      const dateString = format(date, "yyyy-MM-dd");
      onUpdate(index, "targetDate", dateString);
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
            {/* Icon selector for custom icon selection */}
            {/* Only allow selecting icon if NOT a template milestone */}
            {!milestone.isFromTemplate && (
              <IconSelector
                selectedIconName={milestone.icon}
                onSelectIcon={(iconName) => onUpdate(index, "icon", iconName)}
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
          value={milestone.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}

function MilestoneTemplateSelector({
  onSelectTemplate,
}: {
  onSelectTemplate: (template: MilestoneTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "planning",
  ]);
  const templatesByCategory = getMilestoneTemplatesByCategory();

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectTemplate = (template: MilestoneTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  const categoryLabels = {
    planning: "📋 Planning & Setup",
    development: "⚙️ Development",
    testing: "🔍 Testing & QA",
    review: "👀 Review & Feedback",
    launch: "🚀 Launch & Completion",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Choose from Templates
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Milestone Template</DialogTitle>
          <DialogDescription>
            Select from predefined milestone templates to quickly set up your
            project timeline. You can customize these after adding them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <Collapsible
              key={category}
              open={expandedCategories.includes(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                >
                  <span className="font-medium">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </span>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2 pt-2">
                {templates.map((template) => {
                  const Icon = template.icon as LucideIcon;
                  return (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            ~{template.suggestedDuration} days from start
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MilestoneInput({
  milestones,
  onChange,
  minMilestones = 1,
  maxMilestones = 10,
}: MilestoneInputProps) {
  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: string | boolean
  ) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
      // Remove template flag if user modifies a template-based milestone
      ...(field === "title" &&
        updatedMilestones[index].isFromTemplate && {
          isFromTemplate: false,
          templateId: undefined,
        }),
    };
    onChange(updatedMilestones);
  };

  const addMilestone = () => {
    if (milestones.length >= maxMilestones) return;

    const newMilestone: Milestone = {
      title: "",
      description: "",
      targetDate: "",
      isCompleted: false,
      icon: undefined, // start with no icon
    };

    onChange([...milestones, newMilestone]);
  };

  const addFromTemplate = (template: MilestoneTemplate) => {
    if (milestones.length < maxMilestones) {
      onChange([
        ...milestones,
        {
          title: template.name,
          description: template.description,
          targetDate: "",
          isCompleted: false,
          isFromTemplate: true,
          templateId: template.id,
          // icon is stored in template so don't need here
        },
      ]);
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > minMilestones) {
      const updatedMilestones = milestones.filter((_, i) => i !== index);
      onChange(updatedMilestones);
    }
  };

  const moveMilestone = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const updatedMilestones = [...milestones];
      const [draggedItem] = updatedMilestones.splice(dragIndex, 1);
      updatedMilestones.splice(hoverIndex, 0, draggedItem);
      onChange(updatedMilestones);
    },
    [milestones, onChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Milestones
              <Badge variant="outline">
                {milestones.length}/{maxMilestones}
              </Badge>
            </CardTitle>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add milestones to track your project&apos;s progress. Choose from
              templates or create custom ones.
            </p>

            {milestones.length < minMilestones && (
              <Alert>
                <AlertDescription>
                  You need at least {minMilestones} milestone
                  {minMilestones > 1 ? "s" : ""} to create your project.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {milestones.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <DraggableMilestone
                    key={index}
                    milestone={milestone}
                    index={index}
                    onUpdate={handleMilestoneChange}
                    onRemove={removeMilestone}
                    onMove={moveMilestone}
                    canRemove={milestones.length > minMilestones}
                    totalMilestones={milestones.length}
                  />
                ))}
              </div>

              {milestones.length < maxMilestones && (
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DndProvider>
  );
}
