import { useEffect, useState } from "react";

export interface EditorSettings {
  fontSize: number; // e.g. 12, 14, 16, 18
  tabSize: number; // e.g. 2, 4
  wordWrap: "on" | "off";
  autosave: "off" | "afterDelay" | "onFocusChange";
  terminalVisible: boolean;
  panelLayout: "default" | "expanded-editor" | "sidebar-right";
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: "on",
  autosave: "afterDelay",
  terminalVisible: true,
  panelLayout: "default",
};

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("labforge-settings");
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("labforge-settings", JSON.stringify(settings));
    }
  }, [settings]);

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, setSettings, updateSetting };
}
