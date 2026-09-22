import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getFacultyAssignments,
  getFacultyExercisesByLab,
  publishMandatoryExercise,
  updateExercise,
  deleteExercise,
} from "../services/facultyService";

export const getFacultyAssignmentsServerFn = createServerFn({ method: "GET" })
  .validator((data: { facultyUsername: string }) => data)
  .handler(async ({ data }) => {
    return await getFacultyAssignments(data.facultyUsername);
  });

export const getFacultyExercisesByLabServerFn = createServerFn({ method: "GET" })
  .validator((data: { labCode: string }) => data)
  .handler(async ({ data }) => {
    return await getFacultyExercisesByLab(data.labCode);
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
    return await publishMandatoryExercise(data);
  });

const UpdateExerciseSchema = z.object({
  exerciseId: z.string(),
  title: z.string().min(1),
  question: z.string().min(1),
  description: z.string(),
  topic: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  objective: z.string(),
  constraints: z.string(),
  testCases: z.array(z.object({ id: z.string(), input: z.string(), expectedOutput: z.string() })).default([]),
});

export const updateExerciseServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UpdateExerciseSchema.parse(data))
  .handler(async ({ data }) => {
    return await updateExercise(data);
  });

export const deleteExerciseServerFn = createServerFn({ method: "POST" })
  .validator((data: { exerciseId: string }) => data)
  .handler(async ({ data }) => {
    return await deleteExercise(data.exerciseId);
  });
