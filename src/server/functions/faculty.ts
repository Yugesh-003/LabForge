import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongodb";
import { triggerAiExtraExerciseGeneration } from "./ai";

export const getFacultyAssignmentsServerFn = createServerFn({ method: "GET" })
  .validator((data: { facultyUsername: string }) => data)
  .handler(async ({ data }) => {
    const db = await getDb();
    const faculty = await db.collection("users").findOne({ username: data.facultyUsername, role: "faculty" });

    if (!faculty) {
      throw new Error(`Faculty user '${data.facultyUsername}' not found.`);
    }

    const assignments = await db
      .collection("facultyAssignments")
      .find({ facultyId: faculty._id })
      .toArray();

    const labIds = assignments.map((a) => a.laboratoryId);
    const labs = await db
      .collection("laboratories")
      .find({ _id: { $in: labIds } })
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
  });

const PublishExerciseSchema = z.object({
  facultyUsername: z.string(),
  labCode: z.string(),
  title: z.string().min(1),
  question: z.string().min(1),
  description: z.string(),
  topic: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  objective: z.string(),
  constraints: z.string(),
  examples: z.array(z.object({ input: z.string(), output: z.string() })).default([]),
  testCases: z.array(z.object({ id: z.string(), input: z.string(), expectedOutput: z.string() })).default([]),
});

export const publishMandatoryExerciseServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => PublishExerciseSchema.parse(data))
  .handler(async ({ data }) => {
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
      examples: data.examples,
      constraints: data.constraints,
      testCases: data.testCases,
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
  });
