/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/create/tabs/basic-info-tab.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface FormData {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
}

interface BasicInfoTabProps {
  formData: FormData;
  onUpdate: (field: string, value: any) => void;
}

export function BasicInfoTab({ formData, onUpdate }: BasicInfoTabProps) {
  const [imagePreview, setImagePreview] = useState<string>(formData.imageUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        onUpdate("imageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    onUpdate("imageUrl", "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Tell us about your project. What are you building?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Enter your project title..."
            className="mt-1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Short Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Brief description of your project..."
            className="mt-1"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Detailed Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => onUpdate("content", e.target.value)}
            placeholder="Describe your project in detail. What will you build? What materials do you need? What's the process?"
            className="mt-1 min-h-[120px]"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label>Project Image</Label>
          <div className="flex flex-col gap-4 mt-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                <Upload className="h-4 w-4" />
                Upload Image
              </div>
            </Label>
          </div>

          {imagePreview && (
            <div className="relative w-full max-w-md mt-4">
              <Image
                src={imagePreview}
                alt="Project preview"
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
