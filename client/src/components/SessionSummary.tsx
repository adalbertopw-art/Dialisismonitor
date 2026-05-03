import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Activity, Bot } from "lucide-react";
import { Patient, PatientReading } from "@shared/types";
import { cn } from "@/lib/utils";

export function SessionSummary({ 
  patient, 
  lastReading, 
  isSessionFinished, 
  aiInterventionsCount 
}: { 
  patient: Patient, 
  lastReading: PatientReading, 
  isSessionFinished: boolean,
  aiInterventionsCount: number
}) {
  if (!isSessionFinished) return null;

  const isHighRisk = lastReading.sbp < 100 || lastReading.riskScore > 75;

  return (
    <Card className={cn(
      "border",
      isHighRisk ? "bg-rose-950/20 border-rose-500/30" : "bg-emerald-950/20 border-emerald-500/30"
    )}>
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        {isHighRisk ? (
          <AlertTriangle className="text-rose-500" size={18} />
        ) : (
          <CheckCircle2 className="text-emerald-500" size={18} />
        )}
        <CardTitle className={cn(
          "text-sm font-bold uppercase tracking-widest",
          isHighRisk ? "text-rose-400" : "text-emerald-400"
        )}>
          Resumen de Sesión Finalizada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
           La sesión de hemodiálisis de {patient.sessionDuration} horas ha concluido para el paciente. 
           {isHighRisk ? " Se registró inestabilidad hemodinámica hacia el final del tratamiento, requiriendo revisión antes del alta." : " El tratamiento finalizó sin eventos adversos mayores."}
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Estado Post-Sesión */}
           <div className="bg-white/5 rounded-lg p-3 border border-white/5">
             <div className="flex items-center gap-2 mb-2">
               <Activity size={14} className="text-muted-foreground" />
               <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Estado Final</span>
             </div>
             <div className="space-y-1">
               <div className="flex justify-between items-center">
                 <span className="text-[11px] text-muted-foreground">PA:</span>
                 <span className={cn("text-xs font-mono font-bold", isHighRisk ? "text-rose-400" : "text-white")}>
                   {lastReading.sbp}/{lastReading.dbp} mmHg
                 </span>
               </div>
               <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                 <span className="text-[11px] text-muted-foreground">UF (Aprox):</span>
                 <span className="text-xs font-mono font-bold text-white">
                   {((patient.ufGoal || 2.5) * 1000).toFixed(0)} mL
                 </span>
               </div>
             </div>
           </div>

           {/* Intervenciones IA */}
           <div className="bg-sky-500/5 rounded-lg p-3 border border-sky-500/10">
             <div className="flex items-center gap-2 mb-2">
               <Bot size={14} className="text-sky-400" />
               <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Intervenciones IA</span>
             </div>
             <div className="flex flex-col mb-1">
               <span className="text-xl font-mono font-bold text-sky-400 leading-none mb-1">{aiInterventionsCount}</span>
               <span className="text-[10px] text-muted-foreground leading-tight">
                 acciones automatizadas / profilácticas
               </span>
             </div>
           </div>
           
           {/* Nivel de Riesgo */}
           <div className={cn(
             "rounded-lg p-3 border",
             isHighRisk ? "bg-rose-500/5 border-rose-500/10" : "bg-emerald-500/5 border-emerald-500/10"
           )}>
             <div className="flex items-center gap-2 mb-2">
               <AlertTriangle size={14} className={isHighRisk ? "text-rose-400" : "text-emerald-400"} />
               <span className={cn("text-[10px] uppercase font-bold tracking-widest", isHighRisk ? "text-rose-400" : "text-emerald-400")}>
                 Riesgo al Alta
               </span>
             </div>
             <div className="flex flex-col">
               <span className={cn("text-sm font-black uppercase tracking-wider", isHighRisk ? "text-rose-400" : "text-emerald-400")}>
                 {isHighRisk ? "Elevado" : "Bajo/Estable"}
               </span>
               <span className="text-[10px] text-muted-foreground mt-1">
                 {isHighRisk ? "Monitoreo post-diálisis requerido." : "Apto para alta ambulatoria."}
               </span>
             </div>
           </div>
         </div>
      </CardContent>
    </Card>
  );
}
