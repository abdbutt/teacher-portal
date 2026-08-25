import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatReportCardMessage } from "@/lib/whatsapp/template";
import { sendWhatsAppAPI } from "@/lib/whatsapp";


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: testId } = await params;

    const body = await req.json().catch(() => ({}));
    const { studentIds } = body as { studentIds?: string[] };

    // Verify test entry ownership
    const testEntry = await prisma.testEntry.findFirst({
      where: {
        id: testId,
        classroom: {
          teacherId: session.user.id,
        },
      },
      include: {
        classroom: true,
        results: {
          where: studentIds && studentIds.length > 0 ? {
            studentId: { in: studentIds }
          } : undefined,
          include: {
            student: true,
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

    if (!testEntry.results || testEntry.results.length === 0) {
      return NextResponse.json(
        {
          error:
            "No student marks recorded for this test yet. Please enter marks before dispatching report cards.",
        },
        { status: 400 }
      );
    }

    const formattedDate = new Date(testEntry.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    let successCount = 0;
    let failCount = 0;

    const batchSize = 5;
    for (let i = 0; i < testEntry.results.length; i += batchSize) {
      const batch = testEntry.results.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (result) => {
        const percentage =
          testEntry.totalMarks > 0
            ? Math.round((result.obtainedMarks / testEntry.totalMarks) * 100 * 10) / 10
            : 0;

        const messageContent = formatReportCardMessage({
          schoolOrClassName: testEntry.classroom.name,
          studentName: result.student.name,
          rollNumber: result.student.rollNumber,
          parentWhatsappNumber: result.student.parentWhatsappNumber,
          subject: testEntry.subject,
          testDate: formattedDate,
          obtainedMarks: result.obtainedMarks,
          totalMarks: testEntry.totalMarks,
          percentage,
          isPassed: percentage >= 50,
          remarks: result.remarks,
        });

        const dispatchResult = await sendWhatsAppAPI(
          result.student.parentWhatsappNumber,
          messageContent
        );

        if (dispatchResult.success) {
          await prisma.studentResult.update({
            where: { id: result.id },
            data: { messageStatus: "SENT" },
          });
          return true;
        } else {
          await prisma.studentResult.update({
            where: { id: result.id },
            data: { messageStatus: "FAILED" },
          });
          return false;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const res of batchResults) {
        if (res) successCount++;
        else failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched WhatsApp report cards to ${successCount} parent(s).${
        failCount > 0 ? ` ${failCount} failed.` : ""
      }`,
      dispatchedCount: successCount,
      totalCount: testEntry.results.length,
    });
  } catch (error) {
    console.error("POST /api/tests/[id]/dispatch error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch WhatsApp report cards" },
      { status: 500 }
    );
  }
}
