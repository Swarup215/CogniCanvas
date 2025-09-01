"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Star,
  Palette,
  Image,
  FileText,
  PenTool,
  Highlighter,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Maximize,
  X,
  Move,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  content: string;
  background: string;
  createdAt: string;
  updatedAt: string;
  importantSnippetCount: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface Notebook {
  id: string;
  title: string;
  theme: string;
}

interface NoteEditorProps {
  note: Note;
  subject: Subject;
  notebook: Notebook;
  onBack: () => void;
  onSave: (note: Partial<Note>) => void;
}

const backgroundOptions = [
  { name: "Default", value: "default", class: "bg-white dark:bg-slate-800" },
  {
    name: "Parchment",
    value: "parchment",
    class: "bg-amber-50 dark:bg-amber-950",
  },
  {
    name: "Blue Gradient",
    value: "gradient",
    class:
      "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950",
  },
  { name: "Green", value: "green", class: "bg-green-50 dark:bg-green-950" },
  { name: "Pink", value: "pink", class: "bg-pink-50 dark:bg-pink-950" },
  { name: "Teal", value: "teal", class: "bg-teal-50 dark:bg-teal-950" },
  {
    name: "Minimal Gray",
    value: "gray",
    class: "bg-slate-50 dark:bg-slate-900",
  },
  {
    name: "Warm Yellow",
    value: "yellow",
    class: "bg-yellow-50 dark:bg-yellow-950",
  },
];

