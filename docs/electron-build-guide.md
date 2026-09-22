# LabForge Windows Electron Desktop Build & Offline Guide

LabForge includes configuration to package the web studio into an offline desktop application using Electron for Windows.

---

## 🔒 1. Electron Security Configuration

LabForge strictly adheres to Electron security best practices:

- **Context Isolation (`contextIsolation: true`)**: Prevents renderer scripts from accessing Electron main process internals.
- **Node Integration Disabled (`nodeIntegration: false`)**: Web views and student workspace components cannot execute node commands directly.
- **Preload IPC Bridge (`preload.ts`)**: Exposes only validated execution bridge methods under `window.labforgeBridge`.

---

## 🏃 2. Running Electron in Development

1. **Build Web Output**:
   ```bash
   npm run build
   ```

2. **Start Electron Container**:
   ```bash
   npx electron electron/main.ts
   ```

---

## 📦 3. Packaging Windows Application (.exe)

1. **Install Electron Builder** (if packaging desktop executable):
   ```bash
   npm install --save-dev electron-builder
   ```

2. **Add Build Config to `package.json`**:
   ```json
   "build": {
     "appId": "dev.labforge.app",
     "productName": "LabForge Studio",
     "win": {
       "target": ["nsis", "portable"],
       "icon": "public/favicon.ico"
     },
     "files": [
       ".output/**/*",
       "electron/**/*"
     ]
   }
   ```

3. **Execute Windows Desktop Package**:
   ```bash
   npx electron-builder --win
   ```
   The installer executable will be generated in `dist/` directory.

---

## 🔌 4. Offline Operation Guarantees

- **Local MongoDB**: All laboratory content, student exercises, and submissions read and write locally to `mongodb://127.0.0.1:27017`.
- **Local Compilers & Executables**: C++ compilation (`g++`) and Python code execution execute via local child processes.
- **Deterministic AI Fallback**: If an internet connection or LLM API key is absent, the AI exercise generator uses deterministic rule-based exercise synthesis templates offline.
