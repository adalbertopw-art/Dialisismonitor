import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Droplets, Target, Activity, HeartPulse, Stethoscope, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DryWeightOptimizer({ patient }: any) {
  if (!patient) return null;

  // Derive logical properties for demo
  const currentDryWeight = patient.dryWeight || 70.0;
  const isHtn = patient.historicalLabs?.[0]?.bnp > 250; 
  const hasCardiacRisk = !!patient.cardiopathy || !!patient.autonomicDysfunction;
  
  // Use Target UF as proxy for IDWG (since UF Target roughly = IDWG in stable patients)
  const idwg = patient.targetUfVolume || 2.5; 
  const idwgPercent = (idwg / currentDryWeight) * 100;
  const isHighIdwg = idwgPercent > 4.0;

  // Fake Bioimpedance OH (Overhydration) derived from risk profile
  const ohLiters = isHtn ? 2.4 : (hasCardiacRisk ? 1.8 : 0.8);
  const isCongested = ohLiters > 1.5;

  let recommendation = "";
  let proposedDryWeight = currentDryWeight;
  let status = "Normovolemia";
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-500/10";
  let statusBorder = "border-emerald-500/20";
  let icon = <CheckCircle2 size={12} className="text-emerald-400" />;
  
  if (isCongested && (isHtn || hasCardiacRisk)) {
    proposedDryWeight -= 0.5;
    recommendation = "Evidencia clínica de sobrecarga (BNP elevado, HTN crónica) + Bioimpedancia (OH > 1.5L). Bajar peso seco de forma gradual y reevaluar.";
    status = "Hiperhidratación Silente";
    statusColor = "text-rose-400";
    statusBg = "bg-rose-500/10";
    statusBorder = "border-rose-500/20";
    icon = <AlertTriangle size={12} className="text-rose-400" />;
  } else if (patient.hidEpisodes > 0 && ohLiters < 1.0) {
    proposedDryWeight += 0.5;
    recommendation = "Intolerancia hemodinámica (Episodios HID) + BCM Normovolemia. Evitar infra-hidratación. Evaluar aumentar peso seco (probablemente aumentó masa magra/grasa).";
    status = "Riesgo Infra-Hidratación";
    statusColor = "text-amber-400";
    statusBg = "bg-amber-500/10";
    statusBorder = "border-amber-500/20";
    icon = <AlertTriangle size={12} className="text-amber-400" />;
  } else {
    recommendation = "Paciente asintomático. Mantener peso seco objetivo actual y continuar monitoreo BCM mensual.";
  }

  // UFR prescription logic
  const timeLimit = patient.sessionDuration || 4;
  const ufRate = (idwg * 1000) / timeLimit / currentDryWeight; // ml/kg/h
  
  let ufProfileMode = "Perfil UF Constante/Lineal";
  let ufProfileReason = "Tasa de UF dentro de límites seguros (< 10 ml/kg/h) con hemodinamia estable.";
  let ufRateColor = "text-emerald-400";

  if (ufRate > 13) {
    ufProfileMode = "Perfil UF Descendente Step-Down + Extensión Tiempo";
    ufProfileReason = "Precaución: UFR muy alta (> 13 ml/kg/h). Se sugiere perfil UF decreciente y considerar extender la sesión 30 min para proteger miocardio aturdido.";
    ufRateColor = "text-rose-400";
  } else if (ufRate > 10 || hasCardiacRisk) {
    ufProfileMode = "Perfil UF Descendente + Sodio Modelado";
    ufProfileReason = "Riesgo hemodinámico moderado/alto (Cardiopatía o UFR > 10 ml/kg/h). Maximizar UF en primera mitad de la terapia para aprovechar el refilling capilar intacto.";
    ufRateColor = "text-amber-400";
  }

  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl mt-4 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity ${statusBg}`} />
      <CardHeader className={`py-4 px-6 border-b border-white/5 bg-gradient-to-r from-sky-500/5 to-transparent`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sky-400">
              <Scale size={16} /> Sistema Prescriptivo de Peso Seco (AI)
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70 flex items-center gap-2 mt-1">
              <Stethoscope size={10} /> Integración Bioimpedanciometría, IDWG y Hemodinámica
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded border ${statusBg} ${statusBorder} flex items-center gap-2`}>
            {icon}
            <span className={`text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
          
          {/* Col 1: Dry Weight Prescription */}
          <div className="p-6 space-y-6 bg-gradient-to-b from-transparent to-black/40">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Target size={14} className="text-emerald-400 text-opacity-80" /> Análisis Integral de Volemia
            </h4>

            <div className="flex items-center justify-between mt-2">
              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Peso Seco Actual</span>
                <span className="text-xl font-mono font-bold text-white/50 line-through decoration-rose-500/50">{currentDryWeight.toFixed(1)} kg</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-muted-foreground px-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1 text-sky-400">Prescripción AI</span>
                <ArrowRight size={20} className="text-sky-400/50" />
              </div>

              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Nuevo Objetivo</span>
                <span className={`text-3xl font-mono font-bold ${proposedDryWeight !== currentDryWeight ? "text-sky-400" : "text-emerald-400"}`}>{proposedDryWeight.toFixed(1)} kg</span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${proposedDryWeight !== currentDryWeight ? "bg-sky-500/10 border-sky-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <div className="flex items-start gap-2">
                <Activity size={14} className={proposedDryWeight !== currentDryWeight ? "text-sky-400 shrink-0 mt-0.5" : "text-emerald-400 shrink-0 mt-0.5"} />
                <p className={`text-[10px] font-medium leading-relaxed ${proposedDryWeight !== currentDryWeight ? "text-sky-300/90" : "text-emerald-300/90"}`}>
                  <strong className="block uppercase tracking-wider mb-1 text-[8px] opacity-80">Racionalidad Clínica</strong>
                  {recommendation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#111] p-3 rounded-md border border-white/5">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ganancia ID (IDWG)</span>
                <span className={`text-sm font-mono font-bold ${isHighIdwg ? "text-rose-400" : "text-emerald-400"}`}>{idwgPercent.toFixed(1)}%</span>
                <span className="text-[10px] text-muted-foreground ml-1">({idwg} L)</span>
              </div>
              <div className="bg-[#111] p-3 rounded-md border border-white/5">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Bioimpedancia (OH)</span>
                <span className={`text-sm font-mono font-bold ${isCongested ? "text-amber-400" : "text-emerald-400"}`}>{ohLiters.toFixed(1)} L</span>
                <span className="text-[10px] text-muted-foreground ml-1">(aprox)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Dynamic UF Profiling */}
          <div className="p-6 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Droplets size={14} className="text-sky-400 text-opacity-80" /> Perfilado Dinámico de Ultrafiltración
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Tasa UF Calculada (UFR)</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-mono font-bold ${ufRateColor}`}>{ufRate.toFixed(1)}</span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">mL/kg/h</span>
                </div>
              </div>

              <div className="bg-[#111] p-4 rounded-lg border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                  <Activity size={48} className="text-sky-400" />
                </div>
                
                <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Estrategia Recomendada</span>
                <p className="text-sm font-bold text-white/90 mb-2 leading-tight">{ufProfileMode}</p>
                <div className="text-[10px] text-muted-foreground leading-relaxed border-t border-white/5 pt-2 mt-2">
                  {ufProfileReason}
                </div>
              </div>

              {ufProfileMode.includes("Step-Down") && (
                <div className="w-full h-16 flex items-end gap-1 px-2 opacity-80">
                  <div className="w-1/4 bg-sky-500/80 rounded-t h-full hover:bg-sky-400 transition-colors cursor-help" title="Hora 1: Mayor Refilling Capilar" />
                  <div className="w-1/4 bg-sky-500/60 rounded-t h-3/4 hover:bg-sky-400 transition-colors cursor-help" title="Hora 2: Descenso Progresivo" />
                  <div className="w-1/4 bg-sky-500/40 rounded-t h-1/2 hover:bg-sky-400 transition-colors cursor-help" title="Hora 3: Protección Hemodinámica" />
                  <div className="w-1/4 bg-sky-500/20 rounded-t h-1/4 hover:bg-sky-400 transition-colors cursor-help" title="Hora 4: Estabilización" />
                </div>
              )}
              {ufProfileMode.includes("Lineal") && (
                <div className="w-full h-16 flex items-end gap-1 px-2 opacity-80">
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                </div>
              )}
              
              <div className="flex justify-between px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                <span>1H</span>
                <span>2H</span>
                <span>3H</span>
                <span>4H</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
