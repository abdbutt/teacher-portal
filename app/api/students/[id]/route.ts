import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { phoneE164Regex } from "@/features/students/schemas";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rollNumber, name, parentWhatsappNumber } = body;

    // Verify student exists and belongs to a classroom owned by teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        classroom: {
          teacherId: session.user.id,
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found or unauthorized" },
        { status: 404 }
      );
    }

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

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        rollNumber: rollNumber?.trim() || null,
        name: name.trim(),
        parentWhatsappNumber: parentWhatsappNumber.trim(),
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("PATCH /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify student exists and belongs to a classroom owned by teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        classroom: {
          teacherId: session.user.id,
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Student removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
