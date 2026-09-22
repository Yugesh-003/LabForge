import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export interface PythonExecutionOptions {
  code: string;
  timeoutMs?: number;
  testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  pythonFound: boolean;
  pythonVersion?: string;
  installedPackages?: Record<string, boolean>;
  testResults?: Array<{ testCaseId: string; passed: boolean; actualOutput: string }>;
}

export async function checkPythonEnvironment(): Promise<{
  available: boolean;
  pythonCmd?: string;
  version?: string;
  packages: {
    nltk: boolean;
    spacy: boolean;
    sklearn: boolean;
    numpy: boolean;
    pandas: boolean;
  };
}> {
  const result = {
    available: false,
    pythonCmd: undefined as string | undefined,
    version: undefined as string | undefined,
    packages: {
      nltk: false,
      spacy: false,
      sklearn: false,
      numpy: false,
      pandas: false,
    },
  };

  const candidates = ["python", "python3"];
  for (const cmd of candidates) {
    try {
      const { stdout } = await execAsync(`${cmd} --version`);
      result.available = true;
      result.pythonCmd = cmd;
      result.version = stdout.trim();
      break;
    } catch {
      // try next
    }
  }

  if (result.available && result.pythonCmd) {
    const tmpScript = path.join(os.tmpdir(), `labforge-pkg-check-${Date.now()}.py`);
    const pkgScript = `import sys, json
pkgs = ['nltk', 'spacy', 'sklearn', 'numpy', 'pandas']
res = {}
for p in pkgs:
    try:
        __import__(p)
        res[p] = True
    except ImportError:
        res[p] = False
print(json.dumps(res))
`;
    try {
      fs.writeFileSync(tmpScript, pkgScript, "utf-8");
      const { stdout } = await execAsync(`"${result.pythonCmd}" "${tmpScript}"`);
      const parsed = JSON.parse(stdout.trim());
      result.packages = { ...result.packages, ...parsed };
    } catch {
      // Ignore package check failure
    } finally {
      if (fs.existsSync(tmpScript)) {
        try { fs.unlinkSync(tmpScript); } catch {}
      }
    }
  }

  return result;
}

export async function runPythonCode(options: PythonExecutionOptions): Promise<PythonExecutionResult> {
  const env = await checkPythonEnvironment();
  const startTime = performance.now();
  const timeoutMs = options.timeoutMs || 5000;

  if (!env.available || !env.pythonCmd) {
    return {
      stdout: "",
      stderr: "Python 3 executable not found in system PATH. Please install Python 3.9+ to run NLP Jupyter labs.",
      exitCode: 127,
      executionTimeMs: 0,
      pythonFound: false,
      installedPackages: env.packages,
    };
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "labforge-py-"));
  const sourceFile = path.join(tmpDir, "script.py");

  try {
    // Smart wrapper to handle interactive input() calls without hanging
    const inputWrapper = `import builtins
import sys

_labforge_orig_input = builtins.input

def _labforge_smart_input(prompt=""):
    if prompt:
        print(prompt, end="", flush=True)
    try:
        if not sys.stdin.isatty():
            line = sys.stdin.readline()
            if line:
                res = line.rstrip('\\r\\n')
                print(res)
                return res
    except Exception:
        pass

    if not hasattr(_labforge_smart_input, "_counter"):
        _labforge_smart_input._counter = 0
    _labforge_smart_input._counter += 1

    if _labforge_smart_input._counter > 4:
        raise EOFError("Interactive input session concluded.")

    sample_inputs = ["hello", "how are you", "tell me a joke", "bye", "exit"]
    val = sample_inputs[(_labforge_smart_input._counter - 1) % len(sample_inputs)]
    print(val)
    return val

builtins.input = _labforge_smart_input
`;

    const fullCode = `${inputWrapper}\n# --- Student Workspace Code ---\n${options.code}`;
    fs.writeFileSync(sourceFile, fullCode, "utf-8");
    const runCmd = `"${env.pythonCmd}" "${sourceFile}"`;

    const execStartTime = performance.now();
    try {
      const { stdout, stderr } = await execAsync(runCmd, {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024,
      });

      const duration = Math.round(performance.now() - execStartTime);
      const trimmedStdout = stdout ? stdout.trim() : "";

      let testResults: Array<{ testCaseId: string; passed: boolean; actualOutput: string }> | undefined = undefined;
      if (options.testCases && options.testCases.length > 0) {
        testResults = options.testCases.map((tc) => {
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
        pythonFound: true,
        pythonVersion: env.version,
        installedPackages: env.packages,
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
        pythonFound: true,
        pythonVersion: env.version,
        installedPackages: env.packages,
      };
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup error
    }
  }
}
