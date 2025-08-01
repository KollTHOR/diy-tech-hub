"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import React from "react";
import { ClipboardList } from "lucide-react";
import {
  renderMilestoneIcon,
  ICON_OPTIONS,
} from "@/lib/milestone-utils";

interface IconSelectorProps {
  selectedIconName?: string;
  onSelectIcon: (name: string) => void;
}

export function IconSelector({
  selectedIconName,
  onSelectIcon,
}: IconSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="p-1 flex items-center justify-center"
          aria-label="Select icon"
        >
          {selectedIconName ? (
            renderMilestoneIcon(selectedIconName, "w-5 h-5")
          ) : (
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-5 gap-2 max-w-xs p-2">
        {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
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
