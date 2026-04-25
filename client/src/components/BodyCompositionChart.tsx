import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend, PolarRadiusAxis } from "recharts";
import { Activity } from "lucide-react";

export function BodyCompositionChart({ patient, lastReading }: any) {
  const ufRemoved = lastReading?.ufRemoved || 0;

  // Data aligned with the Bioimpedance phenotype module
  // Percentages calculated as (Actual / Ideal) * 100 to show distribution vs norm
  const initialECW = 16.5;
  const currentECW = Math.max(0, initialECW - ufRemoved).toFixed(2);
  const ecwPct = Math.round((Number(currentECW) / 14.5) * 100);

  const data = [
    { name: 'ECW (Agua Extracelular)', pct: ecwPct, rawValue: currentECW, ideal: '14.5 L', fill: '#38bdf8', unit: 'L' },
    { name: 'ATM (Masa Grasa)', pct: 105, rawValue: 18.5, ideal: '17.6 kg', fill: '#f97316', unit: 'kg' },
    { name: 'ICW (Agua Intracelular)', pct: 98, rawValue: 22.1, ideal: '22.5 L', fill: '#818cf8', unit: 'L' },
    { name: 'LTM (Masa Magra)', pct: 88, rawValue: 35.2, ideal: '40.0 kg', fill: '#fbbf24', unit: 'kg' },
  ];

  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl mt-4 overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <div className="space-y-1">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-white">
            <Activity size={16} className="text-emerald-400" /> Composición Corporal y Distribución de Líquidos (Dinámico)
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
            Comparativa radial ajustada vs valores ideales ({ufRemoved > 0 ? `-${ufRemoved.toFixed(2)}L UF aplicados` : '100% = referencial'})
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="h-[280px] w-full md:col-span-2 -ml-6 md:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="100%" 
                barSize={16} 
                data={data}
                startAngle={180}
                endAngle={-180}
              >
                <PolarRadiusAxis type="number" domain={[0, 120]} tick={false} axisLine={false} />
                <RadialBar
                  background={{ fill: '#1a1a1a' }}
                  dataKey="pct"
                  cornerRadius={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { name, rawValue, ideal, unit, pct } = payload[0].payload;
                      return (
                        <div className="bg-[#111] border border-white/10 p-4 rounded-lg shadow-xl outline-none">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{name}</p>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-xl font-mono font-bold text-white leading-none">{rawValue} {unit}</span>
                            <span className="text-[10px] font-bold mb-0.5" style={{ color: payload[0].payload.fill }}>
                              ({pct}%)
                            </span>
                          </div>
                          <p className="text-[9px] uppercase tracking-widest text-emerald-400/80 mt-1.5">Ideal: {ideal}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Responsive legend wrapper for larger screens */}
                <Legend 
                  iconSize={10} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  wrapperStyle={{ 
                    right: '5%', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    lineHeight: '28px', 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    fontWeight: 'bold',
                  }} 
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4 md:border-l md:border-white/5 md:pl-6 hidden md:block">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">Análisis de Desviaciones</h4>
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg transition-colors p-3">
                <span className="block text-[9px] font-bold uppercase text-sky-400 tracking-wider mb-1">ECW ({ecwPct}%)</span>
                <span className="text-[10px] text-sky-300/80 leading-relaxed">
                  {ecwPct > 105 ? "Sobrecarga de volumen extracelular indicativa de congestión venosa persistente." : "Volumen extracelular acercándose al rango ideal por ultrafiltración intradiálisis."}
                </span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <span className="block text-[9px] font-bold uppercase text-amber-400 tracking-wider mb-1">↓ LTM (88%)</span>
                <span className="text-[10px] text-amber-300/80 leading-relaxed">Déficit de masa magra. Riesgo de sarcopenia y mayor inestabilidad hemodinámica.</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
