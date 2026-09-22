import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, Bot, Braces, Check, ChevronRight,
  CircleAlert, CircleCheck, CircleDot, Clock3, Code2, FilePlus2,
  GraduationCap, LayoutDashboard, LogOut, MessageSquare, Plus, Sparkles, UserRound, Users, RefreshCw
} from "lucide-react";

import { loginServerFn, signupServerFn } from "@/api/functions/auth";
import { exerciseService } from "@/services/exerciseService";
import { executionService } from "@/services/executionService";
import { Exercise, Lab, ExecutionResult } from "@/types/labforge";

import { VSCodeHeader } from "@/components/workspace/VSCodeHeader";
import { ExerciseListSidebar } from "@/components/workspace/ExerciseListSidebar";
import { ExerciseDetailsPanel } from "@/components/workspace/ExerciseDetailsPanel";
import { MongoWorkspace } from "@/components/workspace/MongoWorkspace";
import { JupyterWorkspace } from "@/components/workspace/JupyterWorkspace";
import { CppWorkspace } from "@/components/workspace/CppWorkspace";
import { AIChatSidebar } from "@/components/workspace/AIChatSidebar";
import { BottomTerminalPanel } from "@/components/workspace/BottomTerminalPanel";
import { FacultyExerciseStudio } from "@/components/faculty/FacultyExerciseStudio";

type Screen =
  | "landing"
  | "studentLogin"
  | "facultyLogin"
  | "semester"
  | "labs"
  | "workspace"
  | "facultyDashboard"
  | "facultySemester"
  | "facultyLabs"
  | "facultyExercise";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.86_0.19_132_/_0.18)] font-bold">
        <Braces size={19} strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <div className="labforge-display text-base font-bold tracking-wide text-foreground">
            LABFORGE
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Learning Studio
          </div>
        </div>
      )}
    </div>
  );
}

