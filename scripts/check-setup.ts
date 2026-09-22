import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { MongoClient } from "mongodb";

const execAsync = promisify(exec);

// Parse .env if present
const envFilePath = path.join(process.cwd(), ".env");
if (fs.existsSync(envFilePath)) {
  const envText = fs.readFileSync(envFilePath, "utf-8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valParts] = trimmed.split("=");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = valParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  actionableFix?: string;
  isWarning?: boolean;
}

async function runHealthCheck() {
  console.log("\n===========================================================");
  console.log(" 🧪 LABFORGE SYSTEM SETUP & TOOLCHAIN HEALTH CHECK");
  console.log("===========================================================\n");

  const results: CheckResult[] = [];

  // 1. Check Node.js
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split(".")[0], 10);
    if (major >= 18) {
      results.push({
        name: "Node.js Environment",
        passed: true,
        message: `Detected ${nodeVersion} (v18+ requirement met)`,
      });
    } else {
      results.push({
        name: "Node.js Environment",
        passed: false,
        message: `Detected ${nodeVersion} (requires Node.js v18 or higher)`,
        actionableFix: "Download and install Node.js 18+ from https://nodejs.org/",
      });
    }
  } catch (err: any) {
    results.push({
      name: "Node.js Environment",
      passed: false,
      message: err.message,
      actionableFix: "Install Node.js 18+ from https://nodejs.org/",
    });
  }

  // 2. Check Package Manager (npm)
  try {
    const { stdout } = await execAsync("npm --version");
    results.push({
      name: "Package Manager (npm)",
      passed: true,
      message: `Detected npm v${stdout.trim()}`,
    });
  } catch (err: any) {
    results.push({
      name: "Package Manager (npm)",
      passed: false,
      message: "npm executable not found in PATH",
      actionableFix: "Reinstall Node.js to get npm package manager",
    });
  }

  // 3. Check Environment Configuration (.env)
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("MONGODB_URI")) {
      results.push({
        name: "Environment Configuration (.env)",
        passed: true,
        message: ".env file exists with MONGODB_URI configured",
      });
    } else {
      results.push({
        name: "Environment Configuration (.env)",
        passed: false,
        message: ".env exists but missing MONGODB_URI entry",
        actionableFix: "Add MONGODB_URI=mongodb://127.0.0.1:27017 to your .env file",
      });
    }
  } else {
    results.push({
      name: "Environment Configuration (.env)",
      passed: false,
      message: ".env configuration file is missing",
      actionableFix: "Copy .env.example to .env: cp .env.example .env",
    });
  }

  // 4. Check MongoDB Connection
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  try {
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    const adminDb = client.db("admin");
    const ping = await adminDb.command({ ping: 1 });
    await client.close();

    if (ping.ok === 1) {
      results.push({
        name: "MongoDB Database Connection",
        passed: true,
        message: `Successfully connected to MongoDB at ${mongoUri}`,
      });
    } else {
      results.push({
        name: "MongoDB Database Connection",
        passed: false,
        message: "MongoDB ping command returned non-ok status",
        actionableFix: "Check MongoDB logs or restart MongoDB service",
      });
    }
  } catch (err: any) {
    results.push({
      name: "MongoDB Database Connection",
      passed: false,
      message: `Failed to connect to ${mongoUri}: ${err.message}`,
      actionableFix:
        "Start MongoDB locally:\n  Windows: Open services.msc and start 'MongoDB Server'\n  Linux/macOS: sudo systemctl start mongod or brew services start mongodb-community",
    });
  }

  // 5. Check C++ Compiler
  try {
    const { stdout } = await execAsync("g++ --version");
    results.push({
      name: "C++ Compiler (g++)",
      passed: true,
      message: `Detected ${stdout.split("\n")[0]}`,
    });
  } catch {
    try {
      const { stdout } = await execAsync("clang++ --version");
      results.push({
        name: "C++ Compiler (clang++)",
        passed: true,
        message: `Detected ${stdout.split("\n")[0]}`,
      });
    } catch {
      results.push({
        name: "C++ Compiler",
        passed: false,
        isWarning: true,
        message: "g++ or clang++ compiler not found in system PATH",
        actionableFix:
          "Install GCC/MinGW-w64 (Windows: via MSYS2 or MinGW; macOS: xcode-select --install; Linux: build-essential) and add to PATH",
      });
    }
  }

  // 6. Check Python 3
  let pythonCmd: string | null = null;
  for (const cmd of ["python", "python3"]) {
    try {
      const { stdout } = await execAsync(`${cmd} --version`);
      pythonCmd = cmd;
      results.push({
        name: "Python 3 Environment",
        passed: true,
        message: `Detected ${stdout.trim()} (${cmd})`,
      });
      break;
    } catch {
      // try next
    }
  }

  if (!pythonCmd) {
    results.push({
      name: "Python 3 Environment",
      passed: false,
      isWarning: true,
      message: "Python 3 executable not found in PATH",
      actionableFix: "Download Python 3.9+ from https://python.org and check 'Add to PATH' during installation",
    });
  }

  // 7. Check Required Python Packages & Jupyter Kernel
  if (pythonCmd) {
    const tmpPyFile = path.join(process.cwd(), "scripts", "_check_pkgs.py");
    const pyScript = `
import sys, json
pkgs = ['nltk', 'spacy', 'sklearn', 'numpy', 'pandas']
missing = []
for p in pkgs:
    try:
        __import__(p)
    except ImportError:
        missing.append(p)
print(json.dumps(missing))
`;
    try {
      fs.writeFileSync(tmpPyFile, pyScript, "utf-8");
      const { stdout } = await execAsync(`"${pythonCmd}" "${tmpPyFile}"`);
      const missing = JSON.parse(stdout.trim()) as string[];
      if (missing.length === 0) {
        results.push({
          name: "Python NLP Packages (nltk, spacy, sklearn, numpy, pandas)",
          passed: true,
          message: "All required Python NLP packages are installed",
        });
      } else {
        results.push({
          name: "Python NLP Packages",
          passed: false,
          isWarning: true,
          message: `Missing Python packages: ${missing.join(", ")}`,
          actionableFix: `Run: pip install ${missing.join(" ")}`,
        });
      }
    } catch (err: any) {
      results.push({
        name: "Python NLP Packages",
        passed: false,
        isWarning: true,
        message: "Failed to execute Python package check script",
        actionableFix: "Run: pip install nltk spacy scikit-learn numpy pandas",
      });
    } finally {
      if (fs.existsSync(tmpPyFile)) {
        try { fs.unlinkSync(tmpPyFile); } catch {}
      }
    }
  }

  // 8. Check Required Directories
  const requiredDirs = ["src", "scripts", "electron", "public"];
  const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(path.join(process.cwd(), dir)));
  if (missingDirs.length === 0) {
    results.push({
      name: "Project Structure & Directories",
      passed: true,
      message: `All required directories exist (${requiredDirs.join(", ")})`,
    });
  } else {
    results.push({
      name: "Project Structure & Directories",
      passed: false,
      message: `Missing core directories: ${missingDirs.join(", ")}`,
      actionableFix: "Ensure you are running check-setup from the root project directory",
    });
  }

  // Display Output Summary
  let criticalFailures = 0;
  for (const res of results) {
    if (res.passed) {
      console.log(` ✅ [PASS] ${res.name}`);
      console.log(`    ↳ ${res.message}\n`);
    } else if (res.isWarning) {
      console.log(` ⚠️  [WARN] ${res.name}`);
      console.log(`    ↳ ${res.message}`);
      if (res.actionableFix) {
        console.log(`    💡 FIX: ${res.actionableFix.replace(/\n/g, "\n            ")}`);
      }
      console.log("");
    } else {
      criticalFailures++;
      console.log(` ❌ [FAIL] ${res.name}`);
      console.log(`    ↳ ${res.message}`);
      if (res.actionableFix) {
        console.log(`    💡 FIX: ${res.actionableFix.replace(/\n/g, "\n            ")}`);
      }
      console.log("");
    }
  }

  console.log("===========================================================");
  if (criticalFailures === 0) {
    console.log(" 🎉 HEALTH CHECK SUCCESSFUL: Project is ready for execution!");
    console.log("===========================================================\n");
  } else {
    console.log(` 💥 HEALTH CHECK COMPLETED: ${criticalFailures} critical issue(s) detected.`);
    console.log("    Follow the actionable fixes above before starting LabForge.");
    console.log("===========================================================\n");
    process.exit(1);
  }
}

runHealthCheck();
