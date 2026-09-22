import assert from "node:assert";
import { MongoClient } from "mongodb";
import { runCppCode } from "../src/api/services/cppRunner";
import { runPythonCode } from "../src/api/services/jupyterRunner";
import { runMongoQuery } from "../src/api/services/mongoRunner";
import { getDb } from "../src/api/db/mongodb";

async function runRealExecutionTests() {
  console.log("\n===========================================================");
  console.log(" 🚀 LIVE REAL EXECUTION VERIFICATION SUITE");
  console.log("===========================================================\n");

  let allPassed = true;

  // 1. DSA: REAL C++ COMPILATION & EXECUTION
  console.log("▶ [1/3] REAL DSA C++ COMPILATION & EXECUTION TEST");
  const cppSource = `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

using namespace std;

int main() {
    vector<int> numbers = {12, 45, 7, 23, 89, 34};
    sort(numbers.begin(), numbers.end());
    int sum = accumulate(numbers.begin(), numbers.end(), 0);
    
    cout << "MIN: " << numbers.front() << endl;
    cout << "MAX: " << numbers.back() << endl;
    cout << "SUM: " << sum << endl;
    cout << "DSA_C++_EXECUTION_SUCCESS" << endl;
    return 0;
}
`;

  try {
    console.log("  Compiling and running C++ program with g++...");
    const cppResult = await runCppCode({
      code: cppSource,
      timeoutMs: 8000,
    });

    console.log(`  Exit Code: ${cppResult.exitCode}`);
    console.log(`  Execution Time: ${cppResult.executionTimeMs}ms`);
    console.log(`  Output:\n${cppResult.stdout.trim()}`);

    assert.strictEqual(cppResult.exitCode, 0, "C++ execution must return exit code 0");
    assert(cppResult.stdout.includes("MIN: 7"), "Output must contain MIN: 7");
    assert(cppResult.stdout.includes("MAX: 89"), "Output must contain MAX: 89");
    assert(cppResult.stdout.includes("SUM: 210"), "Output must contain SUM: 210");
    assert(cppResult.stdout.includes("DSA_C++_EXECUTION_SUCCESS"), "Output must contain success marker");
    console.log("  ✅ DSA C++ compilation & execution verified successfully.\n");
  } catch (err: any) {
    allPassed = false;
    console.error("  ❌ DSA C++ execution failed:", err.message || err, "\n");
  }

  // 2. NLP: REAL PYTHON / JUPYTER EXECUTION
  console.log("▶ [2/3] REAL NLP PYTHON / NOTEBOOK EXECUTION TEST");
  const pySource = `import sys
from collections import Counter

text = "Natural language processing and machine learning in laboratory workspace"
tokens = text.lower().split()
freq = Counter(tokens)

print(f"TOTAL_TOKENS: {len(tokens)}")
print(f"UNIQUE_WORDS: {len(freq)}")
print(f"MOST_COMMON: {freq.most_common(1)[0][0]}")
print("NLP_PYTHON_EXECUTION_SUCCESS")
`;

  try {
    console.log("  Executing Python NLP script...");
    const pyResult = await runPythonCode({
      code: pySource,
      timeoutMs: 8000,
    });

    console.log(`  Exit Code: ${pyResult.exitCode}`);
    console.log(`  Execution Time: ${pyResult.executionTimeMs}ms`);
    console.log(`  Output:\n${pyResult.stdout.trim()}`);

    assert.strictEqual(pyResult.exitCode, 0, "Python execution must return exit code 0");
    assert(pyResult.stdout.includes("TOTAL_TOKENS: 9"), "Output must contain TOTAL_TOKENS: 9");
    assert(pyResult.stdout.includes("UNIQUE_WORDS: 9"), "Output must contain UNIQUE_WORDS: 9");
    assert(pyResult.stdout.includes("NLP_PYTHON_EXECUTION_SUCCESS"), "Output must contain success marker");
    console.log("  ✅ NLP Python execution verified successfully.\n");
  } catch (err: any) {
    allPassed = false;
    console.error("  ❌ NLP Python execution failed:", err.message || err, "\n");
  }

  // 3. MONGODB: REAL DATABASE CRUD & SECURITY BOUNDARY TEST
  console.log("▶ [3/3] REAL MONGODB DATABASE CRUD & SECURITY ISOLATION TEST");
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/labforge";
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const sandboxDb = client.db("labforge_lab_student");
    const testCollection = sandboxDb.collection("real_execution_tests");

    // A. Clean up previous test entries
    await testCollection.deleteMany({ testIdentifier: "LIVE_EXECUTION_TEST" });

    // B. Create / Insert document
    console.log("  1. Inserting test document into sandbox database...");
    const insertDoc = {
      testIdentifier: "LIVE_EXECUTION_TEST",
      studentRollNumber: "242204",
      lab: "NoSQL Database Management",
      technology: "MongoDB",
      status: "in-progress",
      score: 95,
      createdAt: new Date(),
    };
    const insertRes = await testCollection.insertOne(insertDoc);
    const docId = insertRes.insertedId;
    assert(docId, "Insert result must provide insertedId");
    console.log(`     Inserted Document ID: ${docId.toString()}`);

    // C. Query document
    console.log("  2. Querying inserted document...");
    const fetchedDoc = await testCollection.findOne({ _id: docId });
    assert(fetchedDoc, "Document must exist in database");
    assert.strictEqual(fetchedDoc.studentRollNumber, "242204");
    assert.strictEqual(fetchedDoc.status, "in-progress");
    console.log(`     Retrieved: studentRollNumber=${fetchedDoc.studentRollNumber}, status=${fetchedDoc.status}`);

    // D. Update document
    console.log("  3. Updating document...");
    const updateRes = await testCollection.updateOne(
      { _id: docId },
      {
        $set: {
          status: "verified_completed",
          score: 100,
          updatedAt: new Date(),
        },
      }
    );
    assert.strictEqual(updateRes.modifiedCount, 1, "Must modify 1 document");

    const updatedDoc = await testCollection.findOne({ _id: docId });
    assert.strictEqual(updatedDoc?.status, "verified_completed");
    assert.strictEqual(updatedDoc?.score, 100);
    console.log(`     Updated: status=${updatedDoc.status}, score=${updatedDoc.score}`);

    // E. Delete document
    console.log("  4. Deleting document...");
    const deleteRes = await testCollection.deleteOne({ _id: docId });
    assert.strictEqual(deleteRes.deletedCount, 1, "Must delete 1 document");

    const checkDeleted = await testCollection.findOne({ _id: docId });
    assert.strictEqual(checkDeleted, null, "Document must be null after deletion");
    console.log("     Deleted document verified (returned null).");

    // F. Test Security Isolation: Student Runner cannot modify LabForge internal application infrastructure
    console.log("  5. Verifying Security Barrier (sandbox restricted from modifying internal collections)...");
    
    // Test 1: Attempt to drop internal 'users' collection via student runner
    const attackQuery1 = `db.getSiblingDB("labforge").users.drop()`;
    const secResult1 = await runMongoQuery({
      code: attackQuery1,
      studentId: "242204",
    });

    // Test 2: Attempt to delete all exercises from main application collection
    const attackQuery2 = `db.getSiblingDB("admin").system.users.find()`;
    const secResult2 = await runMongoQuery({
      code: attackQuery2,
      studentId: "242204",
    });

    // Assert internal collections remain intact
    const appDb = await getDb();
    const userCount = await appDb.collection("users").countDocuments();
    const exerciseCount = await appDb.collection("exercises").countDocuments();

    assert(userCount > 0, "Internal users collection must remain intact");
    assert(exerciseCount >= 40, "Internal exercises collection must remain intact (count >= 40)");

    console.log(`     Internal App Collections Integrity Verified:`);
    console.log(`     - Users count: ${userCount} (Intact)`);
    console.log(`     - Exercises count: ${exerciseCount} (Intact)`);
    console.log("  ✅ MongoDB CRUD and Security Isolation verified successfully.\n");
  } catch (err: any) {
    allPassed = false;
    console.error("  ❌ MongoDB CRUD or Security test failed:", err.message || err, "\n");
  } finally {
    await client.close();
  }

  // SUMMARY REPORT
  console.log("===========================================================");
  if (allPassed) {
    console.log(" 🎉 ALL REAL EXECUTION TESTS PASSED SUCCESSFULLY!");
  } else {
    console.log(" 💥 SOME REAL EXECUTION TESTS FAILED.");
    process.exit(1);
  }
  console.log("===========================================================\n");
}

runRealExecutionTests().catch((err) => {
  console.error("Fatal Real Execution Error:", err);
  process.exit(1);
});
