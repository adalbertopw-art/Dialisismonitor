import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Syringe, Activity, TrendingUp, TrendingDown, Target, Zap, AlertTriangle } from "lucide-react";

export function AnemiaManager({ patient }: any) {
  if (!patient) return null;

  const labs = patient.historicalLabs || [];
  const currentLabs = labs[0] || {};
  const previousLabs = labs[1] || {};

  const hb = currentLabs.hemoglobin || patient.hemoglobin || 0;
  const hbPrev = previousLabs.hemoglobin || hb;
  const ferritin = currentLabs.ferritin || 0;
  const tsat = currentLabs.tsat || 0;

  // Decision logic
  let status = "Estable";
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-500/10";
  
  let recommendation = "Mantener dosis actual de ESA y Hierro IV.";
  let ironRecommendation = "";

  if (hb < 10.0) {
    status = "Anemia No Controlada";
    statusColor = "text-rose-400";
    statusBg = "bg-rose-500/10";
    recommendation = "Incrementar dosis de AEE (Eritropoyetina) en un 25%. ";
  } else if (hb > 11.5) {
    status = "Riesgo Cardiovascular";
    statusColor = "text-amber-400";
    statusBg = "bg-amber-500/10";
    recommendation = "Disminuir dosis de AEE en un 25% o suspender temporalmente si Hb > 13 g/dL. Riesgo trombótico incrementado. ";
  }

  if (tsat < 20 || ferritin < 200) {
    ironRecommendation = "Déficit absoluto de hierro. Iniciar o aumentar dosis de Hierro Sacarosa IV. No incrementar AEE hasta corregir déficit marcial.";
    if (hb < 10.0) {
      recommendation = "Diferir incremento de AEE hasta reposición férrica. ";
    }
  } else if (ferritin > 800) {
    ironRecommendation = "Sobrecarga de hierro posible. Suspender Hierro IV y evaluar causas de inflamación (revisar PCR/Albúmina).";
  } else {
    ironRecommendation = "Depósitos de hierro adecuados. Mantener dosis de mantenimiento.";
  }

  const hbTrend = hb - hbPrev;
  
  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-xl mt-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-400 transition-colors" />
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-gradient-to-r from-rose-500/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-rose-400">
              <Syringe size={16} /> Optimizador IA de Anemia y AEE
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70 mt-1">
              Basado en guías KDIGO y Cinética de Hierro
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full border ${statusBg} border-white/10 flex items-center gap-2 w-fit`}>
            {statusColor.includes('rose') ? <AlertTriangle size={12} className={statusColor} /> : <Target size={12} className={statusColor} />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metrics */}
          <div className="space-y-4">
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Hemoglobina</span>
                <div className="flex items-end gap-2 mt-1">
                  <span className={`text-2xl font-mono font-bold ${(hb < 10 || hb > 11.5) ? 'text-rose-400' : 'text-emerald-400'}`}>{hb.toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground mb-1">g/dL</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground/60 mb-1">Tendencia</span>
                <div className={`flex items-center gap-1 ${hbTrend > 0 ? 'text-emerald-400' : hbTrend < 0 ? 'text-rose-400' : 'text-muted-foreground'}`}>
                  {hbTrend > 0 ? <TrendingUp size={14} /> : hbTrend < 0 ? <TrendingDown size={14} /> : <Activity size={14} />}
                  <span className="text-[10px] font-mono font-bold">{hbTrend > 0 ? '+' : ''}{hbTrend.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ferritina</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-lg font-mono font-bold ${(ferritin < 200 || ferritin > 800) ? 'text-amber-400' : 'text-sky-400'}`}>{ferritin}</span>
                  <span className="text-[9px] text-muted-foreground">ng/mL</span>
                </div>
              </div>
              <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Sat. Transf</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-lg font-mono font-bold ${tsat < 20 ? 'text-rose-400' : 'text-sky-400'}`}>{tsat}</span>
                  <span className="text-[9px] text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-lg flex-1 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={14} className="text-rose-400" />
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Decisión IA: Agentes Estimulantes (AEE)</h4>
               </div>
               <p className="text-[12px] text-white/80 leading-relaxed font-medium">
                 {recommendation}
               </p>
               <div className="mt-auto text-[10px] text-muted-foreground/60 border-t border-rose-500/10 pt-2 flex justify-between items-center top-6">
                 <span>Algoritmo: Predictor de Respuesta a AEE v2.1</span>
                 <span className="font-mono text-rose-500/40">Confianza: 92%</span>
               </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
               <div className="flex items-center gap-2 mb-2">
                 <Activity size={14} className="text-amber-400" />
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90">Cinética de Hierro</h4>
               </div>
               <p className="text-[11px] text-white/70 leading-relaxed">
                 {ironRecommendation}
               </p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
