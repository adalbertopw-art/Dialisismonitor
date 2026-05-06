import { useState, useEffect } from "react";

export function useAiAutopilot() {
  const [aiAutopilot, setAiAutopilot] = useState(() => {
    try {
      const val = localStorage.getItem("hd_ai_autopilot");
      if (val !== null) return JSON.parse(val);
    } catch {}
    return false;
  });

  useEffect(() => {
    const handleAutopilotChange = (e: any) => {
      setAiAutopilot(e.detail.active);
    };
    window.addEventListener('ai_autopilot_changed', handleAutopilotChange);
    return () => window.removeEventListener('ai_autopilot_changed', handleAutopilotChange);
  }, []);

  return aiAutopilot;
}
