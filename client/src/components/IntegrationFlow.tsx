import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Cpu, Radio, Router, CheckCircle2, Stethoscope, Settings2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function IntegrationFlow() {
  const [incomingPayloads, setIncomingPayloads] = useState<string[]>([]);
  const [outgoingPayloads, setOutgoingPayloads] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toISOString();
      const sbp = Math.floor(90 + Math.random() * 50); // intentionally causing drops
      const dbp = Math.floor(55 + Math.random() * 25);
      const hr = Math.floor(70 + Math.random() * 30);
      const ufRate = (600 + Math.random() * 200).toFixed(1);
      const na = (138 + Math.random() * 4).toFixed(1);

      const machinePayload = {
        event: "TELEMETRY_UPDATE",
        deviceId: "FMC-5008-MX-01",
        timestamp,
        sensors: { sbp, dbp, hr, ufRate, dialysateNa: na },
      };

      setIncomingPayloads(prev => [JSON.stringify(machinePayload, null, 2), ...prev].slice(0, 6));

      if (sbp < 105) {
        setAiAnalysis(`[${now.toLocaleTimeString()}] AI Inference: Alto riesgo de IDH detectado (Prob: ${(80 + Math.random() * 15).toFixed(1)}%). Calculando ajustes de bio-retroalimentación para compensar la caída de PAS (${sbp} mmHg)...`);
        const command = {
          commandId: `CMD-${Math.floor(Math.random() * 10000)}`,
          targetDevice: "FMC-5008-MX-01",
          mode: "CLOSED_LOOP_CONTROL",
          action: "ADJUST_PARAMETERS",
          adjustments: {
            ufRate: 250, // Reduced UF rate
            dialysateNa: 142 // Increased Na to support BP
          },
          authorizedBy: "AI-AUTO-PROTOCOL"
        };
        setOutgoingPayloads(prev => [JSON.stringify(command, null, 2), ...prev].slice(0, 6));
      } else {
        setAiAnalysis(`[${now.toLocaleTimeString()}] AI Inference: Paciente estable (Prob. colapso: ${(10 + Math.random() * 10).toFixed(1)}%). PAS en rango (${sbp} mmHg). Manteniendo parámetros de ultrafiltración según prescripción inicial.`);
      }

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[750px]">
      {/* Column 1: Machine Data */}
      <Card className="bg-card/40 border-border/50 flex flex-col h-full shadow-lg">
        <CardHeader className="bg-black/20 border-b border-border/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Radio size={16} className="animate-pulse" />
             Máquina de Hemodiálisis
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">ENLACE IoT ACTIVO (HL7 / MQTT)</p>
        </CardHeader>
        <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
          <div className="text-xs text-muted-foreground bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-emerald-300 font-mono flex items-center justify-between">
            <span>Status: TRANSMITIENDO</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <ScrollArea className="flex-1 w-full rounded-md border border-white/5 bg-[#0a0a0a] p-4 relative">
            <div className="space-y-4">
              {incomingPayloads.map((payload, i) => (
                <div key={i} className={cn("font-mono text-[10px] whitespace-pre-wrap transition-all duration-500", i === 0 ? "opacity-100 text-emerald-300 translate-x-0" : "opacity-40 text-emerald-300/50 translate-x-2")}>
                  {payload}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Column 2: AI Engine */}
      <Card className="bg-card/40 border-border/50 flex flex-col h-full shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-purple-500/5 pointer-events-none" />
        <CardHeader className="bg-black/20 border-b border-border/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
            <Cpu size={16} className="animate-pulse" />
             Motor Central IA (Cloud/Edge)
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">TRANSFORMER + TCN INFERENCE</p>
        </CardHeader>
        <CardContent className="flex-1 p-6 flex flex-col gap-6 justify-center items-center relative z-10">
             <div className="w-full bg-black/60 border border-white/10 rounded-xl p-5 flex flex-col items-center gap-3 text-center backdrop-blur-md">
                 <Router size={32} className="text-sky-400" />
                 <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">Recepción y Filtrado</h4>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">Procesamiento de señal continua, eliminación de artefactos y alineación temporal a 1Hz. Validando rangos biológicos.</p>
             </div>
             
             <div className="flex flex-col items-center py-2 relative w-full">
               <div className="h-10 border-l-2 border-dashed border-sky-400/50" />
               <div className="h-2 w-2 rounded-full bg-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
             </div>

             <div className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-5 flex flex-col items-center gap-3 text-center backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                 <Activity size={32} className="text-purple-400" />
                 <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">Inferencia Biomatemática</h4>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">Cálculo de probabilidad de colapso cardiovascular (IDH) usando el modelo predictivo Ensemble. Generación de recomendaciones y/o comandos.</p>
                 
                 <div className="mt-4 w-full p-3 bg-[#0a0a0a] border border-purple-500/20 rounded-md text-[10px] font-mono text-purple-300 text-left min-h-[60px]">
                    {aiAnalysis || "Esperando datos..."}
                 </div>
             </div>
        </CardContent>
      </Card>

      {/* Column 3: Output / Actions */}
      <Card className="bg-card/40 border-border/50 flex flex-col h-full shadow-lg">
        <CardHeader className="bg-black/20 border-b border-border/20 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2">
            <Settings2 size={16} />
             Comandos a Máquina / Médico
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">BARRERA DE SEGURIDAD FÍSICA</p>
        </CardHeader>
        <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
          
          <div className="grid grid-cols-2 gap-3 mb-2">
             <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500 animate-pulse" />
                 <CheckCircle2 size={24} className="text-rose-400" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Closed Loop</span>
                 <span className="text-[8px] text-muted-foreground uppercase">Envío Directo</span>
             </div>
             <div className="bg-[#111] border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                 <Stethoscope size={24} className="text-muted-foreground" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Human-in-Loop</span>
                 <span className="text-[8px] text-muted-foreground uppercase">Aprobación Manual</span>
             </div>
          </div>

          <ScrollArea className="flex-1 w-full rounded-md border border-rose-500/20 bg-[#0a0a0a] p-4 relative shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
            <div className="space-y-4">
              {outgoingPayloads.length === 0 ? (
                 <div className="text-[10px] text-muted-foreground text-center mt-10 font-mono">ESPERANDO TRIGGERS...</div>
              ) : (
                outgoingPayloads.map((payload, i) => (
                  <div key={i} className={cn("font-mono text-[10px] whitespace-pre-wrap transition-all duration-500", i === 0 ? "opacity-100 text-rose-300 translate-x-0" : "opacity-40 text-rose-300/50 translate-x-2")}>
                    {payload}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
