import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");

    if (!classroomId) {
      return NextResponse.json(
        { error: "classroomId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    const tests = await prisma.testEntry.findMany({
      where: {
        classroomId,
      },
      include: {
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET /api/tests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test entries" },
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
    const { subject, totalMarks, date, classroomId } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const numericTotalMarks = Number(totalMarks);
    if (isNaN(numericTotalMarks) || numericTotalMarks <= 0) {
      return NextResponse.json(
        { error: "Total marks must be a positive number" },
        { status: 400 }
      );
    }

    if (!date || isNaN(Date.parse(date))) {
      return NextResponse.json(
        { error: "Valid test date is required" },
        { status: 400 }
      );
    }

    if (!classroomId || typeof classroomId !== "string") {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    // Verify teacher owns the target classroom
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    const testEntry = await prisma.testEntry.create({
      data: {
        subject: subject.trim(),
        totalMarks: numericTotalMarks,
        date: new Date(date),
        classroomId,
      },
      include: {
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    return NextResponse.json(testEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/tests error:", error);
    return NextResponse.json(
      { error: "Failed to create test entry" },
      { status: 500 }
    );
  }
}
