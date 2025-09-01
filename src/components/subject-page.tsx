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
import { Plus, ArrowLeft, BookOpen, Calendar, Clock, Star } from "lucide-react";
import { NotebookCard } from "@/components/notebook-card";
import { AddNotebookDialog } from "@/components/add-notebook-dialog";
import { ImportantSection } from "@/components/important-section";
import { getNotebooks, createNotebook } from "@/lib/firebase-service";

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

interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

interface ImportantSnippet {
  id: string;
  content: string;
  noteTitle: string;
  notebookName: string;
  subjectName: string;
  subjectColor: string;
  createdAt: string;
  noteId: string;
  notebookId: string;
  subjectId: string;
}

interface SubjectPageProps {
  subject: Subject;
  onBack: () => void;
  onNotebookClick: (notebook: Notebook) => void;
}

type View = "notebooks" | "important";

export function SubjectPage({
  subject,
  onBack,
  onNotebookClick,
}: SubjectPageProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isAddNotebookOpen, setIsAddNotebookOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>("notebooks");
  const [importantSnippets, setImportantSnippets] = useState<
    ImportantSnippet[]
  >([]);

  useEffect(() => {
    // Fetch notebooks for this subject
    const fetchNotebooks = async () => {
      try {
        const data = await getNotebooks(subject.id);
        setNotebooks(data);
      } catch (error) {
        console.error("Error fetching notebooks:", error);
        setNotebooks([]);
      }
    };

    fetchNotebooks();
  }, [subject.id]);

  const handleAddNotebook = async (
    notebook: Omit<Notebook, "id" | "noteCount" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newNotebook = await createNotebook({
        ...notebook,
        subjectId: subject.id,
        userId: "default-user", // Using a default user ID for now
      });
      setNotebooks((prev) => [...prev, newNotebook]);
    } catch (error) {
      console.error("Error creating notebook:", error);
    }
  };

  const handleDeleteNotebook = (notebookId: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
  };

  const handleSnippetClick = (snippet: ImportantSnippet) => {
    // Find the notebook that contains this snippet
    const targetNotebook = notebooks.find((nb) => nb.id === snippet.notebookId);

    if (targetNotebook) {
      // Navigate to the notebook and show the note
      setCurrentView("notebooks" as View);
      // You could also set a flag to highlight the specific notebook or note
      // For now, we'll just navigate back to notebooks view
      alert(
        `Navigating to "${snippet.noteTitle}" in "${snippet.notebookName}"`
      );
    } else {
      alert(`Could not find the notebook for this snippet`);
    }
  };

  // Show Important Section
  if (currentView === "important") {
    return (
      <ImportantSection
        subject={subject}
        onBack={() => setCurrentView("notebooks")}
        onSnippetClick={handleSnippetClick}
      />
    );
  }

  // Show Notebooks view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-semibold"
              style={{
                backgroundColor: `${subject.color}20`,
                color: subject.color,
              }}
            >
              {subject.icon || "📚"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {subject.name}
              </h1>
              {subject.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {subject.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg">
            <Button
              variant={currentView === "notebooks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("notebooks")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Notebooks
            </Button>
            <Button
              variant={currentView === "important" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("important")}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Important
              {importantSnippets.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {importantSnippets.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Notebooks
            </h2>
            <Badge variant="secondary" className="text-sm">
              {notebooks.length} notebooks
            </Badge>
          </div>

          <Button
            onClick={() => setIsAddNotebookOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Notebook
          </Button>
        </div>

        {notebooks.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No notebooks yet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 text-center mb-4">
                Create your first notebook to start taking notes
              </p>
              <Button
                onClick={() => setIsAddNotebookOpen(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Notebook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <div key={notebook.id} onClick={() => onNotebookClick(notebook)}>
                <NotebookCard
                  notebook={notebook}
                  subjectColor={subject.color}
                  onDelete={handleDeleteNotebook}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AddNotebookDialog
        open={isAddNotebookOpen}
        onOpenChange={setIsAddNotebookOpen}
        onAddNotebook={handleAddNotebook}
        subjectColor={subject.color}
      />
    </div>
  );
}
