export type Role = "student" | "faculty";

export type LabTechnology = "MongoDB" | "Python + Jupyter" | "C++";

export interface Lab {
  id: string;
  name: string;
  short: string;
  technology: LabTechnology;
  detail: string;
  icon: "database" | "language" | "code";
  color: "lime" | "cyan" | "orange";
  semester: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Exercise {
  id: string;
  labId: string;
  semester: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status?: "passed" | "in-progress" | "not-started";
  timeEstimate: string;
  question: string;
  description: string;
  learningObjective: string;
  constraints?: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  hints?: string[];
  isMandatory: boolean;
  isAiGenerated: boolean;
  parentExerciseId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  rollNumber?: string;
  username?: string;
  semester?: number;
  academicYear?: string;
}

export interface Submission {
  id: string;
  exerciseId: string;
  studentId: string;
  code: string;
  status: "passed" | "failed" | "error";
  testResults: Array<{
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    executionTimeMs: number;
  }>;
  submittedAt: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  testResults?: Array<{
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
  }>;
}
