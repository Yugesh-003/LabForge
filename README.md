# LabForge — Educational Laboratory Learning Studio

**LabForge** is an offline-capable, interactive desktop educational laboratory platform built for computer science students and faculty. It features a lightweight VS Code-inspired workspace, native multi-lab execution engines (C++, Python Jupyter, MongoDB), live Google Gemini AI tutor integration, and an automatic AI exercise synthesis engine.

---

## 🛠️ Complete Tech Stack Documentation

### 1. Frontend & Client Framework
- **React 19**: Modern component architecture utilizing concurrent rendering, modern hooks (`useState`, `useEffect`), and lightweight state management.
- **TypeScript**: End-to-end static typing for robust domain models, execution types, and API payload contracts.
- **TanStack Start**: Server-side runtime integration and full-stack route handlers.
- **TanStack Router**: File-based routing with typesafe navigation (`/student/login`, `/student/semester`, `/student/labs`, `/student/workspace`, `/faculty/dashboard`, `/faculty/exercises/new`).
- **Lucide React**: High-density icon library for VS Code-like workspace UI components.

### 2. Styling & Design System
- **Vanilla CSS & OKLCH Color Space**: Precision dark-mode and light-mode tokens using modern OKLCH color functions (`oklch(0.86 0.19 132)`).
- **Tailwind CSS**: Utility classes for responsive layouts, panel flex/grid structures, and typography formatting.

### 3. Database & Persistence Layer
- **MongoDB 7.0 (Native Driver)**: Real local MongoDB database connection (`mongodb://127.0.0.1:27017/labforge`).
- **Persistence Collections**:
  - `users`: Student roll numbers, faculty accounts, bcrypt password hashes, and academic batch information.
  - `laboratories`: Semester V lab metadata (DSA C++, NLP Python, NoSQL MongoDB).
  - `exercises`: Official mandatory practicals and auto-generated AI application extras.
  - `submissions`: Student solution histories, test case pass rates, execution times, and timestamps.

### 4. Code Execution Engines
- **C++ Compiler Engine (`cppRunner.ts`)**:
  - System `g++` / `clang++` detection with C++17 flag (`-std=c++17`).
  - Child process execution with non-blocking standard input streaming (`child.stdin`).
- **Python & Jupyter Notebook Engine (`jupyterRunner.ts`)**:
  - System `python` / `python3` detection.
  - Pre-installed library verification (`nltk`, `spacy`, `sklearn`, `numpy`, `pandas`).
  - Smart non-blocking interactive `input()` wrapper to execute real-time interactive scripts (e.g. NLP Chatbots) without timeout hangs.
- **NoSQL MongoDB Query Engine (`mongoRunner.ts`)**:
  - Direct MongoDB collection query execution against student sandboxed database (`labforge_lab_student`).

### 5. AI Services & Chatbot Integration
- **Google Gemini REST API (`ai.ts`)**:
  - Integrated with live Gemini REST endpoint (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`).
  - Direct integration using uploaded Gemini API key (`GEMINI_API_KEY`).
  - Context-aware student tutoring (reads problem title, description, and student code).
  - Domain fallback synthesizer for offline network operation.
- **Automatic Extra Exercise Generator**:
  - Automatically synthesizes 2 application-oriented extra practice problems whenever faculty publishes a mandatory exercise.

### 6. Desktop Packaging & Security
- **Electron Shell (`electron/`)**:
  - Desktop executable packaging capability for Windows (`.exe`).
  - **`contextIsolation: true`** enabled across renderer processes.
  - **`nodeIntegration: false`** enforced.
  - Restricted IPC context bridge (`window.labforgeBridge`).

### 7. Security & Authentication
- **Bcrypt.js (`bcryptjs`)**: Salted password hashing (cost factor 10) for secure credential verification in MongoDB.
- **Zod Schema Validation**: Server-side request payload validation (`LoginInputSchema`, `SignupInputSchema`, `PublishExerciseSchema`).

---

## 🌟 User Workflows

### 🎓 Student Workflow
1. **Sign Up / Sign In**:
   - New students click **Sign Up** to create an account with Roll Number, Full Name, and Password.
   - Registered students enter Roll Number & Password for immediate login.
2. **Laboratory Selection**:
   - Select Academic Year (III Year) and Semester V.
   - Choose between **Data Structures & Algorithms (C++)**, **Natural Language Processing (Python/Jupyter)**, or **NoSQL Database Management (MongoDB)**.
3. **Realtime Code Execution**:
   - Run interactive C++, Python, or MongoDB code in real time with stdout/stderr, problem test case verification, and execution diagnostics.
4. **Gemini AI Tutor**:
   - Chat live with Google Gemini AI Assistant for hints, debugging, and step-by-step guidance.

### 👩‍🏫 Faculty Workflow
1. **Faculty Access**:
   - Log in with faculty credentials (`faculty_dsa`, `faculty_nlp`, `faculty_nosql`).
2. **Lab & Exercise Management**:
   - Pre-selects assigned laboratory while allowing switching to any Semester V lab.
   - View all existing exercises saved in MongoDB.
   - **Edit** existing exercises or **Delete** exercises directly from MongoDB.
   - Create and publish new mandatory exercises with test cases, difficulty, and learning objectives.

---

## 🚀 Local Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd lovable-project
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Verify Environment Variables (`.env`)**:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/labforge
   MONGODB_DB_NAME=labforge
   PORT=8081
   VITE_APP_NAME="LabForge"
   VITE_APP_VERSION="1.2.0"
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:8081`.

---

## 📄 License
LabForge Educational Learning Studio — All rights reserved.
