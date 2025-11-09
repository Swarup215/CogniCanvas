"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Sparkles, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Groq API Configuration
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface GroqChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroqChatbot({ open, onOpenChange }: GroqChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hi there 👋\nWelcome to CogniCanvas!\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Copy message to clipboard
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedMessageId(messageId);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (e) {
        toast.error("Failed to copy");
      }
      document.body.removeChild(textArea);
    }
  };

  // Find the viewport element after render and enable keyboard scrolling
  useEffect(() => {
    if (scrollAreaRef.current && open) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement;
      if (viewport) {
        viewportRef.current = viewport;
        // Make viewport focusable for keyboard navigation
        viewport.setAttribute("tabindex", "0");
        viewport.style.outline = "none";
        viewport.style.overflowY = "auto";
        viewport.style.overflowX = "hidden";
        
        // Enable keyboard scrolling - works when chat is open and input is not focused
        const handleKeyDown = (e: KeyboardEvent) => {
          // Don't interfere if user is typing in input
          const target = e.target as HTMLElement;
          if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
            return;
          }
          
          // Only handle scroll keys when chat is open
          if (!open) return;
          
          const scrollAmount = 50;
          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              viewport.scrollBy({ top: -scrollAmount, behavior: "smooth" });
              break;
            case "ArrowDown":
              e.preventDefault();
              viewport.scrollBy({ top: scrollAmount, behavior: "smooth" });
              break;
            case "PageUp":
              e.preventDefault();
              viewport.scrollBy({ top: -viewport.clientHeight * 0.9, behavior: "smooth" });
              break;
            case "PageDown":
              e.preventDefault();
              viewport.scrollBy({ top: viewport.clientHeight * 0.9, behavior: "smooth" });
              break;
            case "Home":
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                viewport.scrollTo({ top: 0, behavior: "smooth" });
              }
              break;
            case "End":
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
              }
              break;
          }
        };
        
        // Add listener to document so it works even when viewport isn't focused
        document.addEventListener("keydown", handleKeyDown);
        viewport.addEventListener("keydown", handleKeyDown);
        
        // Scroll to bottom after finding viewport
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
        
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
          viewport.removeEventListener("keydown", handleKeyDown);
        };
      }
    }
  }, [open, messages]);


  const sendToGroq = async (message: string): Promise<string> => {
    if (!GROQ_API_KEY) {
      throw new Error("Groq API key is not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your .env.local file.");
    }

    const body = {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: message }],
    };

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();

    // Handle OpenAI-compatible response format
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    // Fallback for other response formats
    if (data.output) {
      return Array.isArray(data.output) ? data.output.join("\n") : String(data.output);
    }

    if (data.completions && data.completions[0]?.data?.text) {
      return data.completions[0].data.text;
    }

    return JSON.stringify(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendToGroq(text);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: `Error: ${err instanceof Error ? err.message : "Failed to get response"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity pointer-events-auto"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Chat Window */}
      <div className="relative w-full max-w-md h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col pointer-events-auto mr-4 mb-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-white/80">Powered by Groq</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-slate-50 dark:bg-slate-900">
          <ScrollArea className="h-full w-full chat-scroll-area" ref={scrollAreaRef}>
            <div className="px-4 py-4 space-y-4 min-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2.5 group",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "bot" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm relative",
                      message.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-10">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={cn(
                        "text-xs",
                        message.role === "user" ? "text-white/70" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className={cn(
                          "ml-2 p-1.5 rounded-lg transition-all opacity-70 hover:opacity-100 hover:bg-opacity-20",
                          message.role === "user"
                            ? "hover:bg-white/20 text-white/80 hover:text-white"
                            : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                        aria-label="Copy message"
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900 flex-shrink-0"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your message..."
              disabled={isLoading}
              className="flex-1 rounded-full border-slate-300 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all p-0"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Floating Chat Button Component
export function GroqChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center group"
        size="icon"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        {!open && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-white rounded-full border-2 border-pink-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-pink-500">1</span>
          </span>
        )}
      </Button>
      <GroqChatbot open={open} onOpenChange={setOpen} />
    </>
  );
}

