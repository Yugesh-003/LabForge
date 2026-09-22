import { createServerFn } from "@tanstack/react-start";
import { getStudentLabs, getLabExercises, submitExerciseWork } from "../services/studentService";

export const getStudentLabsServerFn = createServerFn({ method: "GET" })
  .validator((data: { semesterNumber?: number }) => data)
  .handler(async ({ data }) => {
    return await getStudentLabs(data?.semesterNumber || 5);
  });

export const getLabExercisesServerFn = createServerFn({ method: "GET" })
  .validator((data: { labId?: string; labCode?: string }) => data)
  .handler(async ({ data }) => {
    return await getLabExercises(data);
  });

export const submitExerciseWorkServerFn = createServerFn({ method: "POST" })
  .validator((data: { studentId?: string; exerciseId: string; code: string; language: string }) => data)
  .handler(async ({ data }) => {
    return await submitExerciseWork(data);
  });