function Button({
  children,
  variant = "default",
  className = "",
  onClick,
  disabled,
  type = "button",
  title,
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "ghost" | "outline" | "danger";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const styles = {
    default: "bg-secondary text-secondary-foreground hover:bg-accent",
    primary: "bg-primary text-primary-foreground hover:brightness-105",
    ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function AppFrame({ children, role, active }: { children: React.ReactNode; role: "student" | "faculty"; active?: string }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = typeof window !== "undefined" ? localStorage.getItem("labforge_user_name") : null;
  const currentRole = typeof window !== "undefined" ? localStorage.getItem("labforge_user_role") : role;

  return (
    <div className="labforge-shell flex min-h-screen flex-col text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-sidebar/90 px-5 backdrop-blur">
        <div className="flex items-center gap-7">
          <Brand />
          <div className="hidden h-6 w-px bg-border md:block" />
          <nav className="hidden items-center gap-1 md:flex">
            {currentRole === "student" ? (
              <>
                <NavButton active={active === "semester"} onClick={() => navigate({ to: "/student/semester" })} icon={<GraduationCap size={15} />}>
                  My Learning Path
                </NavButton>
                <NavButton active={active === "labs"} onClick={() => navigate({ to: "/student/labs" })} icon={<LayoutDashboard size={15} />}>
                  Laboratories
                </NavButton>
              </>
            ) : (
              <>
                <NavButton active={active === "dashboard"} onClick={() => navigate({ to: "/faculty/dashboard" })} icon={<LayoutDashboard size={15} />}>
                  Overview
                </NavButton>
                <NavButton active={active === "exercise"} onClick={() => navigate({ to: "/faculty/exercises/new" })} icon={<FilePlus2 size={15} />}>
                  Exercise Studio
                </NavButton>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2 relative">
          <span className="hidden text-xs text-muted-foreground sm:inline font-semibold">
            {currentUser ? `${currentUser} (${currentRole})` : currentRole === "student" ? "III Year · Semester V" : "Faculty Workspace"}
          </span>
          <Button variant="ghost" className="size-9 px-0" onClick={() => setMenuOpen((value) => !value)}>
            <UserRound size={17} />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-30 w-48 rounded-lg border border-border bg-popover p-1.5 shadow-2xl">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("labforge_user");
                    localStorage.removeItem("labforge_user_role");
                    localStorage.removeItem("labforge_user_name");
                  }
                  navigate({ to: "/" });
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

function NavButton({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}>
      {icon}
      {children}
    </button>
  );
}

function Landing() {
  const navigate = useNavigate();
  return (
    <main className="labforge-grid relative flex min-h-screen items-center overflow-hidden px-6 py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <section>
          <Brand />
          <div className="mt-16 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={13} /> Official Syllabus Practical Engine (Semester V)
            </div>
            <h1 className="labforge-display text-5xl font-bold leading-[1.03] tracking-tight text-foreground sm:text-7xl">
              Make room for<br />
              <span className="text-primary">better thinking.</span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
              A structured laboratory workspace connected to a real MongoDB database for DSA C++, NLP Python, and NoSQL MongoDB practicals.
            </p>
            <div className="mt-9 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Check size={15} className="text-primary" /> Real MongoDB Backend</span>
              <span className="flex items-center gap-2"><Check size={15} className="text-primary" /> 40 Official Syllabus Practicals</span>
            </div>
          </div>
        </section>
        <section className="w-full max-w-md justify-self-end">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Enter Workspace</p>
              <h2 className="labforge-display mt-2 text-2xl font-bold">Choose your role</h2>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate({ to: "/student/login" })} className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent shadow-sm">
              <span className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary"><GraduationCap size={22} /></span>
                <span>
                  <span className="block font-bold">Student Workspace</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Access mandatory & AI extra practice</span>
                </span>
              </span>
              <ArrowRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </button>

            <button onClick={() => navigate({ to: "/faculty/login" })} className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-chart-2/60 hover:bg-accent shadow-sm">
              <span className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2"><Users size={21} /></span>
                <span>
                  <span className="block font-bold">Faculty Workspace</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Manage DSA, NLP, and NoSQL laboratories</span>
                </span>
              </span>
              <ArrowRight size={18} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-chart-2" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Login({ role }: { role: "student" | "faculty" }) {
  const navigate = useNavigate();
  const isStudent = role === "student";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [identity, setIdentity] = useState(isStudent ? "242204" : "faculty_dsa");
  const [name, setName] = useState("");
  const [password, setPassword] = useState(isStudent ? "student123" : "faculty123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let user;
      if (isStudent && mode === "signup") {
        user = await signupServerFn({
          data: {
            rollNumber: identity,
            name,
            password,
          },
        });
      } else {
        user = await loginServerFn({
          data: {
            identity,
            password,
            role,
          },
        });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("labforge_user", user.id);
        localStorage.setItem("labforge_user_role", user.role);
        localStorage.setItem("labforge_user_name", user.name || user.username || user.rollNumber || "");
      }

      navigate({ to: isStudent ? "/student/semester" : "/faculty/dashboard" });
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Verify credentials against MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="labforge-grid flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[450px]">
        <button onClick={() => navigate({ to: "/" })} className="mb-10"><Brand /></button>
        <div className="mb-6">
          <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${isStudent ? "bg-primary/15 text-primary" : "bg-chart-2/15 text-chart-2"}`}>
            {isStudent ? <GraduationCap size={24} /> : <Users size={23} />}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {isStudent ? "Student Access" : "Faculty Access"}
          </p>
          <h1 className="labforge-display mt-1 text-3xl font-bold">
            {isStudent ? (mode === "signup" ? "Create your account" : "Welcome back.") : "Welcome back."}
          </h1>
          {isStudent && (
            <p className="mt-2 text-xs text-muted-foreground">
              {mode === "signup" ? (
                <>Already have an account? <button type="button" onClick={() => { setMode("signin"); setError(""); }} className="text-primary font-bold hover:underline">Sign In</button></>
              ) : (
                <>New student? <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-primary font-bold hover:underline">Sign Up here</button></>
              )}
            </p>
          )}
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          {isStudent && mode === "signup" && (
            <label className="block text-sm font-medium">
              Full Name
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Gayathri Prasad" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
            </label>
          )}

          <label className="block text-sm font-medium">
            {isStudent ? "Student Roll Number" : "Faculty Username"}
            {isStudent ? (
              <input value={identity} onChange={(e) => setIdentity(e.target.value)} required placeholder="e.g. 242204" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
            ) : (
              <select value={identity} onChange={(e) => setIdentity(e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-chart-2 font-mono">
                <option value="faculty_dsa">faculty_dsa (DSA C++ Practical 24DCS512 P)</option>
                <option value="faculty_nlp">faculty_nlp (NLP Python Lab 24DCS511 P)</option>
                <option value="faculty_nosql">faculty_nosql (NoSQL MongoDB Practical 24DCS513 P)</option>
              </select>
            )}
          </label>
          <label className="block text-sm font-medium">
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
          </label>

          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2"><CircleAlert size={14} />{error}</div>}

          <Button type="submit" variant="primary" disabled={loading} className="h-11 w-full font-bold">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <>{mode === "signup" ? "Register & Authenticate" : "Authenticate with MongoDB"} <ArrowRight size={16} /></>}
          </Button>
        </form>
      </div>
    </main>
  );
}

function Semester() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(5);

  return (
    <AppFrame role="student" active="semester">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Academic Year: III Year (Batch 2024-2027)</p>
            <h1 className="labforge-display mt-3 text-4xl font-bold">Select Semester</h1>
            <p className="mt-2 text-muted-foreground">Choose a semester to access laboratories.</p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((semester) => (
            <button
              key={semester}
              onClick={() => setSelected(semester)}
              className={`group flex min-h-36 flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                selected === semester
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/50 hover:bg-accent"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-4xl font-bold ${selected === semester ? "text-primary" : "text-muted-foreground/60"}`}>
                  0{semester}
                </span>
                {semester === 5 ? (
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-semibold uppercase text-primary">Active</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{semester < 5 ? "Completed" : "Upcoming"}</span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-sm font-semibold">Semester {semester}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{semester === 5 ? "3 Laboratories (DSA, NLP, NoSQL)" : "Completed"}</span>
                </div>
                <ChevronRight size={17} className={`transition-transform group-hover:translate-x-1 ${selected === semester ? "text-primary" : "text-muted-foreground"}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <span className="text-sm text-muted-foreground">Selected: <strong className="text-foreground">Semester {selected}</strong></span>
          <Button variant="primary" onClick={() => navigate({ to: "/student/labs" })}>
            View Laboratories <ArrowRight size={16} />
          </Button>
        </div>
      </main>
    </AppFrame>
  );
}

function Labs() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadLabs() {
      try {
        setLoading(true);
        const data = await exerciseService.getLabs(5);
        setLabs(data);
      } catch (err: any) {
        console.error("Failed to load labs:", err);
        setError("Failed to fetch laboratories from MongoDB backend.");
      } finally {
        setLoading(false);
      }
    }
    loadLabs();
  }, []);

  return (
    <AppFrame role="student" active="labs">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Semester V Laboratories (Batch 2024-2027)</p>
            <h1 className="labforge-display mt-3 text-4xl font-bold">Laboratories Studio</h1>
            <p className="mt-2 text-muted-foreground">Select a laboratory workspace to practice official syllabus exercises.</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/student/semester" })}>
            <ArrowLeft size={15} /> Change Semester
          </Button>
        </div>

        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-primary mb-3" />
            <span className="text-sm font-semibold text-muted-foreground">Fetching laboratories from MongoDB...</span>
          </div>
        ) : error ? (
          <div className="mt-12 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-semibold text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry Connection</Button>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {labs.map((lab, index) => (
              <button
                key={lab.id}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("labforge_selected_lab_code", lab.code);
                  }
                  navigate({ to: "/student/workspace" });
                }}
                className="group flex min-h-[250px] flex-col rounded-xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-accent shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex size-12 items-center justify-center rounded-lg ${index === 0 ? "bg-primary/15 text-primary" : index === 1 ? "bg-chart-2/15 text-chart-2" : "bg-chart-3/15 text-chart-3"}`}>
                    {lab.icon === "database" ? <CircleDot size={22} /> : lab.icon === "language" ? <MessageSquare size={22} /> : <Code2 size={22} />}
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{lab.code}</span>
                </div>
                <div className="mt-auto">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lab.technology}
                  </div>
                  <h2 className="labforge-display text-xl font-bold text-foreground">{lab.name}</h2>
                  <p className="mt-2 text-xs text-muted-foreground leading-5 line-clamp-2">{lab.detail}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-medium">
                    <span className="text-muted-foreground">Official Practical Exercises</span>
                    <span className="flex items-center gap-1 text-foreground group-hover:text-primary">
                      Open Lab <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </AppFrame>
  );
}

function Workspace() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLabCode, setSelectedLabCode] = useState<string>("24DCS513 P");
  const [loading, setLoading] = useState<boolean>(true);

  const [mandatory, setMandatory] = useState<Exercise[]>([]);
  const [aiGenerated, setAiGenerated] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const [showSidebar, setShowSidebar] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showAi, setShowAi] = useState(true);

  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    async function initWorkspace() {
      try {
        setLoading(true);
        const labsData = await exerciseService.getLabs(5);
        setLabs(labsData);

        const savedCode = typeof window !== "undefined" ? localStorage.getItem("labforge_selected_lab_code") : null;
        const activeCode = savedCode || (labsData.length > 0 ? labsData[0].code : "24DCS513 P");
        setSelectedLabCode(activeCode);

        const { mandatory: m, aiGenerated: ai } = await exerciseService.getExercisesByLab(activeCode);
        setMandatory(m);
        setAiGenerated(ai);

        if (m.length > 0) {
          setSelectedExerciseId(m[0].id);
        } else if (ai.length > 0) {
          setSelectedExerciseId(ai[0].id);
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setLoading(false);
      }
    }
    initWorkspace();
  }, []);

  const handleSwitchLab = async (code: string) => {
    setSelectedLabCode(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("labforge_selected_lab_code", code);
    }
    try {
      setLoading(true);
      const { mandatory: m, aiGenerated: ai } = await exerciseService.getExercisesByLab(code);
      setMandatory(m);
      setAiGenerated(ai);
      if (m.length > 0) {
        setSelectedExerciseId(m[0].id);
      } else if (ai.length > 0) {
        setSelectedExerciseId(ai[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentLab = labs.find((l) => l.code === selectedLabCode) || {
    id: "nosql-lab",
    name: "NoSQL Database Management Practical",
    short: "NoSQL",
    code: "24DCS513 P",
    technology: "MongoDB and PyMongo",
    workspaceType: "mongodb",
    detail: "Queries, collections & aggregations",
    icon: "database",
    color: "lime",
    semester: 5,
  };

  const activeExercise = [...mandatory, ...aiGenerated].find((e) => e.id === selectedExerciseId);

  const [activeCode, setActiveCode] = useState<string>("");

  useEffect(() => {
    if (currentLab.workspaceType === "mongodb") {
      setActiveCode(`use labforge_lab_student\n\n// Solution for: ${activeExercise?.title || "MongoDB Queries"}\ndb.Students.find()`);
    } else if (currentLab.workspaceType === "cpp") {
      setActiveCode(`#include <iostream>\n#include <vector>\nusing namespace std;\n\n// Solution for: ${activeExercise?.title || "C++ Practical"}\nint main() {\n    cout << "LabForge C++ Practical Solution" << endl;\n    return 0;\n}`);
    } else {
      setActiveCode(`# NLP Notebook for: ${activeExercise?.title || "NLP Practical"}\nimport nltk\nprint("NLP Workspace Initialized")`);
    }
  }, [selectedLabCode, selectedExerciseId]);

  const handleRunCode = async (overrideCode?: string) => {
    setRunning(true);
    const codeToRun = overrideCode || activeCode;
    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem("labforge_user") || "242204" : "242204";
      const result = await executionService.executeCode({
        technology: currentLab.technology.includes("MongoDB") ? "MongoDB" : currentLab.technology.includes("Jupyter") || currentLab.technology.includes("Python") ? "Python + Jupyter" : "C++",
        code: codeToRun,
        studentId,
        testCases: activeExercise?.testCases,
      });
      setLastResult(result);
    } catch (err) {
      console.error("Execution failed:", err);
    } finally {
      setRunning(false);
    }
  };

  const handleFileAction = (action: "new" | "open" | "save" | "saveAs" | "rename" | "delete") => {
    if (action === "new") {
      setActiveCode("// New file workspace\n");
    } else if (action === "delete") {
      setActiveCode("");
      setLastResult(null);
    } else if (action === "save") {
      if (typeof window !== "undefined") {
        localStorage.setItem(`labforge_saved_${selectedLabCode}_${selectedExerciseId}`, activeCode);
      }
    }
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-background text-foreground">
      {/* Top VS Code Header */}
      <VSCodeHeader
        lab={currentLab as any}
        exercise={activeExercise}
        running={running}
        onRun={() => handleRunCode()}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        showAi={showAi}
        setShowAi={setShowAi}
        onFileAction={handleFileAction}
      />

      {/* Lab Switcher Subbar */}
      <div className="flex h-9 shrink-0 items-center border-b border-border bg-card/40 px-3 text-xs gap-3">
        <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">Semester V Labs:</span>
        {labs.map((lab) => (
          <button
            key={lab.id}
            onClick={() => handleSwitchLab(lab.code)}
            className={`px-2.5 py-1 rounded transition-colors text-xs font-semibold ${
              selectedLabCode === lab.code
                ? "bg-primary/15 text-primary font-bold border border-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {lab.name} ({lab.code})
          </button>
        ))}
      </div>

      {/* Main Workspace Body */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center p-12 text-muted-foreground text-xs font-semibold">
          <RefreshCw size={20} className="animate-spin text-primary mr-2" /> Querying MongoDB Backend...
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* Left: Exercise Explorer */}
          {showSidebar && (
            <ExerciseListSidebar
              labName={currentLab.name}
              mandatoryExercises={mandatory}
              aiGeneratedExercises={aiGenerated}
              selectedId={selectedExerciseId}
              onSelect={(id) => setSelectedExerciseId(id)}
            />
          )}

          {/* Center/Right Layout Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
              {/* Exercise Problem Spec Panel */}
              {showDetails && activeExercise && (
                <ExerciseDetailsPanel
                  exercise={activeExercise}
                  onClose={() => setShowDetails(false)}
                  onSubmitSolution={() => handleRunCode()}
                />
              )}

              {/* Lab Editor (MongoDB, Jupyter, or C++) */}
              {currentLab.workspaceType === "mongodb" && (
                <MongoWorkspace
                  running={running}
                  onRunQuery={() => handleRunCode()}
                  code={activeCode}
                  setCode={setActiveCode}
                />
              )}
              {currentLab.workspaceType === "jupyter" && (
                <JupyterWorkspace
                  running={running}
                  onRunNotebook={(compiledCode) => handleRunCode(compiledCode)}
                />
              )}
              {currentLab.workspaceType === "cpp" && (
                <CppWorkspace
                  running={running}
                  onCompileRun={() => handleRunCode()}
                  code={activeCode}
                  setCode={setActiveCode}
                />
              )}

              {/* Right: AI Tutor Chatbot */}
              {showAi && (
                <AIChatSidebar exercise={activeExercise} onClose={() => setShowAi(false)} />
              )}
            </div>

            {/* Bottom Output / Terminal Panel */}
            <BottomTerminalPanel
              running={running}
              lastResult={lastResult}
              technology={currentLab.technology}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FacultyDashboard() {
  const navigate = useNavigate();
  const currentFaculty = typeof window !== "undefined" ? localStorage.getItem("labforge_user_name") : "Faculty";

  return (
    <AppFrame role="faculty" active="dashboard">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chart-2">Faculty Workspace</p>
            <h1 className="labforge-display mt-3 text-4xl font-bold">Good morning, {currentFaculty}.</h1>
            <p className="mt-2 text-muted-foreground">Manage mandatory lab content and automatic AI exercise generation.</p>
          </div>
          <Button variant="primary" onClick={() => navigate({ to: "/faculty/exercises/new" })}>
            <Plus size={16} /> Create Mandatory Exercise
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["40", "Syllabus Practicals", "Across 3 Laboratories", "text-primary"],
            ["24", "AI Generated Extras", "Automatically Created", "text-chart-4"],
            ["03", "Assigned Labs", "Semester V", "text-chart-2"],
            ["100%", "MongoDB Live Sync", "Real Database Mode", "text-chart-3"],
          ].map(([value, label, sub, color]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className={`labforge-display text-3xl font-bold ${color}`}>{value}</div>
              <div className="mt-3 text-sm font-semibold">{label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
      </main>
    </AppFrame>
  );
}

export function LabForgeApp({ screen }: { screen: Screen }) {
  if (screen === "landing") return <Landing />;
  if (screen === "studentLogin") return <Login role="student" />;
  if (screen === "facultyLogin") return <Login role="faculty" />;
  if (screen === "semester") return <Semester />;
  if (screen === "labs") return <Labs />;
  if (screen === "workspace") return <Workspace />;
  if (screen === "facultyDashboard") return <FacultyDashboard />;
  return <FacultyExerciseStudio />;
}