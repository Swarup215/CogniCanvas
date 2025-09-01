"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  Trash2,
} from "lucide-react";
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
import { deleteNotebook } from "@/lib/firebase-service";
import { toast } from "sonner";

interface Notebook {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  theme: string;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NotebookCardProps {
  notebook: Notebook;
  subjectColor: string;
  onDelete?: (notebookId: string) => void;
  onClick?: () => void;
}

const themeStyles = {
  default:
    "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700",
  blue: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
  green:
    "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
  purple:
    "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
  orange:
    "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
  red: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
  pink: "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800",
  teal: "bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800",
};

export function NotebookCard({
  notebook,
  subjectColor,
  onDelete,
  onClick,
}: NotebookCardProps) {
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
      await deleteNotebook(notebook.id);
      if (onDelete) {
        onDelete(notebook.id);
      }
      toast.success("Notebook deleted successfully");
    } catch (error) {
      console.error("Error deleting notebook:", error);
      toast.error("Failed to delete notebook");
    } finally {
      setIsDeleting(false);
      setIsAlertDialogOpen(false);
    }
  };

  const themeStyle =
    themeStyles[notebook.theme as keyof typeof themeStyles] ||
    themeStyles.default;

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      <div className={`h-2 ${themeStyle}`} />

      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {notebook.title}
            </CardTitle>
            {notebook.description && (
              <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {notebook.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <AlertDialog
              open={isAlertDialogOpen}
              onOpenChange={setIsAlertDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity h-8 sm:h-9 w-8 sm:w-9 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the notebook and all its notes.
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
      </CardHeader>

      <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{notebook.noteCount} notes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Created {formatDate(notebook.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(notebook.updatedAt)}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              style={{ color: subjectColor }}
            >
              <span className="hidden sm:inline">Open</span>
              <span className="sm:hidden">View</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
