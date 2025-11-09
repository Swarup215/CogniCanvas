// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from "@/lib/socket";
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
// Load .env.local first, then .env as fallback
const envPath = resolve(process.cwd(), ".env.local");
const envPathFallback = resolve(process.cwd(), ".env");

console.log("Loading .env.local from:", envPath);
console.log("File exists:", require("fs").existsSync(envPath));

// Load .env.local with override to ensure it takes precedence
const result = config({ path: envPath, override: true });
if (result.error) {
  console.error("Error loading .env.local:", result.error);
  // Try loading .env as fallback
  config({ path: envPathFallback });
} else {
  console.log("Successfully loaded .env.local");
}

// Also load .env if it exists (without override so .env.local takes precedence)
if (require("fs").existsSync(envPathFallback)) {
  config({ path: envPathFallback, override: false });
}

// Debug: Log if API key is loaded (only in development)
if (process.env.NODE_ENV !== "production") {
  console.log("Groq API Key loaded:", process.env.NEXT_PUBLIC_GROQ_API_KEY ? "Yes" : "No");
  if (process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    console.log("API Key length:", process.env.NEXT_PUBLIC_GROQ_API_KEY.length);
    console.log("API Key starts with:", process.env.NEXT_PUBLIC_GROQ_API_KEY.substring(0, 10));
  } else {
    console.log("All env vars starting with NEXT_PUBLIC_:", 
      Object.keys(process.env).filter(key => key.startsWith("NEXT_PUBLIC_")));
  }
}

const dev = process.env.NODE_ENV !== "production";
const currentPort = parseInt(process.env.PORT || '3000', 10);
const hostname = "localhost"; // Changed from '0.0.0.0' to 'localhost'

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: "./.next" },
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith("/api/socketio")) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: "/api/socketio",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(
        `> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`
      );
      console.log(`> Try accessing: http://localhost:${currentPort}`);
      console.log(`> Or try: http://127.0.0.1:${currentPort}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
