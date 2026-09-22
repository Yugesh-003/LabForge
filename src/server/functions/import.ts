import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ParseImportSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileBase64: z.string(),
});

export const parseExerciseImportFileServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ParseImportSchema.parse(data))
  .handler(async ({ data }) => {
    const { fileName, fileType, fileBase64 } = data;
    const buffer = Buffer.from(fileBase64, "base64");

    const draftExercises: Array<{
      exerciseNumber: number;
      title: string;
      question: string;
      description: string;
      topic: string;
      difficulty: "Easy" | "Medium" | "Hard";
      objective: string;
      constraints: string;
    }> = [];

    let extractedText = "";

    try {
      if (fileType.includes("json") || fileName.endsWith(".json")) {
        const jsonContent = JSON.parse(buffer.toString("utf-8"));
        const items = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
        items.forEach((item, idx) => {
          draftExercises.push({
            exerciseNumber: idx + 1,
            title: item.title || item.name || `Imported Exercise ${idx + 1}`,
            question: item.question || item.description || item.title || "",
            description: item.description || "",
            topic: item.topic || "General",
            difficulty: (item.difficulty as any) || "Medium",
            objective: item.objective || "Practice syllabus concepts.",
            constraints: item.constraints || "",
          });
        });
        return { success: true, count: draftExercises.length, exercises: draftExercises };
      }

      if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } else if (fileType.includes("docx") || fileName.endsWith(".docx")) {
        const mammoth = require("mammoth");
        const docxData = await mammoth.extractRawText({ buffer });
        extractedText = docxData.value;
      } else {
        // Plain text, CSV, or markdown
        extractedText = buffer.toString("utf-8");
      }

      // Parse lines by numbers (e.g. 1. 2. 3.)
      const lines = extractedText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      let count = 1;
      for (const line of lines) {
        // Match numbered lines like "1. Create a C++ program..."
        if (/^\d+[\.\)]\s+/.test(line) || line.length > 15) {
          const cleanTitle = line.replace(/^\d+[\.\)]\s+/, "");
          if (cleanTitle.length > 5 && !cleanTitle.toLowerCase().includes("course")) {
            draftExercises.push({
              exerciseNumber: count++,
              title: cleanTitle,
              question: cleanTitle,
              description: `Extracted from uploaded document '${fileName}'.`,
              topic: "Syllabus Practical",
              difficulty: count <= 5 ? "Easy" : count <= 10 ? "Medium" : "Hard",
              objective: "Demonstrate practical understanding of syllabus concepts.",
              constraints: "Standard execution environment.",
            });
          }
        }
      }
    } catch (err: any) {
      console.error("File import parsing error:", err);
      throw new Error(`Failed to parse file '${fileName}': ${err.message}`);
    }

    if (draftExercises.length === 0) {
      draftExercises.push({
        exerciseNumber: 1,
        title: `Imported Exercise from ${fileName}`,
        question: extractedText.slice(0, 200) || "Uploaded syllabus exercise content.",
        description: "Please review and edit details before publishing.",
        topic: "General",
        difficulty: "Medium",
        objective: "Practical application.",
        constraints: "",
      });
    }

    return {
      success: true,
      count: draftExercises.length,
      exercises: draftExercises,
    };
  });
