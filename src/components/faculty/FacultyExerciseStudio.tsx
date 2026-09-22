import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Upload,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  Edit3,
  Trash2,
  Plus,
  BookOpen,
  Code2,
} from "lucide-react";
import { exerciseService } from "@/services/exerciseService";
import { parseExerciseImportFileServerFn } from "@/api/functions/import";
import {
  getFacultyAssignmentsServerFn,
  getFacultyExercisesByLabServerFn,
  updateExerciseServerFn,
  deleteExerciseServerFn,
} from "@/api/functions/faculty";

export function FacultyExerciseStudio({ currentFacultyUsername }: { currentFacultyUsername?: string }) {
  const navigate = useNavigate();
  const storedName = typeof window !== "undefined" ? localStorage.getItem("labforge_user_name") : null;
  const username = currentFacultyUsername || storedName || "faculty_dsa";

  const defaultCode = username === "faculty_nlp" ? "24DCS511 P" : username === "faculty_nosql" ? "24DCS513 P" : "24DCS512 P";

  const [assignedLabs, setAssignedLabs] = useState<any[]>([]);
  const [selectedLabCode, setSelectedLabCode] = useState<string>(defaultCode);
  const [loadingLabs, setLoadingLabs] = useState<boolean>(true);

  // Existing Exercises in MongoDB
  const [existingExercises, setExistingExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("Demonstrate Core Laboratory Concept");
  const [topic, setTopic] = useState("Practical Implementation");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [question, setQuestion] = useState("Implement a solution adhering to official syllabus guidelines.");
  const [description, setDescription] = useState(
    "Demonstrate core data structures, algorithms, queries, or NLP models as specified in the curriculum."
  );
  const [learningObjective, setLearningObjective] = useState("Apply practical laboratory concepts to solve real-world problems.");
  const [constraints, setConstraints] = useState("Standard memory limit 64MB, execution timeout 2.0s.");

  const [publishing, setPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<any>(null);

  // File Import State
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importError, setImportError] = useState<string>("");

  useEffect(() => {
    async function loadAssignedLabs() {
      try {
        setLoadingLabs(true);
        const labs = await getFacultyAssignmentsServerFn({ data: { facultyUsername: username } });
        setAssignedLabs(labs);
        if (labs.length > 0) {
          const match = labs.find((l: any) => l.code === defaultCode);
          setSelectedLabCode(match ? match.code : labs[0].code);
        }
      } catch (err) {
        console.error("Failed to load assigned labs for faculty:", err);
      } finally {
        setLoadingLabs(false);
      }
    }
    loadAssignedLabs();
  }, [username, defaultCode]);


  // Load existing exercises when lab code changes
  useEffect(() => {
    if (!selectedLabCode) return;
    async function loadExercises() {
      try {
        setLoadingExercises(true);
        const docs = await getFacultyExercisesByLabServerFn({ data: { labCode: selectedLabCode } });
        setExistingExercises(docs);
      } catch (err) {
        console.error("Failed to load existing lab exercises:", err);
      } finally {
        setLoadingExercises(false);
      }
    }
    loadExercises();
  }, [selectedLabCode]);

  const resetForm = () => {
    setEditingExerciseId(null);
    setTitle("");
    setTopic("");
    setDifficulty("Easy");
    setQuestion("");
    setDescription("");
    setLearningObjective("");
    setConstraints("");
    setPublishedResult(null);
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExerciseId(exercise.id);
    setTitle(exercise.title);
    setTopic(exercise.topic || "General");
    setDifficulty(exercise.difficulty || "Medium");
    setQuestion(exercise.question || exercise.title);
    setDescription(exercise.description || "");
    setLearningObjective(exercise.learningObjective || "");
    setConstraints(exercise.constraints || "");
    setPublishedResult(null);
  };

  const handleDeleteExercise = async (exerciseId: string, exerciseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete '${exerciseTitle}' from MongoDB?`)) return;

    try {
      await deleteExerciseServerFn({ data: { exerciseId } });
      setExistingExercises((prev) => prev.filter((e) => e.id !== exerciseId));
      if (editingExerciseId === exerciseId) resetForm();
      alert(`Exercise '${exerciseTitle}' deleted successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete exercise.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError("");
    setImportPreview(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await parseExerciseImportFileServerFn({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileBase64: base64,
          },
        });
        setImportPreview(res.exercises);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setImportError(err.message || "Failed to parse exercise file.");
    } finally {
      setImporting(false);
    }
  };

  const handleSelectPreviewItem = (item: any) => {
    setTitle(item.title);
    setQuestion(item.question);
    setDescription(item.description);
    setTopic(item.topic || "Syllabus Practical");
    setDifficulty(item.difficulty || "Medium");
    setLearningObjective(item.objective || "Practical application.");
    setConstraints(item.constraints || "Standard execution limits.");
    setImportPreview(null);
  };

  const handleSaveOrPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabCode) return;

    setPublishing(true);
    setPublishedResult(null);

    try {
      if (editingExerciseId) {
        // Update existing exercise
        await updateExerciseServerFn({
          data: {
            exerciseId: editingExerciseId,
            title,
            question,
            description,
            topic,
            difficulty,
            objective: learningObjective,
            constraints,
            testCases: [{ id: "tc-1", input: "sample_input", expectedOutput: "expected_output" }],
          },
        });

        // Refresh existing list
        const updatedDocs = await getFacultyExercisesByLabServerFn({ data: { labCode: selectedLabCode } });
        setExistingExercises(updatedDocs);
        setPublishedResult({ message: `Exercise '${title}' updated successfully in MongoDB!` });
      } else {
        // Publish new mandatory exercise
        const result = await exerciseService.publishMandatoryExercise({
          facultyUsername: username,
          labCode: selectedLabCode,
          title,
          question,
          description,
          topic,
          difficulty,
          objective: learningObjective,
          constraints,
          examples: [],
          testCases: [{ id: "tc-1", input: "sample_input", expectedOutput: "expected_output" }],
        });

        const updatedDocs = await getFacultyExercisesByLabServerFn({ data: { labCode: selectedLabCode } });
        setExistingExercises(updatedDocs);
        setPublishedResult(result);
      }
    } catch (err: any) {
      console.error("Failed to save exercise:", err);
      alert(err.message || "Failed to save exercise to MongoDB.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      {/* Subheader Navigation */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate({ to: "/faculty/dashboard" })}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} /> Back to Overview
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chart-2">
            Faculty Studio · Laboratory Content Manager ({username})
          </p>
          <h1 className="labforge-display mt-3 text-4xl font-bold text-foreground">
            Syllabus Exercise Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {editingExerciseId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-accent"
            >
              <Plus size={15} /> Create New Exercise
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveOrPublish}
            disabled={publishing || !selectedLabCode}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-105 disabled:opacity-50 shadow-sm"
          >
            {publishing ? (
              <>Saving to MongoDB...</>
            ) : editingExerciseId ? (
              <>
                <Save size={16} /> Update Exercise in MongoDB
              </>
            ) : (
              <>
                <Check size={16} /> Publish Mandatory Exercise
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lab Assignment Selector & File Import */}
      <div className="mt-6 rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Select Laboratory:</span>
          {loadingLabs ? (
            <span className="text-xs text-muted-foreground animate-pulse">Loading laboratories...</span>
          ) : (
            <select
              value={selectedLabCode}
              onChange={(e) => {
                setSelectedLabCode(e.target.value);
                resetForm();
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-chart-2"
            >
              {assignedLabs.map((lab) => (
                <option key={lab.code} value={lab.code}>
                  {lab.name} ({lab.code}) — {lab.technology}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Multi-Format File Import */}
        <div className="flex items-center gap-2">
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer">
            <Upload size={14} className="text-primary" /> Import File (PDF, DOCX, XLSX, JSON)
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.csv,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {importing && <RefreshCw size={14} className="animate-spin text-primary" />}
        </div>
      </div>

      {/* Existing Exercises Table Panel */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen size={16} className="text-primary" /> Existing Practical Exercises in MongoDB ({existingExercises.length})
          </h3>
          <span className="text-xs text-muted-foreground">Lab: <strong className="text-foreground">{selectedLabCode}</strong></span>
        </div>

        {loadingExercises ? (
          <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">Fetching exercises from MongoDB...</div>
        ) : existingExercises.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">No exercises found for this lab yet. Create one below!</div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 labforge-scrollbar pr-1">
            {existingExercises.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-colors ${
                  editingExerciseId === ex.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{ex.exerciseNumber || "•"}. {ex.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${ex.type === "mandatory" ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4"}`}>
                      {ex.type}
                    </span>
                    <span className="text-muted-foreground">({ex.difficulty})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ex.question}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditExercise(ex)}
                    className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(ex.id, ex.title)}
                    className="flex items-center gap-1 rounded bg-destructive/15 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/25"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Result Banner */}
      {publishedResult && (
        <div className={`mt-6 rounded-xl border p-5 ${publishedResult.isDuplicate ? "border-chart-3/30 bg-chart-3/10" : "border-primary/30 bg-primary/10"}`}>
          <div className="flex items-start gap-4">
            <div className={`flex size-10 items-center justify-center rounded-lg ${publishedResult.isDuplicate ? "bg-chart-3 text-background" : "bg-primary text-primary-foreground"} shrink-0 font-bold`}>
              <CheckCircle2 size={20} />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">{publishedResult.message}</h2>
              {publishedResult.aiGenerated && publishedResult.aiGenerated.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {publishedResult.aiGenerated.map((ex: any) => (
                    <div key={ex.id} className="rounded-lg border border-border bg-card p-3 text-xs">
                      <div className="flex items-center justify-between text-chart-4 font-semibold mb-1">
                        <span className="flex items-center gap-1"><Sparkles size={12} /> Auto-Generated Extra</span>
                        <span>{ex.difficulty}</span>
                      </div>
                      <div className="font-bold text-foreground truncate">{ex.title}</div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate({ to: "/student/workspace" })}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                View in Student Workspace <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveOrPublish} className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">
              {editingExerciseId ? "Edit Exercise Details" : "Publish New Mandatory Exercise"}
            </h2>
            {editingExerciseId && (
              <span className="text-xs text-primary font-semibold">Editing Mode Active</span>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium md:col-span-2">
              Exercise Title (Syllabus Official Title)
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-chart-2 focus:ring-2 focus:ring-chart-2/20"
              />
            </label>

            <label className="block text-sm font-medium">
              Topic / Section
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-chart-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Difficulty Level
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-chart-2"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              Question Statement
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                required
                className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-6 outline-none focus:border-chart-2"
              />
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              Detailed Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-6 outline-none focus:border-chart-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Learning Objective
              <textarea
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                rows={2}
                className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-6 outline-none focus:border-chart-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Execution Constraints
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows={2}
                className="mt-2 w-full resize-y rounded-md border border-input bg-background p-3 text-sm leading-6 outline-none focus:border-chart-2"
              />
            </label>
          </div>
        </section>

        {/* Sidebar Info Card */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-chart-4/40 bg-chart-4/5 p-5">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded bg-chart-4/15 text-chart-4">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Backend AI Generation</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Automated extra practice</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              When you publish this mandatory exercise, LabForge backend AI service will automatically:
            </p>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Analyze question and objective</li>
              <li>Synthesize 2 extra application tasks</li>
              <li>Check for duplicate titles in MongoDB</li>
              <li>Link extras using <code className="labforge-mono text-[11px]">sourceExerciseId</code></li>
            </ul>
          </section>
        </aside>
      </form>
    </main>
  );
}
