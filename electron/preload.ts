import { contextBridge, ipcRenderer } from "electron";

export interface LabForgeBridgeAPI {
  getAppVersion: () => Promise<string>;
  executeLabCode: (request: {
    technology: string;
    code: string;
    testCases?: Array<{ id: string; input: string; expectedOutput: string }>;
  }) => Promise<any>;
  saveOfflineState: (key: string, data: any) => Promise<boolean>;
  getOfflineState: (key: string) => Promise<any>;
}

/**
 * Restricted Preload Bridge for LabForge Electron Desktop Container.
 * Strictly exposes whitelisted IPC methods without granting nodeIntegration privileges.
 */
const labforgeBridge: LabForgeBridgeAPI = {
  getAppVersion: async () => {
    return ipcRenderer.invoke("labforge:getAppVersion");
  },
  executeLabCode: async (request) => {
    // Validate request structure before passing through IPC
    if (!request || !request.technology || typeof request.code !== "string") {
      throw new Error("Invalid IPC Code Execution payload");
    }
    return ipcRenderer.invoke("labforge:executeLabCode", request);
  },
  saveOfflineState: async (key: string, data: any) => {
    if (typeof key !== "string") throw new Error("Invalid state key");
    return ipcRenderer.invoke("labforge:saveOfflineState", { key, data });
  },
  getOfflineState: async (key: string) => {
    if (typeof key !== "string") throw new Error("Invalid state key");
    return ipcRenderer.invoke("labforge:getOfflineState", { key });
  }
};

contextBridge.exposeInMainWorld("labforgeBridge", labforgeBridge);
