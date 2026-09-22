import { ExecutionResult } from "@/types/labforge";
import { executeLabCodeServerFn } from "@/api/functions/execution";

export interface CodeExecutionRequest {
  technology: "MongoDB" | "Python + Jupyter" | "C++";
  code: string;
  studentId?: string;
  testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
}

/**
 * Execution Service abstraction.
 * Sandboxed code execution layer keeping local MongoDB, Jupyter, and C++ execution
 * modular and isolated from Electron main process privileges.
 */
export class ExecutionService {
  public async executeCode(request: CodeExecutionRequest): Promise<ExecutionResult> {
    const startTime = performance.now();

    // 1. Check if running inside Electron secure bridge
    if (typeof window !== "undefined" && (window as any).labforgeBridge?.executeLabCode) {
      try {
        return await (window as any).labforgeBridge.executeLabCode(request);
      } catch (err) {
        console.warn("Electron execution bridge error, falling back to server function:", err);
      }
    }

    // 2. Call real server function
    try {
      const res = await executeLabCodeServerFn({ data: request });
      return res as ExecutionResult;
    } catch (err: any) {
      console.warn("Server execution error:", err);
      const duration = Math.round(performance.now() - startTime);
      return {
        stdout: "",
        stderr: err.message || "Failed to execute code on server.",
        exitCode: 1,
        executionTimeMs: duration,
      };
    }
  }
}

export const executionService = new ExecutionService();

