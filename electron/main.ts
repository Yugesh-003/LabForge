import { app, BrowserWindow } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    title: "LabForge — Laboratory Learning Studio",
    webPreferences: {
      contextIsolation: true,  // Enforce context isolation
      nodeIntegration: false,   // Disable Node.js integration in renderer
      sandbox: true,           // Enforce sandboxing
      preload: path.join(__dirname, "preload.js")
    }
  });

  registerIpcHandlers();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
