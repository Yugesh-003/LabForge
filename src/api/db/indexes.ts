import { Db } from "mongodb";

export async function ensureDatabaseIndexes(db: Db): Promise<void> {
  console.log("Ensuring MongoDB indexes exist...");

  // 1. users indexes
  await db.collection("users").createIndex({ rollNumber: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ role: 1 });

  // 2. semesters indexes
  await db.collection("semesters").createIndex({ semesterNumber: 1, academicYear: 1 }, { unique: true });

  // 3. laboratories indexes
  await db.collection("laboratories").createIndex({ code: 1 }, { unique: true });
  await db.collection("laboratories").createIndex({ semesterNumber: 1 });

  // 4. facultyAssignments indexes
  await db.collection("facultyAssignments").createIndex({ facultyId: 1, laboratoryId: 1 }, { unique: true });

  // 5. exercises indexes
  await db.collection("exercises").createIndex({ laboratoryId: 1, type: 1, status: 1 });
  await db.collection("exercises").createIndex({ sourceExerciseId: 1 });
  await db.collection("exercises").createIndex({ laboratoryId: 1, title: 1 });

  // 6. submissions indexes
  await db.collection("submissions").createIndex({ studentId: 1, exerciseId: 1 });
  await db.collection("submissions").createIndex({ submittedAt: -1 });

  console.log("MongoDB indexes verified successfully.");
}
