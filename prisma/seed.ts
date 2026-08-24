import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create or upsert default teacher
  const hashedPassword = await bcrypt.hash("password123", 10);
  const teacher = await prisma.teacher.upsert({
    where: { email: "teacher@example.com" },
    update: {
      password: hashedPassword,
      name: "Professor Alex Vance",
    },
    create: {
      email: "teacher@example.com",
      name: "Professor Alex Vance",
      password: hashedPassword,
    },
  });

  console.log(`✅ Teacher created: ${teacher.email} (Password: password123)`);

  // 2. Create sample classroom
  const existingClassroom = await prisma.classroom.findFirst({
    where: { teacherId: teacher.id, name: "Grade 10 - Section A" },
  });

  const classroom =
    existingClassroom ||
    (await prisma.classroom.create({
      data: {
        name: "Grade 10 - Section A",
        teacherId: teacher.id,
      },
    }));

  console.log(`✅ Sample Classroom ready: ${classroom.name}`);

  // 3. Create sample students
  const sampleStudents = [
    { name: "Aarav Sharma", parentWhatsappNumber: "+923001234567" },
    { name: "Sophia Chen", parentWhatsappNumber: "+14155552671" },
    { name: "Zain Malik", parentWhatsappNumber: "+923009876543" },
    { name: "Emma Watson", parentWhatsappNumber: "+447700900077" },
  ];

  for (const studentData of sampleStudents) {
    const existing = await prisma.student.findFirst({
      where: { classroomId: classroom.id, name: studentData.name },
    });
    if (!existing) {
      await prisma.student.create({
        data: {
          ...studentData,
          classroomId: classroom.id,
        },
      });
    }
  }

  console.log("✅ Sample students created");

  console.log("🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
