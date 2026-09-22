# LabForge Troubleshooting & FAQ Guide

This guide provides diagnostics and fixes for common runtime, environment, toolchain, and database issues.

---

## 🔍 Live System Diagnostics

You can verify toolchain health inside the LabForge application at any time:
1. Click **System Diagnostics** (CPU icon) in the top workspace header bar.
2. Review live connection status for MongoDB, C++ Compiler, Python 3.x, and NLP packages.

---

## 🛠 Common Issues & Solutions

### 1. MongoDB Connection Error (`MongoNetworkError` / `connect ECONNREFUSED`)
- **Symptom**: "Failed to connect to MongoDB server at 127.0.0.1:27017".
- **Fix**:
  1. Ensure MongoDB service is running locally.
  2. Windows: Open `services.msc` and start **MongoDB Server**.
  3. Alternatively run `mongod` in a terminal window.
  4. Run `npx tsx scripts/seed.ts` to populate database tables.

---

### 2. C++ Compiler Not Detected (`exitCode: 127`)
- **Symptom**: "C++ Compiler (g++ or clang++) not found in system PATH".
- **Fix**:
  1. Install MinGW-w64 or GCC.
  2. Add binary directory (e.g. `C:\msys64\ucrt64\bin`) to system environment variable `PATH`.
  3. Restart terminal and verify `g++ --version`.

---

### 3. Python 3 Executable Not Found
- **Symptom**: "Python 3 executable not found in system PATH".
- **Fix**:
  1. Download Python 3.9+ from [python.org](https://www.python.org/).
  2. Check **Add python.exe to PATH** during installation.

---

### 4. Missing NLP Packages (`ImportError: No module named 'nltk'`)
- **Symptom**: NLP package status badge shows red `✗` in System Diagnostics.
- **Fix**:
  Run pip package installation:
  ```bash
  pip install nltk spacy scikit-learn numpy pandas
  ```

---

### 5. Port 8081 Already in Use
- **Symptom**: Server fails to bind to port 8081.
- **Fix**:
  Specify a custom port in `.env`:
  ```ini
  PORT=8082
  ```
