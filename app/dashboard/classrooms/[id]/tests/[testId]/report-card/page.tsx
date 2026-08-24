import { PrintableReportCardView } from "@/features/tests/components/printable-report-card";

interface PageProps {
  params: Promise<{
    id: string;
    testId: string;
  }>;
}

export default async function ReportCardPage({ params }: PageProps) {
  const { id: classroomId, testId } = await params;
  return <PrintableReportCardView classroomId={classroomId} testId={testId} />;
}
