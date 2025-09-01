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
  ArrowLeft,
  Star,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

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

interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface ImportantSectionProps {
  subject: Subject;
  onBack: () => void;
  onSnippetClick: (snippet: ImportantSnippet) => void;
}

export function ImportantSection({
  subject,
  onBack,
  onSnippetClick,
}: ImportantSectionProps) {
  const [snippets, setSnippets] = useState<ImportantSnippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState<string>("all");
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImportantSnippets();
  }, [subject.id]);

  const fetchImportantSnippets = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching important snippets for subject:", subject.id);

      const response = await fetch(
        `/api/important-snippets?userId=user-1&subjectId=${subject.id}`
      );
      console.log("API response status:", response.status);
      console.log(
        "API response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const data = await response.json();
        console.log("API response data:", data);

        // Transform the Firebase data to match our interface
        // Since Firebase doesn't have automatic joins, we'll use the data we have
        const transformedSnippets = data.map((snippet: any) => ({
          id: snippet.id,
          content: snippet.content,
          noteTitle: snippet.noteTitle || "Demo Note", // Use fallback since we don't have note data
          notebookName: snippet.notebookName || "Demo Notebook", // Use fallback since we don't have notebook data
          subjectName: snippet.subjectName || subject.name,
          subjectColor: snippet.subjectColor || subject.color,
          createdAt: snippet.createdAt,
          noteId: snippet.noteId,
          notebookId: snippet.notebookId,
          subjectId: snippet.subjectId,
        }));

        console.log("Transformed snippets:", transformedSnippets);
        setSnippets(transformedSnippets);
      } else {
        const errorData = await response.text();
        console.error(
          "Failed to fetch important snippets. Status:",
          response.status
        );
        console.error("Error response:", errorData);

        // Fallback to mock data if API fails
        console.log("Falling back to mock data");
        setSnippets(getMockSnippets());
      }
    } catch (error) {
      console.error("Error fetching important snippets:", error);
      // Fallback to mock data if API fails
      console.log("Falling back to mock data due to error");
      setSnippets(getMockSnippets());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockSnippets = () => [];

  const generateFlashcards = async () => {
    try {
      setIsGeneratingFlashcards(true);

      // Create flashcards from the current snippets
      const flashcardData = snippets.map((snippet) => ({
        front: snippet.content,
        back: `${snippet.noteTitle} - ${snippet.notebookName}`,
        tags: [snippet.subjectName, snippet.notebookName],
      }));

      // Convert to CSV format for download
      const csvContent = [
        ["Front", "Back", "Tags"],
        ...flashcardData.map((card) => [
          `"${card.front.replace(/"/g, '""')}"`,
          `"${card.back.replace(/"/g, '""')}"`,
          `"${card.tags.join(", ")}"`,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${subject.name}-flashcards-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert("Flashcards generated and downloaded successfully!");
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const notebooks = Array.from(new Set(snippets.map((s) => s.notebookName)));

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.noteTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNotebook =
      selectedNotebook === "all" || snippet.notebookName === selectedNotebook;
    return matchesSearch && matchesNotebook;
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {subject.name}
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
                  Important Snippets
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {subject.name} • {snippets.length} snippets
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateFlashcards}
              disabled={isGeneratingFlashcards || snippets.length === 0}
              className="flex items-center gap-2"
            >
              {isGeneratingFlashcards ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generate Flashcards
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search snippets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedNotebook}
                  onChange={(e) => setSelectedNotebook(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="all">All Notebooks</option>
                  {notebooks.map((notebook) => (
                    <option key={notebook} value={notebook}>
                      {notebook}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snippets List */}
        {isLoading ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-slate-400 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Loading important snippets...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 text-center">
                Please wait while we fetch the data.
              </p>
            </CardContent>
          </Card>
        ) : filteredSnippets.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No important snippets found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 text-center mb-4">
                {searchTerm || selectedNotebook !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Highlight text in your notes and mark it as important to see it here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredSnippets.length} of {snippets.length} snippets
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {filteredSnippets.map((snippet) => (
                  <Card
                    key={snippet.id}
                    className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4"
                    style={{ borderLeftColor: snippet.subjectColor }}
                    onClick={() => onSnippetClick(snippet)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                            Important
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(snippet.createdAt)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {truncateContent(snippet.content)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {snippet.notebookName}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {snippet.noteTitle}
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
