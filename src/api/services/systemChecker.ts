import { checkDatabaseHealth } from "../db/mongodb";
import { checkCppCompiler } from "./cppRunner";
import { checkPythonEnvironment } from "./jupyterRunner";

export interface SystemReadinessReport {
  overallReady: boolean;
  timestamp: string;
  mongodb: {
    status: "healthy" | "unhealthy";
    latencyMs: number;
    databaseName: string;
    details?: string;
  };
  cpp: {
    available: boolean;
    name?: string;
    version?: string;
  };
  python: {
    available: boolean;
    version?: string;
    packages: {
      nltk: boolean;
      spacy: boolean;
      sklearn: boolean;
      numpy: boolean;
      pandas: boolean;
    };
  };
}

export async function checkSystemReadiness(): Promise<SystemReadinessReport> {
  const [dbHealth, cppHealth, pyHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkCppCompiler(),
    checkPythonEnvironment(),
  ]);

  const overallReady = dbHealth.status === "healthy";

  return {
    overallReady,
    timestamp: new Date().toISOString(),
    mongodb: {
      status: dbHealth.status,
      latencyMs: dbHealth.latencyMs,
      databaseName: dbHealth.databaseName,
      details: dbHealth.details,
    },
    cpp: cppHealth,
    python: {
      available: pyHealth.available,
      version: pyHealth.version,
      packages: pyHealth.packages,
    },
  };
}
