import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import { Activity, AlertOctagon, ArrowDownRight, GitFork, Droplet, Clock } from "lucide-react";

export function VascularAccessDigitalTwin({ patient, lastReading }: any) {
  if (!patient) return null;

  // Generate simulated historical progression to show access deterioration
  const historicalSessions = Array.from({ length: 12 }).map((_, i) => {
    // Simulated progressive deterioration typical of venous stenosis
    const baseQa = patient.vascularAccessType === "Catéter" ? 350 : 1200;
    const dropQa = (i * (baseQa * 0.04)); // gradual reduction
    
    // Venous pressure rising slowly, then faster
    const baseVp = 130 + (i * 2.5) + (i > 8 ? (i - 8) * 10 : 0);
    // Arterial pressure becoming more negative
    const baseAp = -160 - (i * 3) - (i > 8 ? (i - 8) * 8 : 0);

    return {
      session: `S-${12 - i}`,
      vp: Math.round(baseVp + Math.random() * 15), // Presión Venosa (VP)
      ap: Math.round(baseAp - Math.random() * 10), // Presión Arterial Pre-Bomba (AP)
      qa: Math.max(200, Math.round(baseQa - dropQa - Math.random() * 50)), // Flujo real (Qa)
    };
  }).reverse(); // From oldest to newest (now)

  const currentQa = historicalSessions[historicalSessions.length - 1].qa;
  const currentVp = historicalSessions[historicalSessions.length - 1].vp;
  const currentAp = historicalSessions[historicalSessions.length - 1].ap;
  
  const isCvc = patient.vascularAccessType === "Catéter";
  const qaThreshold = isCvc ? 250 : 600;
  const inDanger = currentQa <= qaThreshold || currentVp > 220 || currentAp < -250;

  return (
    <Card className="bg-background border-border shadow-2xl mt-6">
      <CardHeader className="py-4 px-6 border-b border-border bg-gradient-to-r from-background to-transparent">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-[14px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 text-foreground">
              <GitFork className="text-sky-400" size={18} /> 
              Gemelo Predictivo del Acceso Vascular
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Monitoreo Evolutivo: Tendencia de AP, VP y Flujo Real (Qa)
            </CardDescription>
          </div>
          <Badge className={`h-6 px-3 text-[10px] font-bold uppercase tracking-widest ${inDanger ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"} border`}>
            {inDanger ? "ALTO RIESGO TROMBOSIS" : "ACCESO FUNCIONAL"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-2">
              Tendencia Hemodinámica Trans-Acceso (12 Sesiones)
            </h4>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalSessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="apGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="session" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} domain={[-300, 300]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff20', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <ReferenceLine yAxisId="left" y={200} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'VP Límite', fill: '#f43f5e', fontSize: 10 }} />
                  <ReferenceLine yAxisId="left" y={-250} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideBottomLeft', value: 'AP Límite', fill: '#3b82f6', fontSize: 10 }} />
                  
                  {/* Presión Venosa */}
                  <Area yAxisId="left" type="monotone" dataKey="vp" name="VP (mmHg)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#vpGrad)" />
                  {/* Presión Arterial */}
                  <Area yAxisId="left" type="monotone" dataKey="ap" name="AP (mmHg)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#apGrad)" />
                  
                  {/* Flujo Qa */}
                  <Line yAxisId="right" type="monotone" dataKey="qa" name="Flujo Qa (ml/min)" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: "#10b981" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 justify-center text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5 text-rose-400">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Presión Venosa (VP)
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> Presión Arterial Pre-Bomba (AP)
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Flujo Acceso Estimado (Qa)
              </div>
            </div>
          </div>
          
          {/* Analysis Sidebar */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 border-b border-border pb-2">
              Telemetría y Pronóstico
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border p-3 rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground z-10">AP Actual</span>
                <span className={`text-xl font-mono tracking-tighter z-10 ${currentAp < -250 ? 'text-rose-500' : 'text-foreground'}`}>{currentAp} <span className="text-[10px]">mmHg</span></span>
              </div>
              <div className="bg-card border border-border p-3 rounded-lg flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-xl" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground z-10">VP Actual</span>
                <span className={`text-xl font-mono tracking-tighter z-10 ${currentVp > 220 ? 'text-rose-500' : 'text-foreground'}`}>{currentVp} <span className="text-[10px]">mmHg</span></span>
              </div>
            </div>
            
            <div className={`bg-card border ${inDanger ? "border-rose-500/30" : "border-emerald-500/30"} p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden`}>
              <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none`}>
                <Droplet size={100} />
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className={inDanger ? "text-rose-400" : "text-emerald-400"} />
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Flujo Real del Acceso (Qa)</span>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-3xl font-mono font-bold leading-none tracking-tighter ${inDanger ? "text-rose-500" : "text-emerald-500"}`}>
                  {currentQa}
                </span>
                <span className="text-sm font-bold text-muted-foreground uppercase mb-1">ml/min</span>
              </div>
              
              {inDanger ? (
                <p className="text-[10px] leading-relaxed text-rose-300/80 mt-2">
                  <AlertOctagon size={12} className="inline mr-1 -mt-0.5" />
                  <strong>Depleción de Flujo:</strong> Caída sintomática de Qa coincidente con elevación de VP (&gt;200 mmHg) y succión arterial extrema. <br className="my-1"/>
                  Alto riesgo de <strong>Estenosis Venosa</strong> o formación inminente de trombo.
                </p>
              ) : (
                <p className="text-[10px] leading-relaxed text-emerald-300/80 mt-2">
                  Flujo del acceso dentro de umbrales seguros (&gt; {qaThreshold} ml/min). Perfil hemodinámico estable.
                </p>
              )}
            </div>
            
            <div className="mt-auto pt-2">
               <button className={`w-full py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-colors ${inDanger ? 'bg-rose-500 hover:bg-rose-600 text-foreground' : 'bg-muted/50 hover:bg-muted text-muted-foreground'}`}>
                 {inDanger ? "Solicitar Dopler / Fistulografía" : "Acceso Estable"}
               </button>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
