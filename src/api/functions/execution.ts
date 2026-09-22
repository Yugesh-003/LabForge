import { createServerFn } from "@tanstack/react-start";
import { runCppCode } from "../services/cppRunner";
import { runPythonCode } from "../services/jupyterRunner";
import { runMongoQuery } from "../services/mongoRunner";
import { checkSystemReadiness } from "../services/systemChecker";

export const executeLabCodeServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      technology: "MongoDB" | "Python + Jupyter" | "C++";
      code: string;
      studentId?: string;
      testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
    }) => data
  )
  .handler(async ({ data }) => {
    if (data.technology === "C++") {
      return await runCppCode({
        code: data.code,
        testCases: data.testCases,
      });
    } else if (data.technology === "Python + Jupyter") {
      return await runPythonCode({
        code: data.code,
        testCases: data.testCases,
      });
    } else {
      return await runMongoQuery({
        code: data.code,
        studentId: data.studentId,
        testCases: data.testCases,
      });
    }
  });

export const getSystemReadinessServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return await checkSystemReadiness();
});
