// src/app/create/tabs/milestones-tab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MilestoneInput } from "@/components/milestone-input";

interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
}

interface MilestonesTabProps {
  milestones: Milestone[];
  onUpdate: (milestones: Milestone[]) => void;
}

export function MilestonesTab({ milestones, onUpdate }: MilestonesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
        <CardDescription>
          Break down your project into manageable milestones (at least one
          required)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MilestoneInput
          milestones={milestones}
          onChange={onUpdate}
          minMilestones={1}
          maxMilestones={10}
        />
      </CardContent>
    </Card>
  );
}
