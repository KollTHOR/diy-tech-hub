/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create/tabs/settings-tab.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormData {
  difficulty: string;
  status: string;
  isPublished: boolean;
}

interface SettingsTabProps {
  formData: FormData;
  onUpdate: (field: string, value: any) => void;
}

export function SettingsTab({ formData, onUpdate }: SettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <CardDescription>
          Configure your project settings and visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Difficulty */}
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => onUpdate("difficulty", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="EXPERT">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Project Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onUpdate("status", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Publishing Options */}
        <div className="flex items-center space-x-2">
          <Switch
            id="publish"
            checked={formData.isPublished}
            onCheckedChange={(checked) => onUpdate("isPublished", checked)}
          />
          <Label htmlFor="publish">
            Publish immediately (make it visible to everyone)
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
