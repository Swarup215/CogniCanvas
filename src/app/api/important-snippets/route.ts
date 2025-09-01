import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      content, 
      noteId, 
      notebookId, 
      subjectId, 
      userId,
      noteTitle,
      notebookName,
      subjectName,
      subjectColor
    } = body;

    console.log("Creating important snippet with data:", {
      content,
      noteId,
      notebookId,
      subjectId,
      userId,
      noteTitle,
      notebookName,
      subjectName,
      subjectColor,
    });

    if (!content || !noteId || !notebookId || !subjectId || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: { content, noteId, notebookId, subjectId, userId },
        },
        { status: 400 }
      );
    }

    // Create the important snippet in Firestore
    const importantSnippetData = {
      content,
      noteId,
      notebookId,
      subjectId,
      userId,
      noteTitle: noteTitle || 'Demo Note',
      notebookName: notebookName || 'Demo Notebook',
      subjectName: subjectName || 'Demo Subject',
      subjectColor: subjectColor || '#3B82F6',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "importantSnippets"), importantSnippetData);
    
    const importantSnippet = {
      id: docRef.id,
      ...importantSnippetData,
      createdAt: new Date().toISOString(), // Fallback timestamp
    };

    console.log("Important snippet created:", importantSnippet);

    // Update the note's importantSnippetCount in Firestore
    try {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        importantSnippetCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      console.log("Note updated successfully");
    } catch (updateError) {
      console.error("Error updating note count:", updateError);
      // Don't fail the whole request if note update fails
    }

    return NextResponse.json(importantSnippet);
  } catch (error) {
    console.error("Error creating important snippet:", error);
    return NextResponse.json(
      {
        error: "Failed to create important snippet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const subjectId = searchParams.get("subjectId");

    console.log("Fetching important snippets for:", { userId, subjectId });

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build the query
    let q;
    const snippetsCollection = collection(db, "importantSnippets");

    if (subjectId) {
      q = query(
        snippetsCollection,
        where("userId", "==", userId),
        where("subjectId", "==", subjectId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        snippetsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    }

    console.log("Query built for Firestore");

    const querySnapshot = await getDocs(q);
    const importantSnippets: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      importantSnippets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    console.log("Found important snippets:", importantSnippets.length);
    return NextResponse.json(importantSnippets);
  } catch (error) {
    console.error("Error fetching important snippets:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch important snippets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
