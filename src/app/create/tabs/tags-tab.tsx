import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, X, Search } from "lucide-react";
import { toast } from "sonner";

import type {
  Tag
} from "@/types/project";

interface TagsTabProps {
  selectedTags: Tag[];
  onUpdate: (tags: Tag[]) => void;
}

export function TagsTab({ selectedTags, onUpdate }: TagsTabProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch all tags (should be sorted by popularity on backend)
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const tags = await response.json();
        // Optionally sort by usageCount if available
        const popular = tags.sort(
          (a: Tag, b: Tag) => (b.usageCount || 0) - (a.usageCount || 0)
        );
        setAllTags(popular);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // Filter tags by search input and exclude already-selected tags
  const filteredTags = useMemo(() => {
    return allTags
      .filter(
        (tag) =>
          !selectedTags.find((selected) => selected.id === tag.id) &&
          (!search || tag.name.toLowerCase().includes(search.toLowerCase()))
      )
      .slice(0, 10); // show up to 10
  }, [search, allTags, selectedTags]);

  // Add selected tag
  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      onUpdate([...selectedTags, tag]);
      setSearch("");
    }
  };

  // Remove selected tag
  const removeTag = (tagId: string) => {
    onUpdate(selectedTags.filter((tag) => tag.id !== tagId));
  };

  // Create a new tag
  const handleCreateTag = async () => {
    if (!search.trim()) return;
    setIsAdding(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: search.trim() }),
      });
      if (response.ok) {
        const newTag = await response.json();
        setAllTags([...allTags, newTag]);
        addTag(newTag);
        toast.success("Tag created successfully!");
      } else if (response.status === 409) {
        toast.error("Tag already exists.");
      } else {
        toast.error("Failed to create tag");
      }
    } catch (error) {
      toast.error("Failed to create tag");
      console.error("Failed to create tag:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Allow Enter in search to create new tag if not found
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      search.trim() &&
      !filteredTags.find(
        (t) => t.name.toLowerCase() === search.trim().toLowerCase()
      )
    ) {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Tags</CardTitle>
        <CardDescription>
          Add up to 5 tags to help others discover your project (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div>
            <Label>Selected Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags and Search */}
        <div>
          <Label htmlFor="tag-search">Add from popular tags or search</Label>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <Input
                id="tag-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Type to search for tags or create a new one"
                className="w-full"
                maxLength={32}
                disabled={selectedTags.length >= 5}
                autoComplete="off"
              />
              <Button
                type="button"
                onClick={handleCreateTag}
                disabled={
                  !search.trim() ||
                  !!filteredTags.find(
                    (t) => t.name.toLowerCase() === search.trim().toLowerCase()
                  ) ||
                  isAdding ||
                  selectedTags.length >= 5
                }
                variant="outline"
                className="shrink-0"
                tabIndex={-1}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Suggest popular tags as user types */}
            {filteredTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => addTag(tag)}
                    tabIndex={0}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            {/* If no matches, show create option */}
            {search.trim() &&
              !filteredTags.find(
                (t) => t.name.toLowerCase() === search.trim().toLowerCase()
              ) && (
                <div className="text-muted-foreground text-sm mt-1">
                  Enter to create “{search.trim()}”
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
