import { useEffect, useRef } from "react";

export function playAlarm() {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio no disponible", e);
  }
}

export default function AudioAlarm({ riskScore }: { riskScore: number }) {
  const lastAlarmTime = useRef<number>(0);

  useEffect(() => {
    if (riskScore >= 65) {
      const now = Date.now();
      if (now - lastAlarmTime.current > 30000) {
        playAlarm();
        lastAlarmTime.current = now;
      }
    }
  }, [riskScore]);

  return null;
}
