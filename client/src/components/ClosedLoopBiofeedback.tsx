import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cpu, RefreshCcw, Activity, Droplets, AlertTriangle, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

export function ClosedLoopBiofeedback({ patient, readings, lastReading }: any) {
  const [isBiofeedbackActive, setIsBiofeedbackActive] = useState(true);

  if (!readings || readings.length === 0) return null;

  // Simulate RBV (Relative Blood Volume %) and dynamic UFR adjustments
  const data = readings.slice(-40).map((r: any) => {
    // Simulate RBV drop: starts near 0, drops as UF is removed, recovering slightly if UFR drops
    const sessionDur = patient?.sessionDuration || 4;
    const idealDrop = - (r.minuteOfSession / (sessionDur * 60)) * 15; // Max -15% drop over session
    // Add stable noise based on minute to prevent jumpy charts on re-renders, but look realistic
    const noise = Math.sin(r.minuteOfSession * 0.1) * 1.5;
    const rbv = idealDrop + noise;

    // Simulate the Biofeedback algorithm:
    // If RBV drops below -12%, machine lowers UFR.
    const actualUfrRaw = Number(r.ufr || 0);
    let autoUfr = actualUfrRaw;
    if (isBiofeedbackActive) {
      if (rbv < -14) {
        autoUfr = Math.max(0, autoUfr - 8);
      } else if (rbv < -11) {
        autoUfr = Math.max(5, autoUfr - 3);
      } else if (rbv > -8 && autoUfr < 15) {
         autoUfr = Math.min(15, autoUfr + 1);
      }
    }

    return {
      minute: r.minuteOfSession || 0,
      rbv: Number(rbv.toFixed(1)) || 0,
      actualUfr: actualUfrRaw,
      optimizedUfr: Number(autoUfr.toFixed(1)) || 0,
    };
  });

  const latestData = data[data.length - 1];
  const rbvCritical = latestData.rbv < -12;

  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl mt-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-400">
              <Cpu size={16} /> Biofeedback de Volumen Sanguíneo (Lazo Cerrado)
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70 flex items-center gap-2">
              <RefreshCcw size={10} /> Control de UFR Dinámico guiado por Monitor de Volumen Sanguíneo (BVM)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-white/10 p-2 rounded-lg">
            <Switch 
              id="biofeedback-mode" 
              checked={isBiofeedbackActive} 
              onCheckedChange={setIsBiofeedbackActive}
              className="data-[state=checked]:bg-emerald-500"
            />
            <Label htmlFor="biofeedback-mode" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground mr-1">
              AUTO (Lazo Cerrado)
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
             <div className="bg-[#111] border border-white/5 p-4 rounded-lg flex flex-col items-center justify-center relative">
                {isBiofeedbackActive ? (
                  <ShieldCheck size={24} className="text-emerald-500 mb-2 absolute top-2 left-2 opacity-50" />
                ) : (
                  <AlertTriangle size={24} className="text-amber-500 mb-2 absolute top-2 left-2 opacity-50" />
                )}
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center mb-1">Volumen Sang. Relativo (RBV)</span>
                <span className={`text-4xl font-mono font-bold ${rbvCritical ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {latestData.rbv}%
                </span>
                <span className="text-[9px] font-bold uppercase text-muted-foreground mt-2 bg-white/5 px-2 py-1 rounded border border-white/10">Límite Crítico: -15%</span>
             </div>

             <div className={`p-4 rounded-lg flex justify-between items-center border ${isBiofeedbackActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
               <div>
                 <span className={`block text-[10px] font-bold uppercase tracking-widest ${isBiofeedbackActive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                   Tasa de Ultrafiltración
                 </span>
                 <span className="text-sm font-mono text-white/50 line-through mr-2">{isBiofeedbackActive ? latestData.actualUfr : ''}</span>
                 <span className="text-xl font-mono font-bold text-white transition-all">{isBiofeedbackActive ? latestData.optimizedUfr : latestData.actualUfr}</span>
                 <span className="text-[9px] text-muted-foreground ml-1 uppercase">mL/kg/h</span>
               </div>
               <Droplets size={20} className={isBiofeedbackActive ? "text-emerald-500" : "text-muted-foreground"} />
             </div>
             
             <div className="text-[9px] text-muted-foreground/60 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
                {isBiofeedbackActive ? 
                  "Sistema ajustando ultrafiltración en tiempo real (Feedback Loop) para mantener el RBV por encima del límite crítico de tolerancia del paciente." : 
                  "Biofeedback DESACTIVADO. El paciente está recibiendo tasa de UF fija. Riesgo incrementado de depleción brusca de volumen e hipotensión."
                }
             </div>
          </div>

          <div className="lg:col-span-3 h-[240px]">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.3} />
                  <XAxis dataKey="minute" stroke="#555" fontSize={9} tickFormatter={(v) => `${v}m`} />
                  
                  {/* Left Axis - RBV */}
                  <YAxis yAxisId="left" domain={[-20, 5]} stroke="#555" fontSize={9} tickFormatter={(v) => `${v}%`} />
                  {/* Right Axis - UFR */}
                  <YAxis yAxisId="right" orientation="right" domain={[0, 25]} hide />
                  
                  <ReferenceLine yAxisId="left" y={-15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Límite RBV (-15%)', fill: '#f59e0b', fontSize: 9, position: 'insideBottomLeft' }} />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#000]/90 border border-white/10 p-3 rounded shadow-xl">
                            <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2 mb-1">
                              <Activity size={10} /> Minuto {payload[0].payload.minute}
                            </div>
                            <div className="space-y-1">
                              <div className="text-[11px] font-bold text-white flex justify-between gap-4">
                                <span>RBV (%):</span>
                                <span className={(payload[0].value as number) < -12 ? "text-amber-500" : "text-emerald-400"}>{payload[0].value}%</span>
                              </div>
                              <div className="text-[11px] font-bold text-white flex justify-between gap-4">
                                <span>UFR Aplicada:</span>
                                <span className="text-sky-400">{payload[1]?.value} mL/kg/h</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rbv"
                    stroke="none"
                    fill="url(#colorRbv)"
                    fillOpacity={0.2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rbv"
                    stroke={rbvCritical ? "#f59e0b" : "#10b981"}
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  <Line
                    yAxisId="right"
                    type="stepAfter"
                    dataKey={isBiofeedbackActive ? "optimizedUfr" : "actualUfr"}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  
                  <defs>
                    <linearGradient id="colorRbv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={rbvCritical ? "#f59e0b" : "#10b981"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={rbvCritical ? "#f59e0b" : "#10b981"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
               </ComposedChart>
             </ResponsiveContainer>
             <div className="flex items-center justify-end gap-3 mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-400"></div>Volumen Relativo (RBV)</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 border-t border-dashed border-sky-400"></div>UFR Aplicada</div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