export function NoteEditor({
  note,
  subject,
  notebook,
  onBack,
  onSave,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [background, setBackground] = useState(note.background);
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [codeBlock, setCodeBlock] = useState({
    language: "",
    code: "",
    title: "",
  });
  const [selectedText, setSelectedText] = useState("");
  const [isHighlightDialogOpen, setIsHighlightDialogOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const currentBackground =
    backgroundOptions.find((bg) => bg.value === background) ||
    backgroundOptions[0];

  const router = useRouter();

  // Effect to sync outside note changes to the editor state
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setBackground(note.background);
  }, [note]);

  // Effect to populate the contentEditable div and attach listeners
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
    addInteractiveElementListeners();
  }, [content]);

  // Effect to track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
      title !== note.title ||
        content !== note.content ||
        background !== note.background
    );
  }, [title, content, background, note]);

  // Effect to initialize the drawing canvas when mode is enabled
  useEffect(() => {
    if (isDrawingMode) {
      initDrawingCanvas();
    }
  }, [isDrawingMode, brushColor, brushSize]);

  // Effect to update drawing context when color or size changes
  useEffect(() => {
    if (drawingContextRef.current) {
      drawingContextRef.current.strokeStyle = brushColor;
      drawingContextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  // --- CORE EDITOR LOGIC ---
  /**
   * Updates the React state with the current HTML from the editor.
   * This is the single source of truth for syncing the DOM with React.
   */
  const updateContentFromDOM = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  /**
   * Handles the Enter key press with context-awareness.
   * It correctly creates new paragraphs or list items and ensures the cursor moves.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const parentNode = range.commonAncestorContainer.parentElement;
      
      // Check if we are inside a list item
      const listItem = parentNode?.closest('li');
      if (listItem && listItem.textContent?.trim() === '' && listItem.parentElement && listItem.parentElement.children.length > 1) {
        // If Enter is pressed on an empty list item, create a paragraph below the list.
        const list = listItem.parentElement;
        const newPara = document.createElement('p');
        newPara.innerHTML = '<br>'; // Use <br> to ensure it's rendered with height
        list.parentElement?.insertBefore(newPara, list.nextSibling);
        listItem.remove();
        // Move cursor to the new paragraph
        const newRange = document.createRange();
        newRange.setStart(newPara, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // For all other cases (in a paragraph, in a list with text), this command
        // is smart enough to do the right thing:
        // - Creates a new <p> if in a paragraph.
        // - Creates a new <li> if in a list item.
        document.execCommand('insertParagraph');
      }
      // Sync the DOM changes back to our React state
      updateContentFromDOM();
    }
  };

  /**
   * A robust function to apply text formatting commands.
   */
  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContentFromDOM();
  };

  /**
   * Inserts a snippet of HTML at the current cursor position.
   * Used for inserting images, code blocks, etc.
   */
  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    
    // Focus the editor first
    editorRef.current.focus();
    
    // Try using execCommand first (most reliable)
    try {
      const success = document.execCommand('insertHTML', false, html);
      if (success) {
        updateContentFromDOM();
        return;
      }
    } catch (e) {
      console.warn('execCommand insertHTML failed, using fallback', e);
    }
    
    // Fallback: manual insertion
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Create a document fragment with the HTML
      const fragment = range.createContextualFragment(html);
      
      // Insert the fragment
      range.insertNode(fragment);
      
      // Move cursor after the inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // If no selection, append to the editor content
      if (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>') {
        editorRef.current.innerHTML = html;
      } else {
        editorRef.current.innerHTML += html;
      }
    }
    
    updateContentFromDOM();
  };

  /**
   * Handles pasting content, sanitizing it slightly for consistency.
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      const sanitizedText = text.replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, sanitizedText);
      updateContentFromDOM();
    }
  };

  // --- FEATURE HANDLERS ---
  const handleSave = () => {
    onSave({ title, content, background });
    setHasUnsavedChanges(false);
  };

  const handleBackgroundChange = (newBackground: string) => {
    setBackground(newBackground);
    setIsBackgroundPickerOpen(false);
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const insertCodeBlock = () => {
    if (!codeBlock.code.trim()) return;
    
    // Ensure editor is focused
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    const codeBlockHtml = `
      <div class="code-block my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" contenteditable="false">
        <button class="delete-btn absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Delete code block">
          <X class="h-4 w-4" />
        </button>
        ${codeBlock.title ? `<h4 class="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300 pr-8">${escapeHtml(codeBlock.title)}</h4>` : ""}
        ${codeBlock.language ? `<div class="text-xs text-slate-500 mb-2 font-mono">${escapeHtml(codeBlock.language)}</div>` : ""}
        <pre class="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-x-auto"><code>${escapeHtml(codeBlock.code)}</code></pre>
      </div>
      <p><br></p>
    `;
    
    // Use a more direct approach to insert the HTML
    setTimeout(() => {
      try {
        // Try to insert using execCommand
        const success = document.execCommand('insertHTML', false, codeBlockHtml);
        
        if (!success) {
          // Fallback: append to editor content
          if (editorRef.current) {
            if (editorRef.current.innerHTML.trim() === '' || editorRef.current.innerHTML === '<br>') {
              editorRef.current.innerHTML = codeBlockHtml;
            } else {
              editorRef.current.innerHTML += codeBlockHtml;
            }
          }
        }
        
        // Update content state
        updateContentFromDOM();
        
        // Reset the form and close dialog
        setIsCodeDialogOpen(false);
        setCodeBlock({ language: "", code: "", title: "" });
      } catch (error) {
        console.error("Error inserting code block:", error);
        alert("Failed to insert code block. Please try again.");
      }
    }, 0);
  };

  const insertQuote = () => {
    const quoteHtml = `<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 my-4 italic relative group">Your quote here...<button class="delete-btn absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove quote" contenteditable="false"><X class="h-4 w-4" /></button></blockquote><p><br></p>`;
    formatText('insertHTML', quoteHtml);
  };

  const handleImageInsert = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const imgHtml = `
            <div class="image-container my-4 relative group" contenteditable="false">
              <div class="image-controls absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="delete-image p-1 rounded-full bg-red-500 text-white" title="Delete image">
                  <X class="h-4 w-4" />
                </button>
                <button class="resize-image p-1 rounded-full bg-blue-500 text-white" title="Resize image">
                  <Move class="h-4 w-4" />
                </button>
                <button class="rotate-image p-1 rounded-full bg-green-500 text-white" title="Rotate image">
                  <RotateCw class="h-4 w-4" />
                </button>
              </div>
              <img src="${dataUrl}" alt="Inserted image" class="max-w-full h-auto rounded-lg my-4" />
            </div>
            <p><br></p>
          `;
          insertHtmlAtCursor(imgHtml);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setIsHighlightDialogOpen(true);
    }
  };

  const saveAsImportant = async () => {
    if (selectedText.trim()) {
      try {
        console.log("Saving important snippet:", {
          content: selectedText,
          noteId: note.id,
          notebookId: notebook.id,
          subjectId: subject.id,
          userId: "user-1",
        });

        // Save to database
        const response = await fetch("/api/important-snippets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: selectedText,
            noteId: note.id,
            notebookId: notebook.id,
            subjectId: subject.id,
            userId: "user-1", // TODO: Replace with actual user ID from auth
            // Add additional metadata for better display
            noteTitle: note.title,
            notebookName: notebook.title,
            subjectName: subject.name,
            subjectColor: subject.color,
          }),
        });

        console.log("API response status:", response.status);
        console.log(
          "API response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(
            `Failed to save important snippet: ${response.status} ${errorText}`
          );
        }

        const importantSnippet = await response.json();
        console.log("Important snippet saved:", importantSnippet);

        // Highlight the text in the editor
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // Create highlight element
          const highlightElement = document.createElement("mark");
          highlightElement.className =
            "bg-yellow-200 dark:bg-yellow-800 px-1 rounded";
          highlightElement.textContent = selectedText;

          // Replace selected text with highlighted version
          range.deleteContents();
          range.insertNode(highlightElement);

          // Move cursor after the highlight
          range.setStartAfter(highlightElement);
          range.setEndAfter(highlightElement);
          selection.removeAllRanges();
          selection.addRange(range);

          updateContentFromDOM();
        } else {
          // Fallback if no selection
          const highlightedHtml = `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${escapeHtml(
            selectedText
          )}</mark>`;
          insertHtmlAtCursor(highlightedHtml);
        }

        // Show success message
        alert("Text saved to Important section successfully!");

        setIsHighlightDialogOpen(false);
        setSelectedText("");

        // Refresh the note to show updated importantSnippetCount
        // You might want to call a refresh function here if available
      } catch (error) {
        console.error("Error saving important snippet:", error);
        alert(
          `Failed to save important snippet: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handlePdfInsert = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would upload the PDF and get a URL
        // For now, we'll show a placeholder
        const pdfHtml = `
          <div class="pdf-container my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative group" contenteditable="false">
            <div class="pdf-controls absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="delete-pdf p-1 rounded-full bg-red-500 text-white" title="Delete PDF">
                <X class="h-4 w-4" />
              </button>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span class="font-medium">${escapeHtml(file.name)}</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">PDF attachment - ${Math.round(
              file.size / 1024
            )} KB</p>
            <button class="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Download PDF
            </button>
          </div>
          <p><br></p>
        `;
        insertHtmlAtCursor(pdfHtml);
      }
    };

    input.click();
  };

  // --- EVENT LISTENERS FOR INTERACTIVE ELEMENTS ---
  const addInteractiveElementListeners = () => {
    if (!editorRef.current) return;

    // Remove existing event listeners first
    const existingListeners = editorRef.current.querySelectorAll(
      '[data-listener="true"]'
    );
    existingListeners.forEach((element) => {
      element.removeEventListener("click", handleElementClick);
    });

    // Add event listeners to code block delete buttons
    const codeBlocks = editorRef.current.querySelectorAll(
      ".code-block .delete-btn"
    );
    codeBlocks.forEach((btn) => {
      btn.setAttribute("data-listener", "true");
      btn.addEventListener("click", handleElementClick);
    });

    // Add event listeners to quote delete buttons
    const quotes = editorRef.current.querySelectorAll("blockquote .delete-btn");
    quotes.forEach((btn) => {
      btn.setAttribute("data-listener", "true");
      btn.addEventListener("click", handleElementClick);
    });

    // Add event listeners to image controls
    const imageControls = editorRef.current.querySelectorAll(
      ".image-controls button"
    );
    imageControls.forEach((btn) => {
      btn.setAttribute("data-listener", "true");
      btn.addEventListener("click", handleElementClick);
    });

    // Add event listeners to PDF controls
    const pdfControls = editorRef.current.querySelectorAll(
      ".pdf-controls button"
    );
    pdfControls.forEach((btn) => {
      btn.setAttribute("data-listener", "true");
      btn.addEventListener("click", handleElementClick);
    });

    // Add event listeners to drawing controls
    const drawingControls = editorRef.current.querySelectorAll(
      ".drawing-controls button"
    );
    drawingControls.forEach((btn) => {
      btn.setAttribute("data-listener", "true");
      btn.addEventListener("click", handleElementClick);
    });
  };

  // Unified event handler for all interactive elements
  const handleElementClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;

    // Handle code block deletion
    if (target.closest(".code-block .delete-btn")) {
      const codeBlock = target.closest(".code-block");
      if (codeBlock && codeBlock.parentNode) {
        codeBlock.parentNode.removeChild(codeBlock);
        updateContentFromDOM();
      }
    }

    // Handle quote removal
    if (target.closest("blockquote .delete-btn")) {
      const quote = target.closest("blockquote");
      if (quote && quote.parentNode) {
        // Convert quote to paragraph
        const p = document.createElement("p");
        p.innerHTML = quote.innerHTML.replace(/<button[^>]*>.*?<\/button>/, "");
        quote.parentNode.replaceChild(p, quote);
        updateContentFromDOM();
      }
    }

    // Handle image deletion
    if (target.closest(".image-controls .delete-image")) {
      const container = target.closest(".image-container");
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        updateContentFromDOM();
      }
    }

    // Handle image resizing
    if (target.closest(".image-controls .resize-image")) {
      const container = target.closest(".image-container");
      const img = container?.querySelector("img");

      if (img) {
        const currentWidth = img.clientWidth;
        const newWidth = prompt(
          `Enter new width (current: ${currentWidth}px):`,
          currentWidth.toString()
        );

        if (newWidth && !isNaN(parseInt(newWidth))) {
          img.style.width = `${newWidth}px`;
          img.style.height = "auto";
          updateContentFromDOM();
        }
      }
    }

    // Handle image rotation
    if (target.closest(".image-controls .rotate-image")) {
      const container = target.closest(".image-container");
      const img = container?.querySelector("img");

      if (img) {
        const currentTransform = img.style.transform || "";
        const currentRotation = currentTransform.match(/rotate\((\d+)deg\)/);
        const currentDegrees = currentRotation
          ? parseInt(currentRotation[1])
          : 0;
        const newDegrees = (currentDegrees + 90) % 360;

        img.style.transform = `rotate(${newDegrees}deg)`;
        updateContentFromDOM();
      }
    }

    // Handle PDF deletion
    if (target.closest(".pdf-controls .delete-pdf")) {
      const container = target.closest(".pdf-container");
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        updateContentFromDOM();
      }
    }

    // Handle drawing deletion
    if (target.closest(".drawing-controls .delete-drawing")) {
      const container = target.closest(".drawing-container");
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        updateContentFromDOM();
      }
    }

    // Handle drawing resizing
    if (target.closest(".drawing-controls .resize-drawing")) {
      const container = target.closest(".drawing-container");
      const img = container?.querySelector("img");

      if (img) {
        const currentWidth = img.clientWidth;
        const newWidth = prompt(
          `Enter new width (current: ${currentWidth}px):`,
          currentWidth.toString()
        );

        if (newWidth && !isNaN(parseInt(newWidth))) {
          img.style.width = `${newWidth}px`;
          img.style.height = "auto";
          updateContentFromDOM();
        }
      }
    }
  };

  // --- DRAWING CANVAS LOGIC ---
  const initDrawingCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawingContextRef.current = ctx;
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    drawingContextRef.current?.beginPath();
    drawingContextRef.current?.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    drawingContextRef.current?.lineTo(offsetX, offsetY);
    drawingContextRef.current?.stroke();
  };

  const stopDrawing = () => { 
    isDrawingRef.current = false; 
  };

  const clearCanvas = () => {
    if (canvasRef.current && drawingContextRef.current) {
      drawingContextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const saveDrawing = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png");
      const drawingHtml = `
        <div class="drawing-container my-4 relative group" contenteditable="false">
          <div class="drawing-controls absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="delete-drawing p-1 rounded-full bg-red-500 text-white" title="Delete drawing">
              <X class="h-4 w-4" />
            </button>
            <button class="resize-drawing p-1 rounded-full bg-blue-500 text-white" title="Resize drawing">
              <Move class="h-4 w-4" />
            </button>
          </div>
          <img src="${dataURL}" alt="Drawing" class="max-w-full h-auto rounded-lg my-4 border border-slate-200" />
        </div>
        <p><br></p>
      `;
      insertHtmlAtCursor(drawingHtml);
      setIsDrawingMode(false);
    }
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleViewImportant = (id: string) => {
    router.push(`/important/${id}`);
  };

  return (
    <div
      className={`min-h-screen ${currentBackground.class} transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {notebook.title}
            </Button>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: `${subject.color}20`,
                  color: subject.color,
                }}
              >
                {subject.icon || "📚"}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">{subject.name}</span>
                <span className="mx-1">•</span>
                <span>{notebook.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBackgroundPickerOpen(!isBackgroundPickerOpen)}
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Background
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2"
            >
              <Maximize className="h-4 w-4" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Background Picker */}
        {isBackgroundPickerOpen && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Choose Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {backgroundOptions.map((bgOption) => (
                  <button
                    key={bgOption.value}
                    className={`relative rounded-lg border-2 p-3 transition-all ${
                      background === bgOption.value
                        ? "border-slate-900 dark:border-slate-100 scale-105 shadow-md"
                        : "border-transparent hover:border-slate-300"
                    }`}
                    onClick={() => handleBackgroundChange(bgOption.value)}
                  >
                    <div
                      className={`h-16 rounded ${bgOption.class} mb-2 border`}
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {bgOption.name}
                    </span>
                    {background === bgOption.value && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note Editor */}
        <div
          className={`space-y-6 ${
            isFullscreen
              ? "fixed inset-0 bg-white dark:bg-slate-900 z-50 p-8"
              : ""
          }`}
        >
          {/* Title Input */}
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold text-slate-900 dark:text-slate-100 bg-transparent border-none outline-none placeholder-slate-400"
              placeholder="Note title..."
            />
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>
                Created {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              {note.importantSnippetCount > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{note.importantSnippetCount} important</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 p-2 overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("formatBlock", "<h1>")}
                    title="Heading 1"
                  >
                    <span className="text-lg font-bold">H1</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("formatBlock", "<h2>")}
                    title="Heading 2"
                  >
                    <span className="text-base font-bold">H2</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("formatBlock", "<p>")}
                    title="Paragraph"
                  >
                    <span className="text-sm">P</span>
                  </Button>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("bold")}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("italic")}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("underline")}
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("insertUnorderedList")}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => formatText("insertOrderedList")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={insertQuote}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Dialog
                    open={isCodeDialogOpen}
                    onOpenChange={setIsCodeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Insert Code"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Insert Code Block</DialogTitle>
                        <DialogDescription>
                          Add a code block to your note
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="codeTitle">
                            Code Title (Optional)
                          </Label>
                          <Input
                            id="codeTitle"
                            value={codeBlock.title}
                            onChange={(e) =>
                              setCodeBlock({
                                ...codeBlock,
                                title: e.target.value,
                              })
                            }
                            placeholder="e.g., Java Polymorphism Example"
                          />
                        </div>
                        <div>
                          <Label htmlFor="codeLanguage">
                            Language (Optional)
                          </Label>
                          <Input
                            id="codeLanguage"
                            value={codeBlock.language}
                            onChange={(e) =>
                              setCodeBlock({
                                ...codeBlock,
                                language: e.target.value,
                              })
                            }
                            placeholder="e.g., java, python, javascript"
                          />
                        </div>
                        <div>
                          <Label htmlFor="codeContent">Code</Label>
                          <Textarea
                            id="codeContent"
                            value={codeBlock.code}
                            onChange={(e) =>
                              setCodeBlock({
                                ...codeBlock,
                                code: e.target.value,
                              })
                            }
                            placeholder="Write your code here..."
                            rows={6}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsCodeDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={insertCodeBlock}>Insert Code</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const url = prompt("Enter URL:");
                      if (url) formatText("createLink", url);
                    }}
                    title="Insert Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleImageInsert}
                    title="Insert Image"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <Dialog
                    open={isHighlightDialogOpen}
                    onOpenChange={setIsHighlightDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleHighlight}
                        title="Highlight Text"
                      >
                        <Highlighter className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save as Important</DialogTitle>
                        <DialogDescription>
                          Do you want to highlight this text and save it to your
                          Important section?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <p className="text-sm font-medium mb-2">
                            Selected Text:
                          </p>
                          <p className="text-sm italic">"{selectedText}"</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsHighlightDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={saveAsImportant}
                            className="bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Save to Important
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Drawing Tool"
                    onClick={toggleDrawingMode}
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="min-h-[500px] p-4">
                <div
                  ref={editorRef}
                  contentEditable
                  className="prose prose-sm max-w-none dark:prose-invert min-h-[400px] outline-none focus:outline-none ltr"
                  onInput={updateContentFromDOM}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onClick={() => editorRef.current?.focus()}
                  suppressContentEditableWarning={true}
                  style={{
                    minHeight: "400px",
                    direction: "ltr",
                    unicodeBidi: "normal",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleImageInsert}
              >
                <Image className="h-4 w-4" />
                Insert Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handlePdfInsert}
              >
                <FileText className="h-4 w-4" />
                Insert PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleHighlight}
              >
                <Star className="h-4 w-4" />
                Add to Important
              </Button>
            </div>
            <div className="text-sm text-slate-500">
              Auto-saved {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Canvas Overlay */}
      {isDrawingMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Drawing Tool</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Color:</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => {
                      setBrushColor(e.target.value);
                      // Update drawing context immediately when color changes
                      if (drawingContextRef.current) {
                        drawingContextRef.current.strokeStyle = e.target.value;
                      }
                    }}
                    className="w-8 h-8 rounded border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => {
                      setBrushSize(Number(e.target.value));
                      // Update drawing context immediately when size changes
                      if (drawingContextRef.current) {
                        drawingContextRef.current.lineWidth = Number(
                          e.target.value
                        );
                      }
                    }}
                    className="w-20"
                  />
                  <span className="text-sm w-8">{brushSize}</span>
                </div>
              </div>
            </div>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-[600px] bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCanvas}>
                  Clear Canvas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDrawingMode(false)}
                >
                  Cancel
                </Button>
              </div>
              <Button
                onClick={saveDrawing}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Drawing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}