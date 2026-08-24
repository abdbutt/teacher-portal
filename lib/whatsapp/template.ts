import { ReportCardData } from "./types";

export function formatReportCardMessage(data: ReportCardData): string {
  const rollStr = data.rollNumber ? ` (Roll: #${data.rollNumber})` : "";
  const statusEmoji = data.isPassed ? "✅" : "⚠️";
  const statusText = data.isPassed ? "PASS" : "NEEDS IMPROVEMENT";
  const remarksText = data.remarks ? data.remarks.trim() : "Keep up the hard work!";

  return `🎓 *STUDENT ACADEMIC REPORT CARD*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 *Class:* ${data.schoolOrClassName}
👤 *Student:* ${data.studentName}${rollStr}
📚 *Subject:* ${data.subject}
📅 *Test Date:* ${data.testDate}

📊 *PERFORMANCE OVERVIEW*
• Marks Obtained: *${data.obtainedMarks} / ${data.totalMarks}*
• Percentage: *${data.percentage}%*
• Result Status: ${statusEmoji} *${statusText}*

📝 *Teacher Remarks:*
"${remarksText}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Sent via TeacherPortal Automated System_`;
}
