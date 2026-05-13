import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Thermometer, Droplets, ArrowRight, Check, Zap, Clock, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

export function DigitalTwinSimulator({ currentSbp, currentUfr, riskScore }: any) {
  const [simUfr, setSimUfr] = useState(currentUfr || 12.5);
  const [simTemp, setSimTemp] = useState(36.5);
  const [simTimeExtension, setSimTimeExtension] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Generate mock data for the simulation chart
  const currentRiskProb = Math.max(5, Math.min(99, riskScore + 20)); // Base risk representation
  
  // Simulation effect calculation
  const ufrReduction = currentUfr - simUfr;
  const tempReduction = 36.5 - simTemp;
  const timeExtImpact = simTimeExtension * 0.2;
  
  // The lower the UFR and Temp, the better the PAS projection and lower the risk
  const simRiskProb = Math.max(5, currentRiskProb - (ufrReduction * 5) - (tempReduction * 15) - timeExtImpact);
  const sbpImpact = (ufrReduction * 1.5) + (tempReduction * 4) + (simTimeExtension * 0.1);
  const projectedBaseSbp = Math.max(70, currentSbp - 15);
  const projectedSimSbp = Math.max(70, projectedBaseSbp + sbpImpact);

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const time = i * 10;
    const progress = i / 5;
    return {
      time: `+${time}m`,
      base: currentSbp - (currentSbp - projectedBaseSbp) * progress,
      simulated: currentSbp - (currentSbp - projectedSimSbp) * progress,
    };
  });

  return (
    <Card className="bg-background border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-border bg-indigo-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-400">
              <Cpu size={16} /> Gemelo Digital — Simulador de Intervenciones
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
              Proyección clara del impacto clínico de modificar UFR, Temp o Tiempo.
            </CardDescription>
          </div>
          <Badge className="bg-indigo-500 text-foreground border-none h-5 px-3 text-[9px] font-black uppercase tracking-widest leading-none">
            AI Activa
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
          
          {/* Controls Section */}
          <div className="p-6 lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Droplets size={14} className="text-sky-400" /> Tasa UF (mL/h)
                </label>
                <span className="text-[14px] font-mono font-bold text-sky-400">{simUfr.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0" max={currentUfr + 2} step="0.5" 
                value={simUfr}
                onChange={(e) => setSimUfr(parseFloat(e.target.value))}
                className="w-full accent-sky-500 bg-muted h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-bold">
                <span>0.0</span>
                <span>Act: {currentUfr.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Thermometer size={14} className="text-rose-400" /> Temp. Dializante (°C)
                </label>
                <span className="text-[14px] font-mono font-bold text-rose-400">{simTemp.toFixed(1)}°</span>
              </div>
              <input 
                type="range" 
                min="35.0" max="37.0" step="0.5" 
                value={simTemp}
                onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                className="w-full accent-rose-500 bg-muted h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-bold">
                <span>35.0°C</span>
                <span>37.0°C</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Clock size={14} className="text-amber-400" /> Tiempo Sesión (min)
                </label>
                <span className="text-[14px] font-mono font-bold text-amber-400">+{simTimeExtension}</span>
              </div>
              <input 
                type="range" 
                min="0" max="60" step="15" 
                value={simTimeExtension}
                onChange={(e) => setSimTimeExtension(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-muted h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-bold">
                <span>0 min</span>
                <span>+60 min</span>
              </div>
            </div>

            <Button 
              className="w-full h-10 mt-4 bg-indigo-600 hover:bg-indigo-500 text-foreground text-[10px] uppercase font-bold tracking-widest"
              onClick={() => setIsSimulating(true)}
            >
              <Zap size={14} className="mr-2" /> Calcular Proyección
            </Button>
          </div>

          {/* Visualization Section */}
          <div className="p-6 lg:col-span-3 bg-black/20 flex flex-col justify-between">
            {!isSimulating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4 py-8">
                <div className="w-16 h-16 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Cpu size={24} className="text-muted-foreground" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px]">Ajusta UF, Tiempo o Temperatura y descubre el impacto clínico al simular.</p>
              </div>
            ) : (
              <div className="space-y-6 h-full flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-rose-500/20 p-4 rounded-lg text-center space-y-1">
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Riesgo a 60 min (Base)</div>
                    <div className="text-2xl font-mono font-bold text-rose-500">{Math.round(currentRiskProb)}%</div>
                    <div className="text-[10px] font-bold text-rose-400">PAS ~{Math.round(projectedBaseSbp)}</div>
                  </div>
                  <div className="bg-card border border-emerald-500/20 p-4 rounded-lg text-center space-y-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5" />
                    <div className="text-[9px] uppercase font-bold text-emerald-500/70 tracking-widest relative z-10">Riesgo Simulado</div>
                    <div className="text-2xl font-mono font-bold text-emerald-500 relative z-10">{Math.round(simRiskProb)}%</div>
                    <div className="text-[10px] font-bold text-emerald-400 relative z-10">PAS ~{Math.round(projectedSimSbp)}</div>
                  </div>
                </div>

                <div className="mt-2 p-3 bg-blue-500/5 rounded-md border border-blue-500/20 text-xs leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <Info className="flex-shrink-0 mt-0.5 text-blue-400" size={14} />
                    <div className="text-muted-foreground">
                      <strong className="text-blue-400 uppercase text-[10px] tracking-wider block mb-1">Impacto de la Simulación:</strong>
                      Ajustar la UFR a <span className="text-sky-400 font-bold">{simUfr.toFixed(1)} mL/h</span>, 
                      la temperatura a <span className="text-rose-400 font-bold">{simTemp.toFixed(1)}° C</span> 
                      {simTimeExtension > 0 ? <span className="text-amber-400 font-bold"> y extender sesión {simTimeExtension} min</span> : ""} 
                      <span className="text-foreground"> previene la caída de presión (amortigua PAS en +{(projectedSimSbp - projectedBaseSbp).toFixed(1)} mmHg) y reduce el riesgo de IDHV un <span className="text-emerald-400 font-bold">{Math.round(currentRiskProb - simRiskProb)}%</span>.</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-[140px] mt-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.2} />
                      <XAxis dataKey="time" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                      <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Line 
                        type="monotone" 
                        dataKey="base" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeOpacity={0.5} 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="simulated" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ r: 3, fill: "#0a0a0a", stroke: "#10b981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="absolute bottom-0 right-0 flex items-center gap-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 border-t border-rose-500 border-dashed" /> Trayectoria Base</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-emerald-500" /> Nuevo Horizonte</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button variant="outline" className="flex-1 h-9 bg-transparent border-border text-[9px] uppercase font-bold tracking-widest hover:bg-muted/50" onClick={() => setIsSimulating(false)}>
                    Restablecer
                  </Button>
                  <Button className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-[9px] uppercase font-bold tracking-widest text-foreground">
                    <Check size={14} className="mr-1.5" /> Aplicar a Máquina
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
