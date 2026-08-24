import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
            testEntries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(classrooms);
  } catch (error) {
    console.error("GET /api/classrooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Classroom name is required" },
        { status: 400 }
      );
    }

    const newClassroom = await prisma.classroom.create({
      data: {
        name: name.trim(),
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
            testEntries: true,
          },
        },
      },
    });

    return NextResponse.json(newClassroom, { status: 201 });
  } catch (error) {
    console.error("POST /api/classrooms error:", error);
    return NextResponse.json(
      { error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
