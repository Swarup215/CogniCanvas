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
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import { NoteEditor } from "@/components/note-editor";
import { AddNoteDialog } from "@/components/add-note-dialog";
import { getNotes, createNote, deleteNote } from "@/lib/firebase-service";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  background: string;
  createdAt: string;
  updatedAt: string;
  importantSnippetCount: number;
}

interface Notebook {
  id: string;
  title: string;
  description?: string;
  theme: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface NotebookPageProps {
  notebook: Notebook;
  subject: Subject;
  onBack: () => void;
}

export function NotebookPage({ notebook, subject, onBack }: NotebookPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Fetch notes for this notebook from Firebase
    const fetchNotes = async () => {
      try {
        const data = await getNotes(notebook.id);
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      }
    };

    fetchNotes();
  }, [notebook.id]);

  const handleAddNote = async (
    note: Omit<Note, "id" | "createdAt" | "updatedAt" | "importantSnippetCount">
  ) => {
    try {
      const newNote = await createNote({
        ...note,
        notebookId: notebook.id,
        userId: "default-user", // Using a default user ID for now
      });
      setNotes([...notes, newNote]);
      toast.success("Note created successfully");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteSave = (updatedNote: Partial<Note>) => {
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({
        ...selectedNote,
        ...updatedNote,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
  };

  const totalImportantSnippets = notes.reduce(
    (acc, note) => acc + note.importantSnippetCount,
    0
  );

  // If a note is selected, show the editor
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        subject={subject}
        notebook={notebook}
        onBack={handleBackToNotes}
        onSave={handleNoteSave}
      />
    );
  }

  // Otherwise, show the notebook view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to {subject.name}</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-sm sm:text-xl font-semibold"
              style={{
                backgroundColor: `${subject.color}20`,
                color: subject.color,
              }}
            >
              {subject.icon || "📚"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {notebook.title}
              </h1>
              {notebook.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {notebook.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              Notes
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {notes.length} notes
              </Badge>
              {totalImportantSnippets > 0 && (
                <Badge variant="warning" className="text-xs sm:text-sm">
                  <Star className="h-3 w-3 mr-1" />
                  {totalImportantSnippets} important
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={() => setIsAddNoteOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Create Note</span>
            <span className="sm:hidden">Create Note</span>
          </Button>
        </div>

        {notes.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400 mb-2 text-center">
                No notes yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 text-center mb-4 max-w-sm">
                Create your first note to start documenting your knowledge
              </p>
              <Button
                onClick={() => setIsAddNoteOpen(true)}
                variant="outline"
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                Create Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                onClick={() => handleNoteClick(note)}
              >
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {note.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {note.content}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity h-8 sm:h-9 w-8 sm:w-9 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{note.importantSnippetCount} important</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>
                            Created{" "}
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          Updated{" "}
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                        style={{ color: subject.color }}
                      >
                        <span className="hidden sm:inline">Open</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddNoteDialog
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        onAddNote={handleAddNote}
        subjectColor={subject.color}
      />
    </div>
  );
}
