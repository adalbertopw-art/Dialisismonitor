import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplets, Target, User, HeartPulse, Scale, AlertTriangle } from "lucide-react";

export function BioimpedancePhenotype({ patient, lastReading }: any) {
  const ufRemoved = lastReading?.ufRemoved || 0;

  // Mock BCM and phenotypic data for the demo
  const initialData = {
    overhydration: 2.4, // Liters
    ltm: 35.2, // Lean Tissue Mass (kg)
    atm: 18.5, // Adipose Tissue Mass (kg)
    ecw: 16.5, // Extracellular Water (L)
    icw: 22.1, // Intracellular Water (L)
    tbw: 38.6, // Total Body Water (L)
  };

  const currentOH = Math.max(0, initialData.overhydration - ufRemoved).toFixed(2);
  const currentECW = (initialData.ecw - ufRemoved).toFixed(2);
  const currentTBW = (initialData.tbw - ufRemoved).toFixed(2);
  const dryWeight = patient?.dryWeight ?? 68.5;
  const currentWeight = (dryWeight + initialData.overhydration - ufRemoved).toFixed(1);

  let phenotype = "Mixto (Cardiovascular + Depleción de Volumen)";
  let ohStatus = "Alto riesgo de congestión";
  let ohColor = "text-sky-400";
  let ohBg = "bg-sky-500/10 border-sky-500/20";
  
  if (parseFloat(currentOH) < 0.5) {
    ohStatus = "Normohidratación alcanzada";
    ohColor = "text-emerald-400";
    ohBg = "bg-emerald-500/10 border-emerald-500/20";
  } else if (parseFloat(currentOH) < 1.5) {
    ohStatus = "Sobrecarga leve a moderada";
    ohColor = "text-amber-400";
    ohBg = "bg-amber-500/10 border-amber-500/20";
  }

  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl overflow-hidden mt-4">
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-400">
              <Activity size={16} /> Fenotipado Clínico e Hidratación Dinámica (BCM)
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
              Evaluación estructural ajustada en tiempo real según UF Removida ({ufRemoved.toFixed(2)} L)
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 h-5 px-2 text-[9px] font-bold uppercase tracking-widest">
            {phenotype}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Overhydration (OH) */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Droplets size={12} className={ohColor} /> Sobrehidratación (OH) Dinámica
            </h4>
            <div className="bg-[#111] border border-white/5 p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-white">
                <Droplets size={48} />
              </div>
              <span className={`text-3xl font-mono font-bold ${ohColor} transition-colors duration-500`}>
                {currentOH}<span className="text-lg text-muted-foreground ml-1">L</span>
              </span>
              <div className="flex justify-between w-full mt-2 pt-2 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Inicial: {initialData.overhydration} L</span>
                <span>UF: -{ufRemoved.toFixed(2)} L</span>
              </div>
            </div>
            
            <div className={`${ohBg} p-3 rounded text-[10px] ${ohColor} font-medium transition-colors duration-500`}>
              {ohStatus}. El paciente presenta un compartimento extracelular dinámico.
            </div>
          </div>

          {/* Body Composition */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User size={12} className="text-amber-400" /> Composición Corporal (Fija)
            </h4>
            <div className="bg-[#111] border border-white/5 rounded-lg p-4 space-y-4">
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                   <span>LTM (Masa Magra)</span>
                   <span className="text-foreground">{initialData.ltm} kg</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 w-[60%]" />
                 </div>
               </div>

               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                   <span>ATM (Masa Grasa)</span>
                   <span className="text-foreground">{initialData.atm} kg</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-[30%]" />
                 </div>
               </div>
            </div>
          </div>

          {/* Fluid Distribution */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity size={12} className="text-indigo-400" /> Distribución de Líquidos (Total)
            </h4>
            <div className="bg-[#111] border border-white/5 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ECW (Extracel.)</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-sky-400">{currentECW} L</span>
                  <span className="block text-[8px] text-muted-foreground/60 line-through">{initialData.ecw} L</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ICW (Intracel.)</span>
                <span className="text-sm font-mono font-bold text-indigo-400">{initialData.icw} L</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Total (TBW)</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-white">{currentTBW} L</span>
                  <span className="block text-[8px] text-muted-foreground/60 line-through">{initialData.tbw} L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Target size={12} className="text-rose-400" /> Impacto y Metas
            </h4>
            <div className="space-y-3 flex flex-col h-full">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-3">
                <Scale className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Peso Actual Estimado</span>
                  <span className="block text-sm font-mono font-bold text-emerald-100">{currentWeight} kg</span>
                  <span className="block text-[9px] text-emerald-300/80">Meta Seca: {patient?.dryWeight || 68.5} kg</span>
                </div>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3 flex-1">
                <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={14} />
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-amber-400 tracking-wider">Refilling Capilar</span>
                  <span className="block text-[9px] text-amber-300/80 leading-relaxed">
                    Evaluación de relleno vascular dinámico ajustado al descenso de ECW en tiempo real.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <div className="mt-6 flex justify-between items-center text-[9px] uppercase font-bold text-muted-foreground tracking-widest border-t border-white/5 pt-4">
          <span className="flex items-center gap-2">
            <HeartPulse size={12} className="text-emerald-500" />
            Monitoreo Continuo Integrado (BIA Dinámico)
          </span>
          <span>Actualizado al min. {lastReading?.minuteOfSession || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
