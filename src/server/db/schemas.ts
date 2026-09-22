import { z } from "zod";
import { ObjectId } from "mongodb";

export const UserRoleSchema = z.enum(["student", "faculty"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1),
  username: z.string().optional(),
  rollNumber: z.string().optional(),
  passwordHash: z.string().min(1),
  role: UserRoleSchema,
  academicYear: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type UserDocument = z.infer<typeof UserDocumentSchema>;

export const SemesterDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  semesterNumber: z.number().int().min(1).max(6),
  academicYear: z.string(),
  name: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type SemesterDocument = z.infer<typeof SemesterDocumentSchema>;

export const LaboratoryDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  semesterNumber: z.number().int(),
  technology: z.string(),
  workspaceType: z.enum(["mongodb", "jupyter", "cpp"]),
  description: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type LaboratoryDocument = z.infer<typeof LaboratoryDocumentSchema>;

export const FacultyAssignmentDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  facultyId: z.instanceof(ObjectId),
  laboratoryId: z.instanceof(ObjectId),
  semesterNumber: z.number().int(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type FacultyAssignmentDocument = z.infer<typeof FacultyAssignmentDocumentSchema>;

export const ExerciseTypeSchema = z.enum(["mandatory", "extra"]);
export const ExerciseStatusSchema = z.enum(["draft", "published", "archived"]);
export const DifficultySchema = z.enum(["Easy", "Medium", "Hard"]);

export const ExerciseDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  exerciseNumber: z.number().int().optional(),
  title: z.string().min(1),
  question: z.string(),
  description: z.string(),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ).default([]),
  constraints: z.string().default(""),
  testCases: z.array(
    z.object({
      id: z.string(),
      input: z.string(),
      expectedOutput: z.string(),
      isHidden: z.boolean().optional(),
    })
  ).default([]),
  expectedOutput: z.string().optional(),
  laboratoryId: z.instanceof(ObjectId),
  semesterNumber: z.number().int().default(5),
  createdBy: z.instanceof(ObjectId),
  type: ExerciseTypeSchema.default("mandatory"),
  status: ExerciseStatusSchema.default("draft"),
  difficulty: DifficultySchema.default("Medium"),
  topic: z.string().default("General"),
  objective: z.string().default(""),
  hints: z.array(z.string()).optional(),
  sourceExerciseId: z.instanceof(ObjectId).optional(),
  aiGenerationStatus: z.enum(["pending", "completed", "failed"]).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type ExerciseDocument = z.infer<typeof ExerciseDocumentSchema>;

export const SubmissionDocumentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  studentId: z.instanceof(ObjectId),
  exerciseId: z.instanceof(ObjectId),
  code: z.string(),
  language: z.string(),
  output: z.string(),
  status: z.enum(["passed", "failed", "error"]),
  testResults: z.array(
    z.object({
      testCaseId: z.string(),
      passed: z.boolean(),
      actualOutput: z.string(),
    })
  ).default([]),
  submittedAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type SubmissionDocument = z.infer<typeof SubmissionDocumentSchema>;
