import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, Droplet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function PatientClinicalSummary({ patient }: any) {
  if (!patient) return null;

  const labs = patient.historicalLabs || [];
  const meds = patient.medications || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      {/* Historical Labs */}
      <Card className="bg-background border-border shadow-xl">
        <CardHeader className="py-4 px-6 border-b border-border bg-gradient-to-r from-sky-500/5 to-transparent">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Droplet size={16} /> Histórico de Laboratorios
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
            Tendencia de últimos 4 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/5 dark:bg-black/40">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8">Fecha</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">Hb</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">Alb</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">P</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">Ca</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">PTH</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">K</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground h-8 text-center">spKt/V</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.length > 0 ? labs.map((lab: any, i: number) => (
                  <TableRow key={i} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="text-[10px] font-mono text-muted-foreground py-2">{lab.date}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.hemoglobin < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{lab.hemoglobin}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.albumin < 3.8 ? 'text-amber-400' : 'text-emerald-400'}`}>{lab.albumin}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.phosphorus > 5.5 ? 'text-rose-400' : 'text-sky-400'}`}>{lab.phosphorus}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.calcium > 10.2 || lab.calcium < 8.4 ? 'text-amber-400' : 'text-foreground'}`}>{lab.calcium}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.pth > 300 ? 'text-rose-400' : 'text-foreground'}`}>{lab.pth}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.potassium > 5.5 ? 'text-rose-400' : 'text-foreground'}`}>{lab.potassium}</TableCell>
                    <TableCell className={`text-[10px] font-mono text-center py-2 ${lab.spKtv < 1.2 ? 'text-rose-400' : 'text-emerald-400'}`}>{lab.spKtv}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground py-4">No hay datos históricos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="bg-background border-border shadow-xl">
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
