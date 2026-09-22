import { exec, execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface CppExecutionOptions {
  code: string;
  input?: string;
  timeoutMs?: number;
  testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
}

export interface CppExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  compilerFound: boolean;
  compilerName?: string;
  testResults?: Array<{ testCaseId: string; passed: boolean; actualOutput: string }>;
}

export async function checkCppCompiler(): Promise<{ available: boolean; name?: string; version?: string }> {
  try {
    const { stdout } = await execAsync("g++ --version");
    const firstLine = stdout.split("\n")[0];
    return { available: true, name: "g++", version: firstLine };
  } catch {
    try {
      const { stdout } = await execAsync("clang++ --version");
      const firstLine = stdout.split("\n")[0];
      return { available: true, name: "clang++", version: firstLine };
    } catch {
      return { available: false };
    }
  }
}

export async function runCppCode(options: CppExecutionOptions): Promise<CppExecutionResult> {
  const compilerInfo = await checkCppCompiler();
  const startTime = performance.now();
  const timeoutMs = options.timeoutMs || 5000;

  if (!compilerInfo.available) {
    return {
      stdout: "",
      stderr: "C++ Compiler (g++ or clang++) not found in system PATH. Please install GCC or MinGW-w64 to execute C++ code natively.",
      exitCode: 127,
      executionTimeMs: 0,
      compilerFound: false,
    };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "labforge-cpp-"));
  const sourceFile = path.join(tmpDir, "solution.cpp");
  const exeFile = path.join(tmpDir, os.platform() === "win32" ? "solution.exe" : "solution");

  try {
    fs.writeFileSync(sourceFile, options.code, "utf-8");

    // 1. Compile step
    const compiler = compilerInfo.name || "g++";
    const compileCmd = `${compiler} -std=c++17 "${sourceFile}" -o "${exeFile}"`;
    
    try {
      await execAsync(compileCmd, { timeout: 10000 });
    } catch (compileErr: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        stdout: compileErr.stdout || "",
        stderr: compileErr.stderr || compileErr.message || "Compilation failed.",
        exitCode: compileErr.code || 1,
        executionTimeMs: duration,
        compilerFound: true,
        compilerName: compilerInfo.name,
      };
    }

    // 2. Execute step
    const execStartTime = performance.now();
    try {
      const execPromise = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        const child = execFile(exeFile, [], { timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
          if (err) return reject({ ...err, stdout, stderr });
          resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
        });

        if (child.stdin) {
          const inputData = options.input || "1\n2\n3\nhello\nexit\n";
          child.stdin.write(inputData);
          child.stdin.end();
        }
      });

      const { stdout, stderr } = await execPromise;
      const duration = Math.round(performance.now() - execStartTime);
      const trimmedStdout = stdout ? stdout.trim() : "";
      
      // Check test cases if provided
      let testResults: Array<{ testCaseId: string; passed: boolean; actualOutput: string }> | undefined = undefined;
      if (options.testCases && options.testCases.length > 0) {
        testResults = options.testCases.map((tc) => {
          // If single test case matched output
          const passed = trimmedStdout.includes(tc.expectedOutput.trim());
          return {
            testCaseId: tc.id,
            passed,
            actualOutput: trimmedStdout,
          };
        });
      }

      return {
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: 0,
        executionTimeMs: duration,
        compilerFound: true,
        compilerName: compilerInfo.name,
        testResults,
      };
    } catch (execErr: any) {
      const duration = Math.round(performance.now() - execStartTime);
      const isTimeout = execErr.killed || execErr.signal === "SIGTERM";
      return {
        stdout: execErr.stdout || "",
        stderr: isTimeout ? `Execution timed out after ${timeoutMs}ms.` : execErr.stderr || execErr.message,
        exitCode: execErr.code || 1,
        executionTimeMs: duration,
        compilerFound: true,
        compilerName: compilerInfo.name,
      };
    }
  } finally {
    // Cleanup temporary files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup error
    }
  }
}
