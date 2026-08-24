import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ClassroomDetail } from "@/features/students/components/classroom-detail";

interface ClassroomDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClassroomDetailPage({
  params,
}: ClassroomDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  return <ClassroomDetail classroomId={id} />;
}
