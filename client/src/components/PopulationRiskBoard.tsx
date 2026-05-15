import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Patient } from "@shared/types";
import { cn } from "@/lib/utils";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { AlertCircle, FileStack, Stethoscope, Users } from "lucide-react";
import { Link } from "wouter";

export function PopulationRiskBoard({ patients }: { patients: Patient[] }) {
  // Model scores for each patient based on mock algorithms
  // We'll calculate a 'Hospitalization Risk' (0-100%) and a 'Mortality Risk' (0-100%)
  const calculateRisks = (p: Patient) => {
    // These are simplified weights for the demo
    let hospRisk = 20; // baseline
    let mortRisk = 10; // baseline

    if (p.age > 70) { hospRisk += 15; mortRisk += 25; }
    else if (p.age > 60) { hospRisk += 10; mortRisk += 15; }

    if (p.diabetic === 1) { hospRisk += 15; mortRisk += 10; }
    if (p.cardiopathy === 1) { hospRisk += 20; mortRisk += 20; }
    
    if (p.albumin && p.albumin < 3.5) { hospRisk += 15; mortRisk += 20; }
    
    // Recent IDH events (mock based on ID)
    const recentIdh = (p.id % 3) + (p.id % 2);
    if (recentIdh > 1) { hospRisk += 15; mortRisk += 10; }

    if (p.currentReading?.riskScore > 60) {
      hospRisk += 10;
    }

    return {
      p,
      hospRisk: Math.min(99, hospRisk),
      mortRisk: Math.min(99, mortRisk),
      recentIdh,
    };
  };

  const riskData = patients.map(calculateRisks);
  
  // High risk patients are those in upper quadrant
  const highRiskPatients = riskData.filter(d => d.hospRisk >= 60 || d.mortRisk >= 50)
    .sort((a,b) => (b.hospRisk + b.mortRisk) - (a.hospRisk + a.mortRisk));

  // Risk quadrants
  const quadrantData = riskData.map(d => ({
    name: d.p.name,
    patientId: d.p.id,
    x: d.mortRisk, // X axis = Mortality Risk
    y: d.hospRisk, // Y axis = Hospitalization Risk
    category: d.hospRisk >= 60 && d.mortRisk >= 50 ? "Q4" : 
              d.hospRisk >= 60 ? "Q1" :
              d.mortRisk >= 50 ? "Q2" : "Q3", 
  }));

  const getQuadrantColor = (category: string) => {
    switch(category) {
      case "Q4": return "#ef4444"; // Red (High Hosp, High Mort)
      case "Q1": return "#f59e0b"; // Amber (High Hosp, Low Mort)
      case "Q2": return "#eab308"; // Yellow (Low Hosp, High Mort)
      case "Q3": return "#10b981"; // Green (Low/Low)
      default: return "#888";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="font-bold text-foreground text-sm mb-1">{data.name}</p>
          <div className="flex flex-col text-xs text-muted-foreground gap-1">
            <span>Riesgo Hosp. 30d: <strong className="text-foreground">{data.y}%</strong></span>
            <span>Riesgo Mort. 6m: <strong className="text-foreground">{data.x}%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-full text-rose-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pacientes en Riesgo Crítico</p>
                <h3 className="text-3xl font-mono mt-1 font-bold">{highRiskPatients.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                <FileStack size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg. Hosp. Risk (30d)</p>
                <h3 className="text-3xl font-mono mt-1 font-bold">
                  {Math.round(riskData.reduce((a,b) => a + b.hospRisk, 0) / riskData.length)}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-border shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estabilidad Poblacional</p>
                <h3 className="text-3xl font-mono mt-1 font-bold">
                  {Math.round(riskData.filter(d => d.hospRisk < 40 && d.mortRisk < 30).length / riskData.length * 100)}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Card className="bg-card/40 border-border shadow-none h-full">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Stethoscope size={16} className="text-primary" />
                Matriz de Estratificación (Machine Learning)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Mortalidad" 
                      unit="%" 
                      domain={[0, 100]}
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff80", fontSize: 10 }}
                      label={{ value: 'Riesgo de Mortalidad (6m)', position: 'bottom', fill: '#ffffff80', fontSize: 11 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Hospitalización" 
                      unit="%" 
                      domain={[0, 100]}
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff80", fontSize: 10 }}
                      label={{ value: 'Riesgo Hospitalización (30d)', angle: -90, position: 'insideLeft', fill: '#ffffff80', fontSize: 11 }}
                    />
                    <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                    <ReferenceLine x={50} stroke="#ffffff20" />
                    <ReferenceLine y={60} stroke="#ffffff20" />
                    <Scatter isAnimationActive={false} name="Pacientes" data={quadrantData}>
                      {quadrantData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.category)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest text-rose-500/80 font-bold">
                Alta Prioridad
              </div>
              <div className="absolute bottom-10 left-16 text-[9px] uppercase tracking-widest text-emerald-500/80 font-bold">
                Bajo Riesgo
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-7">
          <Card className="bg-card/40 border-border shadow-none h-full">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                Intervenciones Prioritarias (Triage)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/10">
                      <TableHead className="text-[10px]">Paciente</TableHead>
                      <TableHead className="text-[10px]">Factores Principales</TableHead>
                      <TableHead className="text-[10px]">Hosp. (30d)</TableHead>
                      <TableHead className="text-[10px]">Mort. (6m)</TableHead>
                      <TableHead className="text-[10px]">Acción Sugerida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskPatients.slice(0, 7).map((d) => (
                      <TableRow key={d.p.id} className="border-border/10">
                        <TableCell>
                          <Link href={`/paciente/${d.p.id}`}>
                            <span className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors block">
                              {d.p.name}
                            </span>
                          </Link>
                          <span className="text-[10px] text-muted-foreground">
                            {d.p.age}a · Alb {d.p.albumin?.toFixed(1) || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {d.p.cardiopathy === 1 && <Badge variant="outline" className="text-[9px] px-1 h-4 border-orange-500/30 text-orange-400">Cardiopatía</Badge>}
                            {d.p.diabetic === 1 && <Badge variant="outline" className="text-[9px] px-1 h-4 border-purple-500/30 text-purple-400">DM2</Badge>}
                            {d.recentIdh > 0 && <Badge variant="outline" className="text-[9px] px-1 h-4 border-rose-500/30 text-rose-400">IDH Crónica</Badge>}
                            {d.p.albumin < 3.5 && <Badge variant="outline" className="text-[9px] px-1 h-4 border-blue-500/30 text-blue-400">Hipoalbu.</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("font-mono font-bold", d.hospRisk >= 60 ? "text-rose-500" : "text-amber-500")}>
                            {d.hospRisk}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn("font-mono font-bold", d.mortRisk >= 50 ? "text-rose-500" : "text-amber-500")}>
                            {d.mortRisk}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
                            {d.hospRisk >= 80 ? "Reevaluación de Peso Seco urgente" :
                             d.mortRisk >= 70 ? "Consulta Cardiología Ext." :
                             "Optimizar Perfil de Sodio"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
