import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notebooks = await db.notebook.findMany({
      where: { subjectId: id },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedNotebooks = notebooks.map((notebook) => ({
      id: notebook.id,
      title: notebook.title,
      description: notebook.description,
      coverImage: notebook.coverImage,
      theme: notebook.theme,
      noteCount: notebook._count.notes,
      createdAt: notebook.createdAt.toISOString(),
      updatedAt: notebook.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedNotebooks);
  } catch (error) {
    console.error("Error fetching notebooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch notebooks" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectId } = await params;
    const body = await req.json();
    const { title, description, coverImage, theme } = body;

    // Get the default user (same as in subjects route)
    let defaultUser = await db.user.findUnique({
      where: { email: "default@example.com" },
    });

    if (!defaultUser) {
      defaultUser = await db.user.create({
        data: {
          email: "default@example.com",
          name: "Default User",
        },
      });
    }

    const newNotebook = await db.notebook.create({
      data: {
        title,
        description,
        coverImage,
        theme,
        subjectId,
        userId: defaultUser.id,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    // Transform the response to match expected format
    const transformedNotebook = {
      id: newNotebook.id,
      title: newNotebook.title,
      description: newNotebook.description,
      coverImage: newNotebook.coverImage,
      theme: newNotebook.theme,
      noteCount: newNotebook._count.notes,
      createdAt: newNotebook.createdAt.toISOString(),
      updatedAt: newNotebook.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedNotebook, { status: 201 });
  } catch (error) {
    console.error("Error creating notebook:", error);
    return NextResponse.json(
      { error: "Failed to create notebook" },
      { status: 500 }
    );
  }
}
