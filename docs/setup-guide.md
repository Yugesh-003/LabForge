# LabForge Complete Setup & Toolchain Guide

This guide details the complete installation, environment configuration, database setup, toolchain requirements (C++, Python 3, Jupyter, MongoDB), and demo account credentials for LabForge.

---

## 🛠 1. System Requirements & Prerequisites

- **Operating System**: Windows 10/11, macOS, or Linux
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Community Edition v6.0 or higher (running locally on port 27017)
- **C++ Compiler**: `g++` (MinGW-w64 on Windows) or `clang++`
- **Python**: Python 3.9+ with `pip`

---

## 🍃 2. MongoDB Setup

1. **Install MongoDB Community Server**:
   Download and install from [MongoDB Community Server Downloads](https://www.mongodb.com/try/download/community).
   Ensure the MongoDB service runs on `mongodb://127.0.0.1:27017`.

2. **Verify Local MongoDB Connection**:
   ```bash
   mongosh "mongodb://127.0.0.1:27017"
   ```

3. **Database Seeding**:
   Populate the database with official syllabus laboratories, accounts, and 40 practical exercises:
   ```bash
   npx tsx scripts/seed.ts
   ```

---

## 🐍 3. Python & Jupyter Setup (NLP Laboratory)

1. **Install Python 3.9+**:
   Ensure Python is added to system `PATH`. Check availability:
   ```bash
   python --version
   ```

2. **Install Required NLP & Data Packages**:
   ```bash
   pip install nltk spacy scikit-learn numpy pandas
   ```

3. **Download NLTK Data & SpaCy Language Models (Optional for Offline)**:
   ```bash
   python -m nltk.downloader stopwords punkt
   python -m spacy download en_core_web_sm
   ```

---

## ⚙️ 4. C++ Compiler Setup (DSA Laboratory)

1. **Windows Setup (MinGW-w64)**:
   Install GCC via [msys2](https://www.msys2.org/) or MinGW-w64 build. Add the `bin` folder (e.g. `C:\msys64\ucrt64\bin`) to Windows system environment variable `PATH`.

2. **Verify Compiler Availability**:
   ```bash
   g++ --version
   ```
   *(Or `clang++ --version` on macOS/Linux)*.

---

## 🔑 5. Environment Variables Configuration

Copy `.env.example` to `.env` in project root:

```ini
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=labforge
PORT=8081
GEMINI_API_KEY=
NODE_ENV=development
```

---

## 👥 6. Pre-configured Account Credentials

### 🎓 Student Accounts
| Role | Identity / Roll No | Password | Scope |
|---|---|---|---|
| **Student** | `242204` | `student123` | III Year · Semester V Labs |

### 👩‍🏫 Faculty Accounts
| Role | Identity / Username | Password | Assigned Scope |
|---|---|---|---|
| **DSA Faculty** | `faculty_dsa` | `faculty123` | Data Structures & Algorithm Practical (`24DCS512 P`) |
| **NLP Faculty** | `faculty_nlp` | `faculty123` | Natural Language Processing Lab (`24DCS511 P`) |
| **NoSQL Faculty** | `faculty_nosql` | `faculty123` | NoSQL Database Management Practical (`24DCS513 P`) |

---

## 🏃 7. Running the Application

### Development Mode
```bash
npm run dev
```
Open browser at `http://localhost:8081`.

### Production Build & Preview
```bash
npm run build
npm run preview
```
