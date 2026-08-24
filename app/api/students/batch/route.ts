import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { phoneE164Regex } from "@/features/students/schemas";

interface BatchStudentInput {
  rollNumber?: string;
  name: string;
  parentWhatsappNumber: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classroomId, students } = body as {
      classroomId: string;
      students: BatchStudentInput[];
    };

    if (!classroomId || typeof classroomId !== "string") {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "No student records provided for batch import" },
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

    // Server-side validation of all records
    const validStudents: Array<{
      rollNumber: string | null;
      name: string;
      parentWhatsappNumber: string;
      classroomId: string;
    }> = [];

    const errors: string[] = [];

    students.forEach((student, idx) => {
      const rowNum = idx + 1;
      const name = student.name?.trim();
      const phone = student.parentWhatsappNumber?.trim();
      const rollNumber = student.rollNumber?.trim() || null;

      if (!name || name.length < 2) {
        errors.push(`Row ${rowNum}: Name is required and must be at least 2 characters.`);
        return;
      }

      if (!phone || !phoneE164Regex.test(phone)) {
        errors.push(`Row ${rowNum} (${name}): Invalid WhatsApp format "${phone}". Must be E.164 (e.g. +923001234567).`);
        return;
      }

      validStudents.push({
        rollNumber,
        name,
        parentWhatsappNumber: phone,
        classroomId,
      });
    });

    if (validStudents.length === 0) {
      return NextResponse.json(
        {
          error: "All provided records failed validation.",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Perform bulk create
    const result = await prisma.student.createMany({
      data: validStudents,
    });

    return NextResponse.json(
      {
        count: result.count,
        message: `Successfully imported ${result.count} students.`,
        skippedCount: students.length - validStudents.length,
        validationErrors: errors,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/students/batch error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk student import" },
      { status: 500 }
    );
  }
}
