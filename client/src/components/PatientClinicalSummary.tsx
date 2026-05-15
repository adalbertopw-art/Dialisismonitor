import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, Droplet, ArrowUpDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function PatientClinicalSummary({ patient }: any) {
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLabDate, setSelectedLabDate] = useState<string | null>(null);

  if (!patient) return null;

  const rawLabs = patient.historicalLabs || [];
  const meds = patient.medications || [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedLabs = useMemo(() => {
    return [...rawLabs].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [rawLabs, sortField, sortDirection]);

  // Use a reversed copy of sorted by date for the trend chart to show past->present
  const trendData = useMemo(() => {
    return [...rawLabs].sort((a, b) => a.date.localeCompare(b.date));
  }, [rawLabs]);

  const selectedLab = rawLabs.find((l: any) => l.date === selectedLabDate);

  const SortableHeader = ({ field, label }: { field: string, label: string }) => (
    <TableHead 
      className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 cursor-pointer hover:text-foreground hover:bg-muted/30 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        <ArrowUpDown size={10} className={sortField === field ? "text-primary" : "opacity-30"} />
      </div>
    </TableHead>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      {/* Historical Labs */}
      <Card className="bg-background border-border shadow-xl md:col-span-2">
        <CardHeader className="py-4 px-6 border-b border-border bg-gradient-to-r from-sky-500/5 to-transparent">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Droplet size={16} /> Histórico de Laboratorios
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
            Tendencia de últimos 4 meses - Seleccione una fila para ver detalles gráficos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/5 dark:bg-black/40">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead 
                    className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      <ArrowUpDown size={10} className={sortField === "date" ? "text-primary" : "opacity-30"} />
                    </div>
                  </TableHead>
                  <SortableHeader field="hemoglobin" label="Hb (g/dL)" />
                  <SortableHeader field="albumin" label="Alb (g/dL)" />
                  <SortableHeader field="phosphorus" label="P (mg/dL)" />
                  <SortableHeader field="calcium" label="Ca (mg/dL)" />
                  <SortableHeader field="pth" label="PTH (pg/mL)" />
                  <SortableHeader field="potassium" label="K (mEq/L)" />
                  <SortableHeader field="cholesterol" label="Col (mg/dL)" />
                  <SortableHeader field="triglycerides" label="TG (mg/dL)" />
                  <SortableHeader field="alkalinePhosphatase" label="F.Alc (U/L)" />
                  <SortableHeader field="spKtv" label="spKt/V" />
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">Viral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLabs.length > 0 ? sortedLabs.map((lab: any, i: number) => (
                  <TableRow 
                    key={i} 
                    className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLabDate(lab.date)}
                  >
                    <TableCell className="text-[10px] font-mono text-muted-foreground py-2">{lab.date}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.hemoglobin < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{lab.hemoglobin}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.albumin < 3.8 ? 'text-amber-400' : 'text-emerald-400'}`}>{lab.albumin}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.phosphorus > 5.5 ? 'text-rose-400' : 'text-sky-400'}`}>{lab.phosphorus}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.calcium > 10.2 || lab.calcium < 8.4 ? 'text-amber-400' : 'text-foreground'}`}>{lab.calcium}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.pth > 300 ? 'text-rose-400' : 'text-foreground'}`}>{lab.pth}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.potassium > 5.5 ? 'text-rose-400' : 'text-foreground'}`}>{lab.potassium}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.cholesterol > 200 ? 'text-rose-400' : 'text-foreground'}`}>{lab.cholesterol || '--'}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.triglycerides > 150 ? 'text-rose-400' : 'text-foreground'}`}>{lab.triglycerides || '--'}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.alkalinePhosphatase > 120 ? 'text-rose-400' : 'text-foreground'}`}>{lab.alkalinePhosphatase || '--'}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.spKtv < 1.2 ? 'text-rose-400' : 'text-emerald-400'}`}>{lab.spKtv}</TableCell>
                    <TableCell className="text-[10px] font-mono text-center py-2">
                      <div className="flex gap-1 justify-center">
                        <span title={`HCV: ${lab.hcvStatus || 'Negativo'}`} className={lab.hcvStatus === 'Positivo' ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>C</span>
                        <span title={`HBV: ${lab.hbvStatus || 'Negativo'}`} className={lab.hbvStatus === 'Positivo' ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>B</span>
                        <span title={`HIV: ${lab.hivStatus || 'Negativo'}`} className={lab.hivStatus === 'Positivo' ? 'text-rose-500 font-bold' : 'text-muted-foreground'}>V</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-4">No hay datos históricos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLabDate} onOpenChange={(open) => !open && setSelectedLabDate(null)}>
        <DialogContent className="max-w-4xl bg-black border border-border shadow-2xl p-6">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              Tendencia Neurológica y Metabólica <Badge className="bg-sky-500/20 text-sky-400 border-none">{selectedLabDate}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Métricas clave durante el periodo de tratamiento.
            </DialogDescription>
          </DialogHeader>

          {selectedLabDate && (
            <div className="space-y-6">
              {/* Detailed metrics for the selected date */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Perfil Lipídico</p>
                  <p className="text-sm font-bold">Colesterol: <span className={selectedLab?.cholesterol > 200 ? 'text-rose-400' : ''}>{selectedLab?.cholesterol || '--'} mg/dL</span></p>
                  <p className="text-sm font-bold">Triglicéridos: <span className={selectedLab?.triglycerides > 150 ? 'text-rose-400' : ''}>{selectedLab?.triglycerides || '--'} mg/dL</span></p>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Perfil Óseo</p>
                  <p className="text-sm font-bold">Fosf. Alcalina: <span className={selectedLab?.alkalinePhosphatase > 120 ? 'text-rose-400' : ''}>{selectedLab?.alkalinePhosphatase || '--'} U/L</span></p>
                  <p className="text-sm font-bold">PTH: <span className={selectedLab?.pth > 300 ? 'text-rose-400' : ''}>{selectedLab?.pth} pg/mL</span></p>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Serología Viral</p>
                  <div className="flex flex-col gap-1 text-sm font-bold">
                     <span className={selectedLab?.hcvStatus === 'Positivo' ? 'text-rose-400' : 'text-emerald-400'}>HCV: {selectedLab?.hcvStatus || 'Negativo'}</span>
                     <span className={selectedLab?.hbvStatus === 'Positivo' ? 'text-rose-400' : 'text-emerald-400'}>HBV: {selectedLab?.hbvStatus || 'Negativo'}</span>
                     <span className={selectedLab?.hivStatus === 'Positivo' ? 'text-rose-400' : 'text-emerald-400'}>HIV: {selectedLab?.hivStatus || 'Negativo'}</span>
                  </div>
                </div>
                 <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Nutrición / Anemia</p>
                  <p className="text-sm font-bold">Albúmina: <span className={selectedLab?.albumin < 3.8 ? 'text-amber-400' : 'text-emerald-400'}>{selectedLab?.albumin} g/dL</span></p>
                  <p className="text-sm font-bold">Hemoglobina: <span className={selectedLab?.hemoglobin < 10 ? 'text-rose-400' : 'text-emerald-400'}>{selectedLab?.hemoglobin} g/dL</span></p>
                </div>
              </div>

              {/* Trend Charts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 border border-border p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2"><TrendingUp size={14}/> Albúmina vs Hb</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickMargin={10} />
                        <YAxis yAxisId="left" domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#10b981" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} stroke="#3b82f6" fontSize={10} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                        <Line yAxisId="left" type="monotone" dataKey="albumin" name="Albúmina" stroke="#10b981" strokeWidth={2} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="hemoglobin" name="Hemoglobina" stroke="#3b82f6" strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-black/60 border border-border p-4 rounded-lg">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2"><TrendingUp size={14}/> Fósforo vs PTH</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickMargin={10} />
                        <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} stroke="#f43f5e" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 100']} stroke="#f59e0b" fontSize={10} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                        <Line yAxisId="left" type="monotone" dataKey="phosphorus" name="Fósforo" stroke="#f43f5e" strokeWidth={2} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="pth" name="PTH" stroke="#f59e0b" strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Medications */}
      <Card className="bg-background border-border shadow-xl md:col-span-2">
        <CardHeader className="py-4 px-6 border-b border-border bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Pill size={16} /> Medicación Actual
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
            Conciliación farmacológica del mes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-black/5 dark:bg-black/40 sticky top-0 z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 w-1/2">Fármaco</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8">Dosis</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8">Frecuencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meds.length > 0 ? meds.map((med: any, i: number) => (
                  <TableRow key={i} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="text-[11px] font-medium text-amber-600 dark:text-amber-100/90 py-2.5">
                      {med.name}
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-muted-foreground py-2.5">
                      {med.dose}
                    </TableCell>
                    <TableCell className="text-[9px] uppercase tracking-widest text-muted-foreground/80 py-2.5">
                      {med.frequency}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-4">No hay medicación registrada</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
