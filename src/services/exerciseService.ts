import { Exercise, Lab } from "@/types/labforge";
import { getStudentLabsServerFn, getLabExercisesServerFn } from "@/api/functions/student";
import { publishMandatoryExerciseServerFn } from "@/api/functions/faculty";

class ExerciseService {
  /**
   * Fetch active laboratories for a semester from MongoDB backend.
   */
  public async getLabs(semesterNumber: number = 5): Promise<Lab[]> {
    try {
      const labs = await getStudentLabsServerFn({ data: { semesterNumber } });
      return labs as Lab[];
    } catch (err) {
      console.error("Failed to fetch labs from MongoDB backend:", err);
      return [];
    }
  }

  /**
   * Fetch mandatory and AI-generated extra exercises for a lab from MongoDB backend.
   */
  public async getExercisesByLab(labCodeOrId: string): Promise<{ mandatory: Exercise[]; aiGenerated: Exercise[] }> {
    try {
      const result = await getLabExercisesServerFn({ data: { labCode: labCodeOrId, labId: labCodeOrId } });
      return result as { mandatory: Exercise[]; aiGenerated: Exercise[] };
    } catch (err) {
      console.error(`Failed to fetch exercises for lab '${labCodeOrId}' from MongoDB backend:`, err);
      return { mandatory: [], aiGenerated: [] };
    }
  }

  /**
   * Faculty publishes a mandatory exercise to MongoDB backend.
   * Triggers automatic backend AI generation of extra practice tasks.
   */
  public async publishMandatoryExercise(params: {
    facultyUsername: string;
    labCode: string;
    title: string;
    question: string;
    description: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    objective: string;
    constraints: string;
    examples?: Array<{ input: string; output: string }>;
    testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
  }): Promise<{ isDuplicate: boolean; mandatory: any; aiGenerated: any[]; message: string }> {
    return await publishMandatoryExerciseServerFn({
      data: {
        ...params,
        examples: params.examples || [],
        testCases: params.testCases || [],
      },
    });
  }
}

export const exerciseService = new ExerciseService();
