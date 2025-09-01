"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Type } from "lucide-react";

interface Subject {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSubject: (
    subject: Omit<Subject, "id" | "notebookCount" | "createdAt">
  ) => void;
}

const colorOptions = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
];

const iconOptions = [
  "📚",
  "🧮",
  "🔬",
  "🎨",
  "🎭",
  "🏛️",
  "💻",
  "🌍",
  "🧪",
  "📊",
  "🎯",
  "🔍",
  "💡",
  "🎵",
  "⚡",
  "🌟",
  "☕",
  "∫",
  "∑",
  "π",
  "∆",
  "∞",
  "α",
  "β",
  "γ",
  "λ",
];

export function AddSubjectDialog({
  open,
  onOpenChange,
  onAddSubject,
}: AddSubjectDialogProps) {
  console.log("AddSubjectDialog render - open:", open);

  const [formData, setFormData] = useState<Subject>({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "📚",
  });

  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dialog open state changing from", open, "to", newOpen);
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    if (formData.name.trim()) {
      console.log("Calling onAddSubject with:", formData);
      onAddSubject(formData);
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "📚",
      });
      onOpenChange(false);
    } else {
      console.log("Form validation failed - name is empty");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Create New Subject
          </DialogTitle>
          <DialogDescription>
            Add a new subject to organize your notebooks and notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="e.g., Java Programming, Calculus, World History"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the subject..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-slate-900 dark:border-slate-100 scale-105"
                        : "border-transparent hover:border-slate-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Icon
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                      formData.icon === icon
                        ? "border-slate-900 dark:border-slate-100 scale-105"
                        : "border-transparent hover:border-slate-300"
                    }`}
                    onClick={() => setFormData({ ...formData, icon: icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Cancel button clicked");
                handleOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create Subject
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
