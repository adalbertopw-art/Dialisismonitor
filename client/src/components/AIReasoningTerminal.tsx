import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, BrainCircuit, Activity, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AIReasoningTerminal({ patient, lastReading }: any) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastReading) return;

    const minute = lastReading.minuteOfSession || 0;
    const sbp = lastReading.sbp || 120;
    const ufr = lastReading.ufRate || 10;
    const risk = Math.round(lastReading.riskScore || 15);
    
    // Create a new reasoning sequence for this tick
    const newSequence = [
      `[t=${minute}m] -------------------------------------`,
      `[DATA] Ingesta de telemetría confirmada.`,
      `[ANÁLISIS] PAS: ${sbp} mmHg | UFR: ${ufr} mL/h | Riesgo: ${risk}%`,
      `[INFERENCIA] Calculando gradiente oncótico y retroalimentación de volumen...`,
      risk > 40 
        ? `[ALERTA] Reducción de PAS proyectada excede el límite de tolerancia. Activando Gemelo Digital.` 
        : `[ESTADO] Variables hemodinámicas dentro de umbrales seguros.`,
      risk > 40
        ? `[RECOMENDACIÓN] Sugiriendo perfilado UF de rescate o ajuste de temp. de dializado.`
        : `[RECOMENDACIÓN] Continuación de parámetros actuales viable.`,
    ];

    // Gradually add logs to create a "typing/thinking" effect
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < newSequence.length) {
        setLogs(prev => [...prev, newSequence[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800); // 800ms between lines

    return () => clearInterval(interval);
  }, [lastReading]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <Card className="bg-[#0a0a0a] border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden h-full flex flex-col">
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-emerald-500/5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-400">
              <BrainCircuit size={16} /> Cerebro de Razonamiento Clínico
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 animate-pulse">
            <Zap size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">En Vivo</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden bg-black/40 flex flex-col">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="font-mono text-[11px] leading-relaxed space-y-1.5 w-full p-4">
            {logs.length === 0 ? (
              <div className="text-muted-foreground/50 italic flex items-center gap-2">
                <Terminal size={12} /> Inicializando red neuronal...
              </div>
            ) : (
              logs.map((log, i) => {
                let colorClass = "text-emerald-400/80";
                if (log.includes("[ALERTA]")) colorClass = "text-rose-400 font-bold";
                else if (log.includes("[RECOMENDACIÓN]")) colorClass = "text-sky-400 font-bold";
                else if (log.includes("[ANÁLISIS]")) colorClass = "text-amber-400";
                else if (log.includes("-------")) colorClass = "text-muted-foreground/30";
                
                return (
                  <div key={i} className={`break-words ${colorClass}`}>
                    <span className="text-muted-foreground/40 mr-2">{'>'}</span> 
                    {log}
                  </div>
                );
              })
            )}
            <div className="flex items-center gap-2 mt-2 text-emerald-500 animate-pulse">
              <span className="text-muted-foreground/40 mr-2">{'>'}</span>
              <div className="w-2 h-4 bg-emerald-500/70" />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
