import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;

    // Fetch test entry with classroom ownership check
    const testEntry = await prisma.testEntry.findFirst({
      where: {
        id: testId,
        classroom: {
          teacherId: session.user.id,
        },
      },
      include: {
        classroom: {
          include: {
            students: {
              orderBy: {
                name: "asc",
              },
            },
          },
        },
      },
    });

    if (!testEntry) {
      return NextResponse.json(
        { error: "Test entry not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch existing results for this test
    const existingResults = await prisma.studentResult.findMany({
      where: {
        testEntryId: testId,
      },
    });

    const resultsMap = new Map(
      existingResults.map((r) => [r.studentId, r])
    );

    // Merge student roster with existing test results
    const resultsList = testEntry.classroom.students.map((student) => {
      const recorded = resultsMap.get(student.id);
      const obtainedMarks = recorded ? recorded.obtainedMarks : null;
      const percentage =
        obtainedMarks !== null && testEntry.totalMarks > 0
          ? Math.round((obtainedMarks / testEntry.totalMarks) * 100 * 10) / 10
          : null;
      const isPassed = percentage !== null ? percentage >= 50 : null;

      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        parentWhatsappNumber: student.parentWhatsappNumber,
        obtainedMarks,
        remarks: recorded?.remarks || "",
        messageStatus: recorded?.messageStatus || "PENDING",
        percentage,
        isPassed,
      };
    });

    return NextResponse.json({
      test: {
        id: testEntry.id,
        subject: testEntry.subject,
        totalMarks: testEntry.totalMarks,
        date: testEntry.date,
        classroomId: testEntry.classroomId,
      },
      results: resultsList,
    });
  } catch (error) {
    console.error("GET /api/tests/[id]/results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test results" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;
    const body = await req.json();
    const { results } = body as {
      results: Array<{
        studentId: string;
        obtainedMarks: number;
        remarks?: string;
      }>;
    };

    if (!Array.isArray(results)) {
      return NextResponse.json(
        { error: "Results must be an array of student marks" },
        { status: 400 }
      );
    }

    // Verify test entry ownership
    const testEntry = await prisma.testEntry.findFirst({
      where: {
        id: testId,
        classroom: {
          teacherId: session.user.id,
        },
      },
    });

    if (!testEntry) {
      return NextResponse.json(
        { error: "Test entry not found or unauthorized" },
        { status: 404 }
      );
    }

    // Server-side validation of marks
    for (const r of results) {
      if (typeof r.obtainedMarks !== "number" || isNaN(r.obtainedMarks)) {
        return NextResponse.json(
          { error: "Obtained marks must be a valid number for all students" },
          { status: 400 }
        );
      }

      if (r.obtainedMarks < 0 || r.obtainedMarks > testEntry.totalMarks) {
        return NextResponse.json(
          {
            error: `Obtained marks (${r.obtainedMarks}) cannot be negative or exceed total marks (${testEntry.totalMarks})`,
          },
          { status: 400 }
        );
      }
    }

    // Perform atomic transaction upsert
    await prisma.$transaction(
      results.map((item) =>
        prisma.studentResult.upsert({
          where: {
            testEntryId_studentId: {
              testEntryId: testId,
              studentId: item.studentId,
            },
          },
          update: {
            obtainedMarks: item.obtainedMarks,
            remarks: item.remarks?.trim() || null,
          },
          create: {
            testEntryId: testId,
            studentId: item.studentId,
            obtainedMarks: item.obtainedMarks,
            remarks: item.remarks?.trim() || null,
            messageStatus: "PENDING",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully saved marks for ${results.length} student(s).`,
    });
  } catch (error) {
    console.error("POST /api/tests/[id]/results error:", error);
    return NextResponse.json(
      { error: "Failed to save test results" },
      { status: 500 }
    );
  }
}
