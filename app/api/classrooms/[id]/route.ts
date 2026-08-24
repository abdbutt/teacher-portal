import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Classroom name is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingClassroom = await prisma.classroom.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    if (!existingClassroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedClassroom = await prisma.classroom.update({
      where: { id },
      data: {
        name: name.trim(),
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

    return NextResponse.json(updatedClassroom);
  } catch (error) {
    console.error("PATCH /api/classrooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update classroom" },
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

    // Verify ownership
    const existingClassroom = await prisma.classroom.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    if (!existingClassroom) {
      return NextResponse.json(
        { error: "Classroom not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.classroom.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/classrooms/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete classroom" },
      { status: 500 }
    );
  }
}
