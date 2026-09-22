# LabForge Project Architecture & System Design

LabForge is a local, offline-first educational laboratory studio designed for computer science students and faculty. It uses a modern full-stack web architecture that can run both as a web application and packaged as an Electron desktop application on Windows.

---

## 🏗 High-Level System Architecture

```text
+-----------------------------------------------------------------------------+
|                          LABFORGE DESKTOP CONTAINER                         |
|                         (Electron Renderer / Web Browser)                   |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |                             REACT UI                                  |  |
|  |  - TanStack Router Pages (Landing, Login, Semester, Labs, Workspace)   |  |
|  |  - VS Code Workspace Components (MongoDB, Jupyter, C++ Editors)       |  |
|  |  - System Settings & Diagnostic Modals                                |  |
|  |  - OKLCH Design Tokens (Light Mode & Dark Mode)                       |  |
|  +-----------------------------------------------------------------------+  |
|                                      |                                      |
|                                      v                                      |
|  +-----------------------------------------------------------------------+  |
|  |                       TANSTACK START SERVER RPC                        |  |
|  |  - auth.ts (BCrypt Password Authentication)                           |  |
|  |  - student.ts (Lab & Syllabus Exercise RPCs)                          |  |
|  |  - faculty.ts (Course Scoped Content Authoring & Submissions)         |  |
|  |  - execution.ts (Sandboxed Code Execution Engine Bridge)              |  |
|  |  - import.ts (Syllabus PDF Parser)                                    |  |
|  |  - ai.ts (Auto AI Extra Exercise Synthesis)                           |  |
|  +-----------------------------------------------------------------------+  |
|                                      |                                      |
|           +--------------------------+--------------------------+           |
|           |                                                     |           |
|           v                                                     v           |
|  +---------------------------------+   +---------------------------------+  |
|  |      REAL MONGODB DATABASE      |   |    LOCAL EXECUTION RUNNERS      |  |
|  |  - `laboratories`               |   |  - C++ `g++`/`clang++` Service  |  |
|  |  - `exercises` (40 Syllabus)   |   |  - Python 3 / Jupyter Service   |  |
|  |  - `users` (Student & Faculty)  |   |  - Sandboxed Student MongoDB    |  |
|  |  - `submissions`                |   |    (`labforge_lab_<studentId>`) |  |
|  +---------------------------------+   +---------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## 📁 Repository Directory Map

- **`src/api/db/`**: MongoDB connection singleton, Zod validation schemas, collection index setup, and connection health checks.
- **`src/api/functions/`**: TanStack Start server RPC endpoints for authentication, student labs, faculty content management, code execution, and AI extra synthesis.
- **`src/api/services/`**: Local sandboxed code execution runners (`cppRunner.ts`, `jupyterRunner.ts`, `mongoRunner.ts`, `systemChecker.ts`).
- **`src/components/workspace/`**: Lightweight VS Code-inspired UI components (`VSCodeHeader.tsx`, `MongoWorkspace.tsx`, `JupyterWorkspace.tsx`, `CppWorkspace.tsx`, `SystemReadinessModal.tsx`, `SystemSettingsModal.tsx`, `FileConfirmModal.tsx`).
- **`src/components/faculty/`**: Faculty Exercise Studio for creating and publishing mandatory lab exercises with test cases.
- **`src/hooks/`**: React state management hooks (`useEditorSettings.ts`, `useTheme.ts`).
- **`electron/`**: Electron main process (`main.ts`), IPC handlers (`ipc.ts`), and secure preload script (`preload.ts`) enforcing `contextIsolation: true`.
- **`scripts/`**: Official database seeder script (`seed.ts`) populating all 40 syllabus practical exercises.

---

## 🔒 Security Architecture & Boundaries

1. **Electron Context Isolation**:
   - `contextIsolation: true` enabled for all renderer processes.
   - `nodeIntegration: false` enforced to prevent unsafe node calls inside web pages.
   - Restricted preload API exposed via `window.labforgeBridge`.

2. **Database Isolation**:
   - Application collections (`users`, `exercises`, `laboratories`, `submissions`) are managed exclusively on the server layer.
   - Student queries in the NoSQL workspace run inside isolated databases (`labforge_lab_<studentId>`).

3. **Faculty Scope Protection**:
   - Faculty exercise authoring and submission views are restricted to their assigned course code (`24DCS512 P`, `24DCS511 P`, `24DCS513 P`).
