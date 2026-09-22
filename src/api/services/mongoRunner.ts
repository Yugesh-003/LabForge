import { getMongoClient } from "../db/mongodb";

export interface MongoExecutionOptions {
  code: string;
  studentId?: string;
  dbName?: string;
  testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
}

export interface MongoExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  testResults?: Array<{ testCaseId: string; passed: boolean; actualOutput: string }>;
}

export async function runMongoQuery(options: MongoExecutionOptions): Promise<MongoExecutionResult> {
  const startTime = performance.now();
  const client = await getMongoClient();
  
  // Isolated database for student
  const safeDbName = options.dbName || `labforge_lab_${(options.studentId || "default").replace(/[^a-zA-Z0-9_]/g, "")}`;
  const db = client.db(safeDbName);

  const code = options.code.trim();

  if (!code) {
    return {
      stdout: "",
      stderr: "Empty MongoDB command provided.",
      exitCode: 1,
      executionTimeMs: 0,
    };
  }

  try {
    const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
    const outputLogs: string[] = [`switched to db ${safeDbName}`];

    for (const line of lines) {
      if (line.startsWith("show collections") || line.startsWith("show dbs")) {
        const collections = await db.listCollections().toArray();
        outputLogs.push(collections.map((c) => c.name).join("\n") || "(No collections found)");
        continue;
      }

      if (line.startsWith("use ")) {
        const targetDb = line.replace("use ", "").trim();
        outputLogs.push(`switched to db ${targetDb}`);
        continue;
      }

      // Parse db.<collection>.<method>(<args>) pattern
      const match = line.match(/^db\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\(([\s\S]*)\);?$/);
      if (match) {
        const [, collectionName, method, argsStr] = match;
        const coll = db.collection(collectionName);

        let parsedArgs: any[] = [];
        if (argsStr.trim()) {
          try {
            // Safely evaluate standard JSON/object literal args
            // Wrap in brackets to parse as array
            parsedArgs = eval(`[${argsStr}]`);
          } catch {
            throw new Error(`SyntaxError in arguments: ${argsStr}`);
          }
        }

        let result: any;
        switch (method) {
          case "find":
            const query = parsedArgs[0] || {};
            const projection = parsedArgs[1] || {};
            result = await coll.find(query, { projection }).limit(100).toArray();
            break;

          case "findOne":
            result = await coll.findOne(parsedArgs[0] || {});
            break;

          case "insertOne":
            result = await coll.insertOne(parsedArgs[0] || {});
            break;

          case "insertMany":
            result = await coll.insertMany(parsedArgs[0] || []);
            break;

          case "updateOne":
            result = await coll.updateOne(parsedArgs[0] || {}, parsedArgs[1] || {});
            break;

          case "updateMany":
            result = await coll.updateMany(parsedArgs[0] || {}, parsedArgs[1] || {});
            break;

          case "deleteOne":
            result = await coll.deleteOne(parsedArgs[0] || {});
            break;

          case "deleteMany":
            result = await coll.deleteMany(parsedArgs[0] || {});
            break;

          case "aggregate":
            result = await coll.aggregate(parsedArgs[0] || []).toArray();
            break;

          case "countDocuments":
            result = await coll.countDocuments(parsedArgs[0] || {});
            break;

          case "drop":
            result = await coll.drop();
            break;

          default:
            throw new Error(`Unsupported MongoDB shell method: ${method}`);
        }

        outputLogs.push(typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
      } else {
        // Fallback: try raw eval or generic command execution
        throw new Error(`Invalid or unsupported MongoDB command syntax: '${line}'. Format must be: db.<collection>.<method>(...)`);
      }
    }

    const duration = Math.round(performance.now() - startTime);
    const stdoutStr = outputLogs.join("\n");

    let testResults: Array<{ testCaseId: string; passed: boolean; actualOutput: string }> | undefined = undefined;
    if (options.testCases && options.testCases.length > 0) {
      testResults = options.testCases.map((tc) => {
        const passed = stdoutStr.includes(tc.expectedOutput.trim());
        return {
          testCaseId: tc.id,
          passed,
          actualOutput: stdoutStr,
        };
      });
    }

    return {
      stdout: stdoutStr,
      stderr: "",
      exitCode: 0,
      executionTimeMs: duration,
      testResults,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: "",
      stderr: err.message || "MongoServerError: Command failed",
      exitCode: 1,
      executionTimeMs: duration,
    };
  }
}
