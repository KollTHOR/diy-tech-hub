"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import React from "react";
import {
  getMilestoneTemplatesByCategory,
} from "@/lib/milestone-templates";
import { MilestoneTemplate } from "@/types/project";


interface MilestoneTemplateSelectorProps {
  onSelectTemplate: (template: MilestoneTemplate) => void;
}

const categoryLabels: Record<string, string> = {
  planning: "📋 Planning & Setup",
  development: "⚙️ Development",
  testing: "🔍 Testing & QA",
  review: "👀 Review & Feedback",
  launch: "🚀 Launch & Completion",
};

export function MilestoneTemplateSelector({
  onSelectTemplate,
}: MilestoneTemplateSelectorProps) {
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
                    {categoryLabels[category]}
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
                  const Icon = template.icon;
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
