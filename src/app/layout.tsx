import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GroqChatButton } from "@/components/groq-chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CogniCanvas - Your Digital Knowledge Canvas",
  description: "A modern note-taking app for organizing your knowledge with subjects, notebooks, and important snippets.",
  keywords: ["note-taking", "knowledge management", "study notes", "digital canvas", "learning"],
  authors: [{ name: "CogniCanvas Team" }],
  openGraph: {
    title: "CogniCanvas",
    description: "Your digital knowledge canvas",
    url: "https://cognicanvas.app",
    siteName: "CogniCanvas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CogniCanvas",
    description: "Your digital knowledge canvas",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <GroqChatButton />
      </body>
    </html>
  );
}
