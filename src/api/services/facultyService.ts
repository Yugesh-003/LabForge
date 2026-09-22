import { ObjectId } from "mongodb";
import { getDb } from "../db/mongodb";
import { triggerAiExtraExerciseGeneration } from "./aiService";

export async function getFacultyAssignments(facultyUsername: string) {
  const db = await getDb();
  const labs = await db
    .collection("laboratories")
    .find({ semesterNumber: 5, isActive: true })
    .toArray();

  return labs.map((lab) => ({
    id: lab._id.toString(),
    name: lab.name,
    code: lab.code,
    technology: lab.technology,
    workspaceType: lab.workspaceType,
    semesterNumber: lab.semesterNumber,
    description: lab.description,
  }));
}

export async function getFacultyExercisesByLab(labCode: string) {
  const db = await getDb();
  const lab = await db.collection("laboratories").findOne({ code: labCode });
  if (!lab) return [];

  const docs = await db
    .collection("exercises")
    .find({ laboratoryId: lab._id })
    .sort({ exerciseNumber: 1, createdAt: 1 })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    exerciseNumber: doc.exerciseNumber,
    title: doc.title,
    topic: doc.topic || "General",
    difficulty: doc.difficulty || "Medium",
    question: doc.question || doc.title,
    description: doc.description || "",
    learningObjective: doc.objective || "",
    constraints: doc.constraints || "",
    type: doc.type || "mandatory",
    examples: doc.examples || [],
    testCases: doc.testCases || [],
    hints: doc.hints || [],
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

export async function publishMandatoryExercise(data: any) {
  const db = await getDb();

  const faculty = await db.collection("users").findOne({ username: data.facultyUsername, role: "faculty" });
  if (!faculty) throw new Error("Unauthorized faculty session.");

  const lab = await db.collection("laboratories").findOne({ code: data.labCode });
  if (!lab) throw new Error(`Laboratory code '${data.labCode}' not found.`);

  // Duplicate check
  const existing = await db.collection("exercises").findOne({
    laboratoryId: lab._id,
    title: data.title,
    type: "mandatory",
  });

  if (existing) {
    return {
      isDuplicate: true,
      mandatory: { id: existing._id.toString(), ...existing },
      aiGenerated: [],
      message: `Exercise titled '${data.title}' is already published in ${lab.name}.`,
    };
  }

  const count = await db.collection("exercises").countDocuments({ laboratoryId: lab._id, type: "mandatory" });
  const newNumber = count + 1;

  const newExercise = {
    exerciseNumber: newNumber,
    title: data.title,
    question: data.question,
    description: data.description,
    examples: data.examples || [],
    constraints: data.constraints,
    testCases: data.testCases || [],
    laboratoryId: lab._id,
    semesterNumber: lab.semesterNumber,
    createdBy: faculty._id,
    type: "mandatory" as const,
    status: "published" as const,
    difficulty: data.difficulty,
    topic: data.topic,
    objective: data.objective,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = await db.collection("exercises").insertOne(newExercise);
  const mandatoryId = res.insertedId;

  // AUTOMATIC BACKEND AI EXTRA EXERCISE GENERATION
  let aiExtras: any[] = [];
  try {
    aiExtras = await triggerAiExtraExerciseGeneration({
      mandatoryExerciseId: mandatoryId.toString(),
      labId: lab._id.toString(),
      facultyId: faculty._id.toString(),
      topic: data.topic,
      objective: data.objective,
      difficulty: data.difficulty,
      title: data.title,
    });
  } catch (err) {
    console.warn("AI Extra exercise generation warning (mandatory exercise remains published):", err);
  }

  return {
    isDuplicate: false,
    mandatory: { id: mandatoryId.toString(), title: data.title },
    aiGenerated: aiExtras,
    message: `Mandatory exercise published successfully! AI generated ${aiExtras.length} extra exercises.`,
  };
}

export async function updateExercise(data: any) {
  const db = await getDb();
  if (!ObjectId.isValid(data.exerciseId)) throw new Error("Invalid exercise ID");

  const res = await db.collection("exercises").updateOne(
    { _id: new ObjectId(data.exerciseId) },
    {
      $set: {
        title: data.title,
        question: data.question,
        description: data.description,
        topic: data.topic,
        difficulty: data.difficulty,
        objective: data.objective,
        constraints: data.constraints,
        testCases: data.testCases,
        updatedAt: new Date(),
      },
    }
  );

  return { success: res.modifiedCount > 0, message: "Exercise updated successfully." };
}

export async function deleteExercise(exerciseId: string) {
  const db = await getDb();
  if (!ObjectId.isValid(exerciseId)) throw new Error("Invalid exercise ID");

  const res = await db.collection("exercises").deleteOne({ _id: new ObjectId(exerciseId) });
  return { success: res.deletedCount > 0, message: "Exercise deleted successfully from MongoDB." };
}
