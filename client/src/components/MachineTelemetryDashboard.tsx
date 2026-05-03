import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Activity, Droplet, Thermometer, Wind, AlertCircle, Box } from "lucide-react";

// Mock data generator for machine history
const generateMachineHistory = () => {
  const data = [];
  let vp = 140; // Venous pressure
  let ap = -120; // Arterial pressure
  let tmp = 100; // Transmembrane pressure
  let qb = 350; // Blood flow rate

  for (let i = 0; i < 40; i++) {
    vp += (Math.random() - 0.4) * 10;
    ap += (Math.random() - 0.6) * 5; 
    tmp += (Math.random() - 0.3) * 8;
    
    // Simulate a mild drop in Qb occasionally
    if (Math.random() > 0.9) qb -= 10;
    else if (qb < 350) qb += 5;

    data.push({
      minute: i * 5,
      vp: Math.round(vp),
      ap: Math.round(ap),
      tmp: Math.round(tmp),
      qb: Math.round(qb)
    });
  }
  return data;
};

export function MachineTelemetryDashboard({ patient }: { patient: any }) {
  const data = generateMachineHistory();
  const current = data[data.length - 1];

  const filters = ["FX CorDiax 80", "Revaclear 400", "Elisio 15H", "Optiflux 160NR", "Polyflux 170H", "Sureflux 190E"];
  const patientFilter = patient ? filters[patient.id % filters.length] : "FX CorDiax 80";
  
  // Base surface area on the filter type index roughly 
  const surfaceAreas = ["1.8 m²", "1.7 m²", "1.5 m²", "1.6 m²", "1.7 m²", "1.9 m²"];
  const filterSurface = patient ? surfaceAreas[patient.id % surfaceAreas.length] : "1.8 m²";

  const kofAreas = ["60 ml/h/mmHg", "55 ml/h/mmHg", "45 ml/h/mmHg", "51 ml/h/mmHg", "58 ml/h/mmHg", "64 ml/h/mmHg"];
  const filterKuf = patient ? kofAreas[patient.id % kofAreas.length] : "60 ml/h/mmHg";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Qb */}
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Droplet size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Flujo Sangre (Qb)</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">{current.qb}</span>
                <span className="text-xs text-muted-foreground mr-2">ml/min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VP */}
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Presión Venosa</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">{current.vp}</span>
                <span className="text-xs text-muted-foreground">mmHg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AP */}
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Wind size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Presión Arterial</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">{current.ap}</span>
                <span className="text-xs text-muted-foreground">mmHg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TMP */}
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">P. Transmembrana</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">{current.tmp}</span>
                <span className="text-xs text-muted-foreground">mmHg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0a0a0a] border-white/5">
        <CardHeader className="pb-2 border-b border-white/5">
          <CardTitle className="text-xs focus:outline-none font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity size={14} /> Dinámica de Presiones y Flujo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTmp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.4} />
                  <XAxis 
                  dataKey="minute" 
                  stroke="#666" 
                  fontSize={10} 
                  tickFormatter={(val) => `${val}m`}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="vp" name="P. Venosa (mmHg)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorVp)" />
                <Area type="monotone" dataKey="tmp" name="PTM (mmHg)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTmp)" />
                <Area type="monotone" dataKey="ap" name="P. Arterial (mmHg)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorAp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-4 border border-rose-500/20 bg-rose-500/5 rounded-lg flex gap-3">
            <AlertCircle size={18} className="text-rose-500 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Análisis de Integridad</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                PTM estable indicando permeabilidad del dializador conservada. La presión arterial extrayendo de la fístula se mantiene en rango (&gt;-150 mmHg). No hay indicios de coagulación del circuito.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-[#0a0a0a] border-primary/20 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Box size={80} />
          </div>
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-[10px] uppercase font-bold text-primary tracking-widest text-center flex items-center justify-center gap-1">
              <Box size={12} /> Filtro / Membrana
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 relative">
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Modelo</span>
                <span className="text-sm font-bold text-white">{patientFilter}</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
               <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Superficie</span>
                  <span className="text-sm font-mono font-bold text-white">{filterSurface}</span>
               </div>
               <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">KUF</span>
                  <span className="text-xs font-mono font-bold text-white">{filterKuf}</span>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">Dializado</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Flujo (Qd)</span>
                <span className="text-sm font-mono font-bold text-white">500 <span className="text-[10px] text-muted-foreground ml-1">ml/min</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Sodio</span>
                <span className="text-sm font-mono font-bold text-sky-400">138 <span className="text-[10px] text-muted-foreground ml-1">mEq/L</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Bicarbonato</span>
                <span className="text-sm font-mono font-bold text-emerald-400">32 <span className="text-[10px] text-muted-foreground ml-1">mEq/L</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Temperatura</span>
                <span className="text-sm font-mono font-bold text-rose-400">36.0 <span className="text-[10px] text-muted-foreground ml-1">°C</span></span>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">Anticoagulación & Límites</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Heparina</span>
                <span className="text-sm font-mono font-bold text-white">1000 <span className="text-[10px] text-muted-foreground ml-1">UI (B)</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Mant.</span>
                <span className="text-sm font-mono font-bold text-white">500 <span className="text-[10px] text-muted-foreground ml-1">UI/h</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Lim VP</span>
                <span className="text-sm font-mono font-bold text-sky-500/50">250 <span className="text-[10px] text-muted-foreground ml-1">mmHg</span></span>
             </div>
             <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-1 uppercase">Lim PTM</span>
                <span className="text-sm font-mono font-bold text-amber-500/50">300 <span className="text-[10px] text-muted-foreground ml-1">mmHg</span></span>
             </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0a0a] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">Historial de Máquina</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
             <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Horas de Uso</span>
                <span className="text-sm font-mono font-bold text-white">{(12500 + (patient?.id || 0) * 123).toLocaleString()} <span className="text-[10px] text-muted-foreground">h</span></span>
             </div>
             <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Último Mantenimiento</span>
                <span className="text-xs font-mono text-emerald-400">Hace 12 días</span>
             </div>
             <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="block text-[10px] text-muted-foreground font-bold tracking-widest mb-2 uppercase">Pacientes Compartidos</span>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">MR</div>
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold">JL</div>
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">AP</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
