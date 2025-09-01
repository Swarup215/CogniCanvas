import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      include: {
        _count: {
          select: { notebooks: true },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      icon: subject.icon,
      userId: subject.userId,
      notebookCount: subject._count.notebooks,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, color, icon } = body;

    // First, ensure we have a default user
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

    const newSubject = await db.subject.create({
      data: {
        name,
        description,
        color,
        icon,
        userId: defaultUser.id,
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
