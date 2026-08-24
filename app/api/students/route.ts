import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { phoneE164Regex } from "@/features/students/schemas";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rollNumber, name, parentWhatsappNumber, classroomId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }

    if (
      !parentWhatsappNumber ||
      typeof parentWhatsappNumber !== "string" ||
      !phoneE164Regex.test(parentWhatsappNumber.trim())
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid WhatsApp number. Must be in E.164 format (e.g. +923001234567)",
        },
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

    const student = await prisma.student.create({
      data: {
        rollNumber: rollNumber?.trim() || null,
        name: name.trim(),
        parentWhatsappNumber: parentWhatsappNumber.trim(),
        classroomId,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to add student" },
      { status: 500 }
    );
  }
}
