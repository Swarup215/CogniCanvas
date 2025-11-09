import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  try {
    // Get API key from server-side environment variable
    const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return NextResponse.json(
        { error: `API error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Handle OpenAI-compatible response format
    if (data.choices && data.choices[0]?.message?.content) {
      return NextResponse.json({ 
        content: data.choices[0].message.content 
      });
    }

    // Fallback for other response formats
    if (data.output) {
      const output = Array.isArray(data.output) 
        ? data.output.join("\n") 
        : String(data.output);
      return NextResponse.json({ content: output });
    }

    if (data.completions && data.completions[0]?.data?.text) {
      return NextResponse.json({ 
        content: data.completions[0].data.text 
      });
    }

    return NextResponse.json({ 
      content: JSON.stringify(data) 
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : "Failed to process chat message" 
      },
      { status: 500 }
    );
  }
}

