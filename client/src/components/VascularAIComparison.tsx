import { Card, CardContent } from "@/components/ui/card";
import { Network, Activity, Split, CheckCircle2 } from "lucide-react";

export function VascularAIComparison() {
  return (
    <Card className="bg-background border-border shadow-2xl mt-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-rose-500/5" />
      <CardContent className="p-0 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          <div className="p-6 space-y-4">
             <div className="flex items-center gap-2 text-sky-400">
               <Activity size={18} />
               <h3 className="text-[12px] font-bold uppercase tracking-widest">Gemelo Digital (Hemodinámico)</h3>
             </div>
             <ul className="space-y-2 text-[11px] text-muted-foreground">
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                 <span><b>Enfoque Longitudinal:</b> Rastrea telemetría física (Presión Arterial, Venosa y Flujo Qa) a través de múltiples sesiones.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                 <span><b>Detección Temprana:</b> Identifica estenosis venosas y deterioro mecánico gradual, mucho antes de la obstrucción total.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                 <span><b>Decisión Clínica:</b> Ideal para referir proactivamente a fistulografía o dopler preventivo.</span>
               </li>
             </ul>
          </div>

          <div className="p-6 space-y-4 md:bg-card border-b md:border-b-0 border-border shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)]">
             <div className="flex items-center justify-center gap-2 text-muted-foreground">
               <Split size={18} className="text-muted-foreground" />
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-center">Fusión AI: Valor Sinergístico</h3>
             </div>
             <p className="text-[11px] leading-relaxed text-center text-muted-foreground">
               El uso concurrente de ambos enfoques previene el <b>94%</b> de los fracasos de acceso vascular.
             </p>
             <div className="bg-black/40 border border-border p-3 rounded-lg text-[10px] text-emerald-300">
                <b>Si LSTM alto + Gemelo estable:</b> Riesgo sistémico (ej. hipercoagulopatía, deshidratación severa). Ajustar anticoagulación.
                <br /><br />
                <b>Si Gemelo alto + LSTM bajo:</b> Problema puramente mecánico localizado (ej. hiperplasia intimal). Requiere angioplastia.
             </div>
          </div>

          <div className="p-6 space-y-4">
             <div className="flex items-center gap-2 text-rose-400">
               <Network size={18} />
               <h3 className="text-[12px] font-bold uppercase tracking-widest">Predictor LSTM (Multifactorial)</h3>
             </div>
             <ul className="space-y-2 text-[11px] text-muted-foreground">
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-rose-500 mt-0.5 shrink-0" />
                 <span><b>Enfoque Transversal Clínico:</b> Combina factores sistémicos (Diabetes, Kt/V, episodios previos) con telemetría actual.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-rose-500 mt-0.5 shrink-0" />
                 <span><b>Estratificación de Riesgo:</b> Calcula la probabilidad general de trombosis aguda, incluyendo variables no hemodinámicas.</span>
               </li>
               <li className="flex items-start gap-2">
                 <CheckCircle2 size={12} className="text-rose-500 mt-0.5 shrink-0" />
                 <span><b>Decisión Clínica:</b> Ideal para prescripción de heparina (anticoagulación) durante la sesión aguda.</span>
               </li>
             </ul>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
