import assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { MongoClient, ObjectId } from "mongodb";

import { loginUser, signupUser } from "../src/api/services/authService";
import {
  getFacultyAssignments,
  getFacultyExercisesByLab,
  publishMandatoryExercise,
} from "../src/api/services/facultyService";
import { runCppCode } from "../src/api/services/cppRunner";
import { runPythonCode } from "../src/api/services/jupyterRunner";
import { runMongoQuery } from "../src/api/services/mongoRunner";
import { triggerAiExtraExerciseGeneration, processGeminiChat } from "../src/api/services/aiService";
import { getDb } from "../src/api/db/mongodb";

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

let passedCount = 0;
let failedCount = 0;

async function runTest(category: string, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [${category}] ${name}`);
    passedCount++;
  } catch (err: any) {
    console.log(`  ❌ [${category}] ${name}`);
    console.log(`     ↳ Error: ${err.message || err}\n`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("\n===========================================================");
  console.log(" 🧪 LABFORGE AUTOMATED SYSTEM & INTEGRATION TEST SUITE");
  console.log("===========================================================\n");

  const db = await getDb();

  // 1. AUTH TESTS
  console.log("▶ 1. AUTHENTICATION & AUTHORIZATION TESTS");

  await runTest("AUTH", "Student login with valid credentials (242204)", async () => {
    const res = await loginUser({
      identity: "242204",
      password: "student123",
      role: "student",
    });
    assert.strictEqual(res.role, "student");
    assert.strictEqual(res.rollNumber, "242204");
  });

  await runTest("AUTH", "Faculty login with valid credentials (faculty_dsa)", async () => {
    const res = await loginUser({
      identity: "faculty_dsa",
      password: "faculty123",
      role: "faculty",
    });
    assert.strictEqual(res.role, "faculty");
    assert.strictEqual(res.username, "faculty_dsa");
  });

  await runTest("AUTH", "Invalid login fails cleanly with clear error message", async () => {
    try {
      await loginUser({
        identity: "242204",
        password: "wrongpassword",
        role: "student",
      });
      assert.fail("Should have thrown an invalid credentials error");
    } catch (err: any) {
      assert(err.message.includes("Invalid credentials"));
    }
  });

  await runTest("AUTH", "Role authorization check (Student cannot authenticate as Faculty)", async () => {
    try {
      await loginUser({
        identity: "242204",
        password: "student123",
        role: "faculty",
      });
      assert.fail("Should have failed faculty login for student identity");
    } catch (err: any) {
      assert(err.message.includes("Invalid credentials"));
    }
  });

  // 2. DATABASE TESTS
  console.log("\n▶ 2. DATABASE INTEGRATION TESTS");

  await runTest("DATABASE", "MongoDB connection and ping status", async () => {
    const commandRes = await db.command({ ping: 1 });
    assert.strictEqual(commandRes.ok, 1);
  });

  await runTest("DATABASE", "Exercise retrieval by laboratory code", async () => {
    const dsaLab = await db.collection("laboratories").findOne({ code: "24DCS512 P" });
    assert(dsaLab, "DSA lab document must exist in MongoDB");
    const exercises = await db.collection("exercises").find({ laboratoryId: dsaLab._id }).toArray();
    assert(exercises.length > 0, "DSA exercises should be retrieved from MongoDB");
  });

  await runTest("DATABASE", "Faculty laboratory assignment retrieval", async () => {
    const assignments = await getFacultyAssignments("faculty_dsa");
    assert(assignments.length >= 3, "Faculty should have access to Semester V laboratories");
  });

  await runTest("DATABASE", "Student submission creation in MongoDB", async () => {
    const ex = await db.collection("exercises").findOne({ type: "mandatory" });
    const user = await db.collection("users").findOne({ role: "student" });
    assert(ex && user, "Sample exercise and user must exist");

    const subDoc = {
      studentId: user._id,
      exerciseId: ex._id,
      code: "// Automated test submission\ncout << 'Testing' << endl;",
      language: "cpp",
      output: "Executed successfully in test suite.",
      status: "passed" as const,
      submittedAt: new Date(),
    };

    const res = await db.collection("submissions").insertOne(subDoc);
    assert(res.insertedId, "Submission ID must be returned on creation");
  });

  // 3. EXERCISES COUNT TESTS
  console.log("\n▶ 3. SYLLABUS EXERCISES VALIDATION TESTS");

  await runTest("EXERCISES", "Data Structures & Algorithms (24DCS512 P) exercises count = 14", async () => {
    const lab = await db.collection("laboratories").findOne({ code: "24DCS512 P" });
    assert(lab, "DSA Lab document must exist");
    const count = await db.collection("exercises").countDocuments({ laboratoryId: lab._id, type: "mandatory" });
    assert.strictEqual(count, 14, `Expected 14 DSA mandatory exercises, found ${count}`);
  });

  await runTest("EXERCISES", "Natural Language Processing Lab (24DCS511 P) exercises count = 15", async () => {
    const lab = await db.collection("laboratories").findOne({ code: "24DCS511 P" });
    assert(lab, "NLP Lab document must exist");
    const count = await db.collection("exercises").countDocuments({ laboratoryId: lab._id, type: "mandatory" });
    assert.strictEqual(count, 15, `Expected 15 NLP mandatory exercises, found ${count}`);
  });

  await runTest("EXERCISES", "NoSQL Database Management Practical (24DCS513 P) exercises count = 11", async () => {
    const lab = await db.collection("laboratories").findOne({ code: "24DCS513 P" });
    assert(lab, "NoSQL Lab document must exist");
    const count = await db.collection("exercises").countDocuments({ laboratoryId: lab._id, type: "mandatory" });
    assert.strictEqual(count, 11, `Expected 11 NoSQL mandatory exercises, found ${count}`);
  });

  // 4. WORKSPACES INTEGRATION TESTS
  console.log("\n▶ 4. WORKSPACE CODE EXECUTION ENGINE TESTS");

  await runTest("WORKSPACES", "C++ compiler compilation and execution (cppRunner.ts)", async () => {
    const result = await runCppCode({
      code: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Test C++ Output" << endl;\n    return 0;\n}`,
      timeoutMs: 5000,
    });
    assert(result.compilerFound, "C++ compiler must be installed and found in PATH");
    assert.strictEqual(result.exitCode, 0);
    assert(result.stdout.includes("Test C++ Output"));
  });

  await runTest("WORKSPACES", "Jupyter / Python execution connectivity (jupyterRunner.ts)", async () => {
    const result = await runPythonCode({
      code: `print("Test Python Execution")`,
      timeoutMs: 5000,
    });
    assert(result.pythonFound, "Python 3 executable must be installed and found in PATH");
    assert.strictEqual(result.exitCode, 0);
    assert(result.stdout.includes("Test Python Execution"));
  });

  await runTest("WORKSPACES", "MongoDB terminal query connectivity (mongoRunner.ts)", async () => {
    const result = await runMongoQuery({
      code: `use labforge_lab_student\ndb.TestCollection.find()`,
    });
    assert.strictEqual(result.exitCode, 0);
    assert(result.stdout.includes("Switched to db") || result.stdout.includes("labforge_lab_student"));
  });

  // 5. SECURITY BOUNDARY TESTS
  console.log("\n▶ 5. SECURITY & AUTHORIZATION BOUNDARY TESTS");

  await runTest("SECURITY", "Student cannot publish mandatory exercises (unauthorized faculty session)", async () => {
    try {
      await publishMandatoryExercise({
        facultyUsername: "242204", // Invalid faculty username (Student roll number)
        labCode: "24DCS512 P",
        title: "Malicious Student Exercise",
        question: "Test",
        description: "Test",
        topic: "Security",
        difficulty: "Easy",
        objective: "Test",
        constraints: "Test",
        examples: [],
        testCases: [],
      });
      assert.fail("Should have rejected non-faculty publish attempt");
    } catch (err: any) {
      assert(err.message.includes("Unauthorized faculty session"));
    }
  });

  await runTest("SECURITY", "Faculty cannot publish to non-existent lab code", async () => {
    try {
      await publishMandatoryExercise({
        facultyUsername: "faculty_dsa",
        labCode: "INVALID_LAB_999",
        title: "Invalid Lab Exercise",
        question: "Test",
        description: "Test",
        topic: "Security",
        difficulty: "Easy",
        objective: "Test",
        constraints: "Test",
        examples: [],
        testCases: [],
      });
      assert.fail("Should have thrown laboratory not found error");
    } catch (err: any) {
      assert(err.message.includes("not found"));
    }
  });

  await runTest("SECURITY", "Student cannot access internal MongoDB administrative collections", async () => {
    const result = await runMongoQuery({
      code: `db.getSiblingDB("admin").system.users.find()`,
      studentId: "242204",
    });
    assert(
      result.stdout.includes("Access Denied") || result.stderr.includes("Access Denied") || result.exitCode !== 0,
      "Internal administrative collection access must be restricted"
    );
  });

  // 6. AI ENGINE & CHATBOT TESTS
  console.log("\n▶ 6. AI SYNTHESIS ENGINE & CHATBOT TESTS");

  await runTest("AI", "AI Extra Exercise Generation (synthesizes extra practice exercises)", async () => {
    const parentEx = await db.collection("exercises").findOne({ type: "mandatory" });
    const facultyUser = await db.collection("users").findOne({ role: "faculty" });
    assert(parentEx && facultyUser, "Mandatory exercise and faculty user must exist");

    const extras = await triggerAiExtraExerciseGeneration({
      mandatoryExerciseId: parentEx._id.toString(),
      labId: parentEx.laboratoryId.toString(),
      facultyId: facultyUser._id.toString(),
      topic: parentEx.topic || "Data Structures",
      objective: parentEx.objective || "Master algorithms",
      difficulty: "Medium",
      title: parentEx.title,
    });

    assert(Array.isArray(extras) && extras.length > 0, "AI extra exercise generator must return structured exercises");
  });

  await runTest("AI", "Duplicate exercise publication prevention", async () => {
    const existing = await db.collection("exercises").findOne({ type: "mandatory" });
    const lab = await db.collection("laboratories").findOne({ _id: existing?.laboratoryId });
    assert(existing && lab, "Existing exercise must be present");

    const res = await publishMandatoryExercise({
      facultyUsername: "faculty_dsa",
      labCode: lab.code,
      title: existing.title,
      question: existing.question || "Question",
      description: existing.description || "Description",
      topic: existing.topic || "Topic",
      difficulty: "Easy",
      objective: "Objective",
      constraints: "Constraints",
      examples: [],
      testCases: [],
    });

    assert.strictEqual(res.isDuplicate, true, "Duplicate publishing attempt must return isDuplicate: true");
  });

  await runTest("AI", "AI Chatbot query fallback / Gemini integration handling", async () => {
    const res = await processGeminiChat({
      message: "Explain recursion in C++",
      exerciseTitle: "Demonstrate Recursion",
    });

    assert(res.text && res.text.length > 0, "AI Chatbot response must return non-empty text");
    assert(res.provider, "Response must include provider source identification");
  });

  // 7. UI TOKENS & STATES TESTS
  console.log("\n▶ 7. UI DESIGN SYSTEM & STATE VERIFICATION TESTS");

  await runTest("UI", "Light theme and Dark theme CSS variables defined in styles.css", async () => {
    const cssPath = path.join(process.cwd(), "src", "styles.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    assert(cssContent.includes("--background"), "CSS must define --background token");
    assert(cssContent.includes("--foreground"), "CSS must define --foreground token");
    assert(cssContent.includes("--primary"), "CSS must define --primary token");
    assert(cssContent.includes(".dark") || cssContent.includes("color-scheme: dark"), "Dark theme tokens must be configured");
  });

  await runTest("UI", "Loading state definitions in Workspace components", async () => {
    const workspacePath = path.join(process.cwd(), "src", "lib", "labforge.tsx");
    const content = fs.readFileSync(workspacePath, "utf-8");
    assert(content.includes("Fetching laboratories from MongoDB"), "Workspace must contain loading indicator state UI");
  });

  await runTest("UI", "Empty state handling for laboratory exercises", async () => {
    const studioPath = path.join(process.cwd(), "src", "components", "faculty", "FacultyExerciseStudio.tsx");
    const content = fs.readFileSync(studioPath, "utf-8");
    assert(content.includes("No exercises found for this lab yet"), "Faculty studio must contain empty state UI handler");
  });

  await runTest("UI", "Error state handling banner for authentication / connection errors", async () => {
    const loginPath = path.join(process.cwd(), "src", "lib", "labforge.tsx");
    const content = fs.readFileSync(loginPath, "utf-8");
    assert(content.includes("Authentication failed"), "Login UI must contain error state alert box");
  });

  // SUMMARY REPORT
  console.log("\n===========================================================");
  console.log(` 📊 TEST SUITE SUMMARY RESULT: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("===========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Fatal Test Suite Execution Error:", err);
  process.exit(1);
});
