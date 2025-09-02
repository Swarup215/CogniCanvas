import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Helper function to convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
};

// Types
export interface FirebaseSubject {
  id?: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseNotebook {
  id?: string;
  title: string;
  description?: string;
  coverImage?: string;
  theme: string;
  subjectId: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseNote {
  id?: string;
  title: string;
  content: string;
  background: string;
  notebookId: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

// Subject operations
export const createSubject = async (
  subjectData: Omit<FirebaseSubject, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "subjects"), {
      ...subjectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newSubject = await getDoc(docRef);
    const data = newSubject.data();
    return {
      id: docRef.id,
      ...data,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt),
    };
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
};

export const getSubjects = async (userId: string) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(collection(db, "subjects"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const subjects = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });

    // Sort in memory instead of in the query
    return subjects.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error getting subjects:", error);
    throw error;
  }
};

export const deleteSubject = async (subjectId: string) => {
  try {
    // Get all notebooks for this subject
    const notebooksQuery = query(
      collection(db, "notebooks"),
      where("subjectId", "==", subjectId)
    );
    const notebooksSnapshot = await getDocs(notebooksQuery);

    // Get all notes for these notebooks
    const batch = writeBatch(db);

    // Delete all notes first
    for (const notebookDoc of notebooksSnapshot.docs) {
      const notesQuery = query(
        collection(db, "notes"),
        where("notebookId", "==", notebookDoc.id)
      );
      const notesSnapshot = await getDocs(notesQuery);

      notesSnapshot.docs.forEach((noteDoc) => {
        batch.delete(noteDoc.ref);
      });

      // Delete the notebook
      batch.delete(notebookDoc.ref);
    }

    // Delete the subject
    batch.delete(doc(db, "subjects", subjectId));

    // Commit all deletions
    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

// Notebook operations
export const createNotebook = async (
  notebookData: Omit<FirebaseNotebook, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "notebooks"), {
      ...notebookData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newNotebook = await getDoc(docRef);
    const data = newNotebook.data();
    return {
      id: docRef.id,
      ...data,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt),
    };
  } catch (error) {
    console.error("Error creating notebook:", error);
    throw error;
  }
};

export const getNotebooks = async (subjectId: string) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "notebooks"),
      where("subjectId", "==", subjectId)
    );

    const querySnapshot = await getDocs(q);
    const notebooks = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });

    // Sort in memory instead of in the query
    return notebooks.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error getting notebooks:", error);
    throw error;
  }
};

export const deleteNotebook = async (notebookId: string) => {
  try {
    // Get all notes for this notebook
    const notesQuery = query(
      collection(db, "notes"),
      where("notebookId", "==", notebookId)
    );
    const notesSnapshot = await getDocs(notesQuery);

    const batch = writeBatch(db);

    // Delete all notes
    notesSnapshot.docs.forEach((noteDoc) => {
      batch.delete(noteDoc.ref);
    });

    // Delete the notebook
    batch.delete(doc(db, "notebooks", notebookId));

    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error deleting notebook:", error);
    throw error;
  }
};

// Note operations
export const createNote = async (
  noteData: Omit<FirebaseNote, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "notes"), {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newNote = await getDoc(docRef);
    const data = newNote.data();
    return {
      id: docRef.id,
      ...data,
      createdAt: convertTimestamp(data?.createdAt),
      updatedAt: convertTimestamp(data?.updatedAt),
    };
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const getNotes = async (notebookId: string) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "notes"),
      where("notebookId", "==", notebookId)
    );

    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    });

    // Sort in memory instead of in the query
    return notes.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  } catch (error) {
    console.error("Error getting notes:", error);
    throw error;
  }
};

export const deleteNote = async (noteId: string) => {
  try {
    await deleteDoc(doc(db, "notes", noteId));
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// Update note (title, content, background)
export const updateNote = async (
  noteId: string,
  data: Partial<Pick<FirebaseNote, "title" | "content" | "background">>
) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    const updated = await getDoc(noteRef);
    const payload = updated.data();
    return {
      id: noteId,
      ...payload,
      createdAt: convertTimestamp(payload?.createdAt),
      updatedAt: convertTimestamp(payload?.updatedAt),
    } as any;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};
