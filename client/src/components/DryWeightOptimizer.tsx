import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Droplets, Target, Activity, HeartPulse, Stethoscope, AlertTriangle, ArrowRight, CheckCircle2, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine } from "recharts";
import { useMemo } from "react";

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

  // Simulate longitudinal BI data to show the AI learning process
  const hasIdhtHistory = patient.idhtEpisodes > 1;
  const muscleLoss = patient.albumin < 3.5; // marker of malnutrition/inflammation
  
  const historicalBIA = useMemo(() => Array.from({ length: 6 }).map((_, i) => {
    // 6 months of data
    const month = `M-${5 - i}`;
    // If muscle loss, ICW decreases, so ECW/ICW ratio increases. 
    // Normal ECW/ICW is ~0.74. Let's make it drift up if there is muscle loss.
    const baseEcwIcw = 0.78;
    const ecwIcw = muscleLoss ? baseEcwIcw + (i * 0.02) : baseEcwIcw + (Math.random() * 0.02 - 0.01);
    
    // BNP might be normal if they are losing weight and we are aggressively removing fluid, leading to IDHT
    const bnp = isHtn ? 400 - (i * 10) : 120 + (Math.random() * 20);
    
    // Hypotension episodes
    const idht = hasIdhtHistory ? (i > 3 ? 2 : 0) : 0;
    
    // Dry weight tracked
    const dw = currentDryWeight + (5 - i) * (muscleLoss ? 0.3 : 0);

    return {
      month,
      ecwIcw: Number(ecwIcw.toFixed(2)),
      bnp: Math.round(bnp),
      idht,
      dw: Number(dw.toFixed(1))
    };
  }), [muscleLoss, isHtn, hasIdhtHistory, currentDryWeight]);

  const currentEcwIcw = historicalBIA[5].ecwIcw;
  const ohLiters = isHtn ? 2.4 : (currentEcwIcw > 0.8 ? 1.8 : 0.8);
  const isCongested = ohLiters > 1.5;

  let recommendation = "";
  let proposedDryWeight = currentDryWeight;
  let status = "Normovolemia";
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-500/10";
  let statusBorder = "border-emerald-500/20";
  let icon = <CheckCircle2 size={12} className="text-emerald-400" />;
  let aiInsight = "El gemelo no detecta discrepancias estructurales recientes.";
  
  if (muscleLoss && hasIdhtHistory) {
    proposedDryWeight += 0.5;
    recommendation = "Detección de aumento en ratio ECW/ICW asociado a episodios de hipotensión (IDHT) recientes y NT-proBNP estable. El gemelo digital infiere pérdida de masa celular (sarcopenia/desnutrición), no hiperhidratación real.";
    status = "Pérdida de Masa Magra (Sarcopenia)";
    statusColor = "text-amber-400";
    statusBg = "bg-amber-500/10";
    statusBorder = "border-amber-500/20";
    icon = <AlertTriangle size={12} className="text-amber-400" />;
    aiInsight = "🚨 Calibración Crítica: El peso seco debe AUMENTARSE a pesar de apariencia de edema. La caída de ICW engaña la medición de Volemia. Evitar ultrafiltración agresiva.";
  } else if (isCongested && (isHtn || hasCardiacRisk)) {
    proposedDryWeight -= 0.5;
    recommendation = "Evidencia de sobrecarga cruzada (NT-proBNP elevado) + Bioimpedancia (OH > 1.5L) sin hipotensiones intradialíticas recientes. Bajar peso seco.";
    status = "Hiperhidratación Silente";
    statusColor = "text-rose-400";
    statusBg = "bg-rose-500/10";
    statusBorder = "border-rose-500/20";
    icon = <AlertTriangle size={12} className="text-rose-400" />;
    aiInsight = "🧠 Gemelo Predictivo: Tolerancia hemodinámica conservada. Se sugiere prueba de descenso de -0.5kg seguro estructurado.";
  } else {
    recommendation = "Paciente en " + status + ". Ratio ECW/ICW estable y biomarcadores en rango. Mantener peso seco objetivo actual.";
  }

  // UFR prescription logic
  const timeLimit = patient.sessionDuration || 4;
  const ufRate = (idwg * 1000) / timeLimit / currentDryWeight; // ml/kg/h
  
  let ufProfileMode = "Perfil UF Constante/Lineal";
  let ufProfileReason = "Tasa de UF dentro de límites seguros (< 10 ml/kg/h).";
  let ufRateColor = "text-emerald-400";

  if (ufRate > 13) {
    ufProfileMode = "Perfil UF Descendente Step-Down + Extensión";
    ufProfileReason = "Precaución: UFR muy alta (> 13 ml/kg/h).";
    ufRateColor = "text-rose-400";
  } else if (ufRate > 10 || hasCardiacRisk) {
    ufProfileMode = "Perfil UF Descendente + Sodio Modelado";
    ufProfileReason = "Riesgo hemodinámico moderado/alto. Maximizar UF al inicio.";
    ufRateColor = "text-amber-400";
  }

  return (
    <Card className="bg-background border-border shadow-2xl mt-4 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity ${statusBg}`} />
      <CardHeader className={`py-4 px-6 border-b border-border bg-gradient-to-r from-sky-500/5 to-transparent`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sky-600 dark:text-sky-400">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          
          {/* Col 1: Dry Weight Prescription */}
          <div className="lg:col-span-4 p-6 space-y-6 bg-gradient-to-b from-transparent to-black/40">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Target size={14} className="text-emerald-600 dark:text-emerald-400 text-opacity-80" /> Análisis Integral
            </h4>

            <div className="flex items-center justify-between mt-2">
              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Peso Seco Actual</span>
                <span className="text-xl font-mono font-bold text-muted-foreground line-through decoration-rose-500/50">{currentDryWeight.toFixed(1)} kg</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-muted-foreground px-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1 text-sky-600 dark:text-sky-400">Objetivo AI</span>
                <ArrowRight size={20} className="text-sky-600/50 dark:text-sky-400/50" />
              </div>

              <div className="text-center">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Nuevo Objetivo</span>
                <span className={`text-3xl font-mono font-bold ${proposedDryWeight !== currentDryWeight ? "text-sky-600 dark:text-sky-400" : "text-emerald-600 dark:text-emerald-400"}`}>{proposedDryWeight.toFixed(1)} kg</span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${proposedDryWeight !== currentDryWeight ? "bg-sky-500/10 border-sky-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <div className="flex items-start gap-2">
                <Activity size={14} className={proposedDryWeight !== currentDryWeight ? "text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" : "text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"} />
                <p className={`text-[10px] font-medium leading-relaxed ${proposedDryWeight !== currentDryWeight ? "text-sky-700 dark:text-sky-300/90" : "text-emerald-700 dark:text-emerald-300/90"}`}>
                  <strong className="block uppercase tracking-wider mb-1 text-[8px] opacity-80">Racionalidad Clínica</strong>
                  {recommendation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-card p-3 rounded-md border border-border">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ganancia ID (IDWG)</span>
                <span className={`text-sm font-mono font-bold ${isHighIdwg ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>{idwgPercent.toFixed(1)}%</span>
              </div>
              <div className="bg-card p-3 rounded-md border border-border">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Bioimpedancia (OH)</span>
                <span className={`text-sm font-mono font-bold ${isCongested ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{ohLiters.toFixed(1)} L</span>
              </div>
            </div>
          </div>

          {/* Col 2: AI Longitudinal tracking */}
          <div className="lg:col-span-5 p-6 space-y-4 relative bg-background">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-2">
              <BrainCircuit size={14} className="text-purple-400 text-opacity-80" /> Gemelo Longitudinal BIA
            </h4>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest flex gap-4 mb-2">
              <span className="flex items-center gap-1 text-sky-400"><div className="w-2 h-2 rounded-full bg-sky-500" /> Ratio ECW/ICW</span>
              <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> NT-proBNP</span>
              <span className="flex items-center gap-1 text-rose-500"><div className="w-2 h-2 rounded-full bg-rose-500" /> Hipotensiones</span>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalBIA} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ffffff40" fontSize={9} tickLine={false} axisLine={false} domain={[0.7, 0.9]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={9} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff20', fontSize: '11px', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  {/* Hipotensiones / Eventos IDHT */}
                  <Area isAnimationActive={false} yAxisId="left" type="step" dataKey="idht" name="Eventos IDHT" fill="#f43f5e20" stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 4" />
                  
                  <Line isAnimationActive={false} yAxisId="right" type="monotone" dataKey="bnp" name="NT-proBNP (pg/mL)" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                  <Line isAnimationActive={false} yAxisId="left" type="monotone" dataKey="ecwIcw" name="Ratio ECW/ICW" stroke="#38bdf8" strokeWidth={3} dot={{r:4, fill:"#0ea5e9"}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`mt-2 p-3 text-[10px] leading-relaxed rounded-md border ${muscleLoss && hasIdhtHistory ? "bg-purple-900/10 border-purple-500/20 text-purple-300" : "bg-muted/50 border-border text-muted-foreground"}`}>
               {aiInsight}
            </div>
          </div>

          {/* Col 3: Dynamic UF Profiling */}
          <div className="lg:col-span-3 p-6 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Droplets size={14} className="text-cyan-400 text-opacity-80" /> Estrategia UF
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Tasa Calculada (UFR)</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-mono font-bold ${ufRateColor}`}>{ufRate.toFixed(1)}</span>
                  <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">mL/kg/h</span>
                </div>
              </div>

              <div className="bg-card p-3 rounded-lg border border-border relative overflow-hidden">
                <p className="text-[11px] font-bold text-foreground mb-1 leading-tight">{ufProfileMode}</p>
                <div className="text-[9px] text-muted-foreground leading-relaxed border-t border-border pt-1 mt-1">
                  {ufProfileReason}
                </div>
              </div>

              {ufProfileMode.includes("Step-Down") && (
                <div className="w-full h-12 flex items-end gap-1 px-1 opacity-80">
                  <div className="w-1/4 bg-cyan-500/80 rounded-t h-full" />
                  <div className="w-1/4 bg-cyan-500/60 rounded-t h-3/4" />
                  <div className="w-1/4 bg-cyan-500/40 rounded-t h-1/2" />
                  <div className="w-1/4 bg-cyan-500/20 rounded-t h-1/4" />
                </div>
              )}
              {ufProfileMode.includes("Lineal") && (
                <div className="w-full h-12 flex items-end gap-1 px-1 opacity-80">
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                  <div className="flex-1 bg-emerald-500/50 rounded-t h-1/2" />
                </div>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

