"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "lucide-react";

interface ProjectDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export function ProjectDeleteDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
}: ProjectDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const isConfirmationValid = confirmationText === projectName;

  const resetForm = () => {
    setConfirmationText("");
    setIsDeleting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      toast.error("Please type the project name exactly as shown");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      handleClose();

      // Redirect to my projects page after successful deletion
      router.push("/my-projects");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            project and all associated data including progress posts and
            comments.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Warning:</strong> This will permanently delete:
            <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
              <li>The project and all its content</li>
              <li>All progress posts</li>
              <li>All comments on the project and progress posts</li>
              <li>All project tags associations</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm deletion, type <strong>{projectName}</strong> below:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type "${projectName}" to confirm`}
              className={
                confirmationText && !isConfirmationValid
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-destructive">
                Project name doesn&apos;t match. Please type exactly: {projectName}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
