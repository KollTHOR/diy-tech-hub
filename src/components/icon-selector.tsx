"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import React from "react";
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

interface IconOption {
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const ICON_OPTIONS: IconOption[] = [
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
];

export function renderMilestoneIcon(iconName?: string) {
  const IconComp = ICON_OPTIONS.find((opt) => opt.name === iconName)?.Icon || ClipboardList;
  return <IconComp className="h-5 w-5 text-primary" />;
}

export function getMilestoneIcon(milestone: {
  icon?: string;
  isFromTemplate?: boolean;
  templateId?: string;
  // templateIcon?: React.ComponentType; // optional if applicable
  // For templates, you probably want a different logic (can connect here).
}): React.ReactElement {
  // If milestone is from a template, handle template icon rendering somewhere else
  // This function here focuses on custom milestones only

  return renderMilestoneIcon(milestone.icon);
}

interface IconSelectorProps {
  selectedIconName?: string;
  onSelectIcon: (name: string) => void;
}

export function IconSelector({ selectedIconName, onSelectIcon }: IconSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="p-1 flex items-center justify-center"
          aria-label="Select icon"
        >
          {selectedIconName
            ? React.createElement(
                ICON_OPTIONS.find((opt) => opt.name === selectedIconName)?.Icon ||
                  ClipboardList,
                { className: "w-5 h-5" }
              )
            : <ClipboardList className="w-5 h-5 text-muted-foreground" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-5 gap-2 max-w-xs p-2">
        {ICON_OPTIONS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectIcon(name)}
            className="p-1 rounded hover:bg-muted flex items-center justify-center"
            aria-label={`Select ${name} icon`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
