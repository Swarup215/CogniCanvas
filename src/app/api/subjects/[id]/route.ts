import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedSubject = await db.subject.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Subject deleted successfully", subject: deletedSubject },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting subject:", error);

    // Handle "record not found" explicitly
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
