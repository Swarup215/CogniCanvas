"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  BookOpen,
  Star,
  Calendar,
  TrendingUp,
  Clock,
} from "lucide-react";
import { SubjectCard } from "@/components/subject-card";
import { AddSubjectDialog } from "@/components/add-subject-dialog";
import { ImportantSnippetCard } from "@/components/important-snippet-card";
import { RevisionReminderCard } from "@/components/revision-reminder-card";
import { SubjectPage } from "@/components/subject-page";
import { NotebookPage } from "@/components/notebook-page";
import { NotificationSystem } from "@/components/notification-system";
import { ErrorBoundary } from "@/components/error-boundary";
import { KeyboardNavigation } from "@/components/keyboard-navigation";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createSubject,
  getSubjects,
  deleteSubject,
} from "@/lib/firebase-service";
import type { FirebaseSubject } from "@/lib/firebase-service";
import { getNotebooks } from "@/lib/firebase-service";

interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  notebookCount: number;
  createdAt: string;
  updatedAt: string;
}

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

interface ImportantSnippet {
  id: string;
  content: string;
  subjectName: string;
  notebookName: string;
  createdAt: string;
}

interface RevisionReminder {
  id: string;
  noteTitle: string;
  notebookName: string;
  scheduledAt: string;
  completed: boolean;
}

type View = "dashboard" | "subject" | "notebook";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
    null
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [importantSnippets, setImportantSnippets] = useState<
    ImportantSnippet[]
  >([]);
  const [revisionReminders, setRevisionReminders] = useState<
    RevisionReminder[]
  >([]);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const router = useRouter();

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects("default-user");
      // Transform the data to include notebookCount
      const subjectsWithCount = await Promise.all(
        data.map(async (subject) => {
          try {
            const notebooks = await getNotebooks(subject.id);
            return {
              ...subject,
              notebookCount: notebooks.length,
            };
          } catch (error) {
            console.error(
              `Error getting notebooks for subject ${subject.id}:`,
              error
            );
            return {
              ...subject,
              notebookCount: 0,
            };
          }
        })
      );
      setSubjects(subjectsWithCount);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects.");
    }
  };

  useEffect(() => {
    fetchSubjects();
    setUserStreak(7);
  }, []);

  const handleAddSubject = async (
    subject: Omit<Subject, "id" | "notebookCount" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newSubject = await createSubject({
        ...subject,
        userId: "default-user", // Using a default user ID for now
      });
      setSubjects((prev) => [...prev, newSubject]);
      toast.success("Subject added successfully");
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Failed to create subject");
    }
  };

  const clearInvalidSubjects = () => {
    // Clear subjects that have timestamp-based IDs (invalid format)
    setSubjects([]);
    // Refresh subjects from database
    fetchSubjects();
  };

  const clearAllAndStartFresh = () => {
    // Clear all local state
    setSubjects([]);
    setImportantSnippets([]);
    setRevisionReminders([]);

    // Show message about starting fresh
    toast.success(
      "Cleared all data. You can now create new subjects with Firebase!"
    );
  };

  const clearAllMockData = () => {
    // Clear all local state including any remaining mock data
    setSubjects([]);
    setImportantSnippets([]);
    setRevisionReminders([]);

    // Force a complete refresh
    setTimeout(() => {
      fetchSubjects();
    }, 100);

    toast.success("All mock data cleared. Starting completely fresh!");
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      toast.success("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView("subject");
  };

  const handleNotebookClick = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setCurrentView("notebook");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedSubject(null);
    setSelectedNotebook(null);
  };

  const handleBackToSubject = () => {
    setCurrentView("subject");
    setSelectedNotebook(null);
  };

  const handleImportantSnippetClick = (snippet: ImportantSnippet) => {
    // Find the subject by name
    const subject = subjects.find((s) => s.name === snippet.subjectName);
    if (subject) {
      setSelectedSubject(subject);
      setCurrentView("subject");
    }
  };

  const todayRevisions = revisionReminders.filter((r) => {
    const today = new Date().toDateString();
    return new Date(r.scheduledAt).toDateString() === today && !r.completed;
  });

  return (
    <ErrorBoundary>
      <KeyboardNavigation>
        {currentView === "subject" && selectedSubject ? (
          <SubjectPage
            subject={selectedSubject}
            onBack={handleBackToDashboard}
            onNotebookClick={handleNotebookClick}
          />
        ) : currentView === "notebook" &&
          selectedSubject &&
          selectedNotebook ? (
          <NotebookPage
            notebook={selectedNotebook}
            subject={selectedSubject}
            onBack={handleBackToSubject}
          />
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 responsive-heading">
                    CogniCanvas
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 responsive-text">
                    Your digital knowledge canvas
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus-ring"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>

              <div
                id="main-content"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up"
              >
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 responsive-heading">
                      Your Subjects
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {subjects.length} subjects
                      </Badge>
                      {subjects.length > 0 && (
                        <Button
                          onClick={clearInvalidSubjects}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Refresh
                        </Button>
                      )}
                      <Button
                        onClick={clearAllMockData}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Clear Mock Data
                      </Button>
                      <Button
                        onClick={clearAllAndStartFresh}
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Start Fresh
                      </Button>
                    </div>
                  </div>

                  {subjects.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600 animate-fade-in">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                          No subjects yet
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-500 text-center mb-4">
                          Create your first subject to start organizing your
                          notes
                        </p>
                        <Button
                          onClick={() => setIsAddSubjectOpen(true)}
                          variant="outline"
                          className="focus-ring"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Subject
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjects.map((subject) => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          onDelete={handleDeleteSubject}
                          onClick={() => handleSubjectClick(subject)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 animate-slide-up">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Important Snippets
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {importantSnippets.length}
                      </Badge>
                    </div>

                    {importantSnippets.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          No important snippets yet
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                          Mark content as important while taking notes
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {importantSnippets.slice(0, 5).map((snippet) => (
                            <div
                              key={snippet.id}
                              className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                              onClick={() =>
                                handleImportantSnippetClick(snippet)
                              }
                            >
                              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                                {snippet.content}
                              </p>
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium">
                                  {snippet.subjectName}
                                </span>
                                <span>{snippet.notebookName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AddSubjectDialog
              open={isAddSubjectOpen}
              onOpenChange={setIsAddSubjectOpen}
              onAddSubject={handleAddSubject}
            />

            <KeyboardShortcuts
              open={isKeyboardShortcutsOpen}
              onOpenChange={setIsKeyboardShortcutsOpen}
            />
          </div>
        )}
      </KeyboardNavigation>
    </ErrorBoundary>
  );
}
