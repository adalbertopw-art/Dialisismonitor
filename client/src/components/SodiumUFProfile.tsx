import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from "recharts";
import { FlaskConical, Droplet, Activity, TestTube2, AlertTriangle, Syringe } from "lucide-react";
import { useMemo } from "react";

export function SodiumUFProfile({ patient, sessionDurationParams = 4, currentMinute = 0 }: any) {
  // Generate a mock UF/Na profile for the duration
  // Duration typically 4 hours (240 mins). Let's do 10-min increments.
  const maxMins = sessionDurationParams * 60;
  
  const profileData = useMemo(() => {
    const data = [];
    
    for (let i = 0; i <= maxMins; i += 10) {
      let ufRate = 0;
      let naConc = 0;

      // Profile type: Step-down UF, Linear-down Na (Simulated logic based on low Albumin / low initial Na)
      if (i < 60) {
        ufRate = 1200;
        naConc = 144 - (i / 60) * 1; // 144 to 143
      } else if (i < 120) {
        ufRate = 1000;
        naConc = 143 - ((i - 60) / 60) * 2; // 143 to 141
      } else if (i < 180) {
        ufRate = 800;
        naConc = 141 - ((i - 120) / 60) * 1; // 141 to 140
      } else {
        ufRate = 400;
        naConc = 140 - ((i - 180) / (maxMins - 180)) * 2; // 140 to 138
      }

      data.push({
        minute: i,
        ufRate,
        naConc: Number(naConc.toFixed(1))
      });
    }
    return data;
  }, [sessionDurationParams]);

  // Simulated labs for context
  const labs = [
    { name: "Sodio Sérico (Na)", value: "135", unit: "mEq/L", range: "136 - 145", status: "Límite Bajo", color: "text-amber-400" },
    { name: "Albúmina", value: "3.2", unit: "g/dL", range: "3.5 - 5.0", status: "Bajo (Hipoalbuminemia)", color: "text-rose-400" },
    { name: "Potasio (K)", value: "5.1", unit: "mEq/L", range: "3.5 - 5.1", status: "Normal-Alto", color: "text-emerald-400" },
    { name: "Hematocrito", value: "31", unit: "%", range: "36 - 50", status: "Anemia Mod.", color: "text-amber-400" },
  ];

  return (
    <Card className="bg-background border-border shadow-2xl mt-4 overflow-hidden relative">
      <CardHeader className="py-4 px-6 border-b border-border bg-gradient-to-r from-purple-500/10 to-transparent">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-purple-400">
              <TestTube2 size={16} /> Fusión Diálisis-Lab: Perfiles de Sodio y UF
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70 flex items-center gap-2">
              <Activity size={10} /> Prescripción Dinámica guiada por analíticas (Perfil Na + UF Descendente)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Lab Integration Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 flex items-center gap-1.5">
              <FlaskConical size={12} className="text-amber-400" /> Analítica Pre-HD Reciente
            </h4>
            
            <div className="space-y-2">
              {labs.map((lab, i) => (
                <div key={i} className="bg-card p-3 rounded-lg border border-border flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">{lab.name}</span>
                    <span className={`font-mono font-bold ${lab.color}`}>{lab.value} <span className="text-[8px] text-muted-foreground">{lab.unit}</span></span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] uppercase text-muted-foreground tracking-widest">
                    <span>Val. Ref: {lab.range}</span>
                    <span className={`${lab.color} opacity-80`}>{lab.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg flex gap-3 mt-4">
              <AlertTriangle className="text-purple-400 shrink-0 mt-0.5" size={14} />
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold uppercase text-purple-300 tracking-wider">Ajuste Predictivo Aplicado</span>
                <p className="text-[10px] text-purple-300/80 leading-relaxed font-medium">
                  Hipoalbuminemia ({labs[1].value}) + Na límite ({labs[0].value}) detectados. 
                  Se activó <strong className="text-purple-400">Perfil Na Descendente (144→138)</strong> combinado con <strong className="text-purple-400">Perfil UF Step-Down</strong> para maximizar el refilling capilar en las primeras 2 horas y prevenir hipotensión tardía.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Profile Area */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Proyección de Tratamiento (Na / UFR)</h4>
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-sky-500"></div>Tasa UF (mL/h)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 border-t-2 border-purple-400"></div>Na Dializado (mEq/L)</div>
              </div>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profileData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.3} />
                  <XAxis dataKey="minute" stroke="#555" fontSize={9} tickFormatter={(v) => `${v}m`} />
                  
                  {/* Left Axis - UF Rate */}
                  <YAxis yAxisId="left" domain={[0, 1500]} stroke="#555" fontSize={9} tickFormatter={(v) => `${v}`} />
                  {/* Right Axis - Na Dialysate */}
                  <YAxis yAxisId="right" orientation="right" domain={[135, 145]} stroke="#555" fontSize={9} tickFormatter={(v) => `${v}`} />
                  
                  <ReferenceLine x={currentMinute} yAxisId="left" stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Actual', position: 'top', fill: '#10b981', fontSize: 9 }} />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background/90 border border-border p-3 rounded shadow-xl">
                            <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2 mb-2 pb-2 border-b border-border">
                              Minuto {payload[0].payload.minute} de {maxMins}
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-bold text-foreground flex justify-between gap-6 items-center">
                                <span className="flex items-center gap-1.5 text-sky-400"><Droplet size={12}/> Tasa UF:</span>
                                <span>{payload[0].value} <span className="text-[9px] text-muted-foreground">mL/h</span></span>
                              </div>
                              <div className="text-[11px] font-bold text-foreground flex justify-between gap-6 items-center">
                                <span className="flex items-center gap-1.5 text-purple-400"><Syringe size={12}/> Sodio (Na):</span>
                                <span>{payload[1]?.value} <span className="text-[9px] text-muted-foreground">mEq/L</span></span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Area
                    isAnimationActive={false}
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="ufRate"
                    stroke="none"
                    fill="url(#colorUf)"
                    fillOpacity={0.15}
                  />
                  <Line
                    isAnimationActive={false}
                    yAxisId="left"
                    type="stepAfter"
                    dataKey="ufRate"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  <Line
                    isAnimationActive={false}
                    yAxisId="right"
                    type="monotone"
                    dataKey="naConc"
                    stroke="#c084fc"
                    strokeWidth={3}
                    dot={false}
                  />
                  
                  <defs>
                    <linearGradient id="colorUf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center bg-card border border-border rounded-lg p-3">
               <div className="flex items-center gap-3">
                 <div className="bg-sky-500/10 p-2 rounded-full">
                   <Droplet size={16} className="text-sky-400" />
                 </div>
                 <div>
                   <span className="block text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Volumen Objetivo HD</span>
                   <span className="text-sm font-mono font-bold text-foreground">{patient?.targetUfVolume || 2.5} L</span>
                 </div>
               </div>
               
               <div className="h-6 w-px bg-muted" />
               
               <div className="flex items-center gap-3">
                 <div className="bg-purple-500/10 p-2 rounded-full">
                   <TestTube2 size={16} className="text-purple-400" />
                 </div>
                 <div>
                   <span className="block text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Acumulación de Sodio</span>
                   <span className="text-sm font-mono font-bold text-foreground">Neutral (Perfil Equilibrado)</span>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
