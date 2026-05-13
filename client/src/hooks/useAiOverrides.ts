import { useState, useEffect } from "react";

export function useAiOverrides() {
  const [overrides, setOverrides] = useState<number[]>(() => {
    try {
      const val = localStorage.getItem("hd_ai_overrides");
      if (val !== null) return JSON.parse(val);
    } catch {}
    return [];
  });

  const toggleOverride = (patientId: number) => {
    setOverrides(prev => {
      const isOverridden = prev.includes(patientId);
      const next = isOverridden ? prev.filter(id => id !== patientId) : [...prev, patientId];
      localStorage.setItem("hd_ai_overrides", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('ai_overrides_changed', { detail: { next } }));
      return next;
    });
  };

  useEffect(() => {
    const handleOverridesChange = (e: any) => {
      setOverrides(e.detail.next);
    };
    window.addEventListener('ai_overrides_changed', handleOverridesChange);
    return () => window.removeEventListener('ai_overrides_changed', handleOverridesChange);
  }, []);

  return { overrides, toggleOverride };
}
