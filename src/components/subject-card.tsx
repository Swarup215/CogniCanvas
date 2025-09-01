"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSubject } from "@/lib/firebase-service";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  notebookCount: number;
  createdAt: string;
}

interface SubjectCardProps {
  subject: Subject;
  onDelete: (subjectId: string) => void;
  onClick: () => void;
}

export function SubjectCard({ subject, onDelete, onClick }: SubjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteSubject(subject.id);
      onDelete(subject.id);
      toast.success("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    } finally {
      setIsDeleting(false);
      setIsAlertDialogOpen(false);
    }
  };

  return (
    <>
      <Card
        onClick={onClick}
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4"
        style={{ borderLeftColor: subject.color }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold"
                style={{
                  backgroundColor: `${subject.color}20`,
                  color: subject.color,
                }}
              >
                {subject.icon || "📚"}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {subject.name}
                </CardTitle>
                {subject.description && (
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {subject.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{subject.notebookCount} notebooks</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(subject.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                style={{ color: subject.color }}
                onClick={onClick}
              >
                View
              </Button>
              <AlertDialog
                open={isAlertDialogOpen}
                onOpenChange={(isOpen) => {
                  setIsAlertDialogOpen(isOpen);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the subject and all its related notes and notebooks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
