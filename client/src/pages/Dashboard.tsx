import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Patient, DashboardStats } from "@shared/types";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Heart,
  ChevronRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    refetchInterval: 3000,
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 3000,
  });

  const [, setLocation] = useLocation();

  const riskCounts = {
    bajo: patients.filter((p) => p.currentReading?.riskCategory === "bajo")
      .length,
    moderado: patients.filter(
      (p) => p.currentReading?.riskCategory === "moderado",
    ).length,
    alto: patients.filter((p) => p.currentReading?.riskCategory === "alto")
      .length,
    muyAlto: patients.filter(
      (p) => p.currentReading?.riskCategory === "muy alto",
    ).length,
  };

  // Dispatch custom events to open the global dialog
  const openAlertsDialog = (filterType: string) => {
    window.dispatchEvent(new CustomEvent('show-dashboard-alerts', { detail: { filterType } }));
  };

  // Find a critical patient for the top alert card
  const criticalPatient = patients.find(
    (p) => p.currentReading?.riskScore >= 65 || p.phase === "hid",
  );

  // Simulate active AI interventions based on early warning (Kim et al.)
  const aiInterventions = patients.filter((patient) => {
    return patient.currentReading?.riskScore >= 45;
  });

  return (
    <div className="space-y-6">
      {aiInterventions.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-4">
          <div className="bg-amber-500/20 p-2 rounded-full mt-1">
            <ShieldCheck size={24} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Intervenciones Autónomas IA en Curso ({aiInterventions.length})
            </h3>
            <p className="text-xs text-amber-500/80 mt-1 mb-3">La Inteligencia Artificial está ajustando la Ultrafiltración (UFR) y Temperatura del Dializado en tiempo real para prevenir eventos de hipotensión inminentes (HID).</p>
            <div className="flex flex-wrap gap-2">
              {aiInterventions.map(p => (
                <div key={p.id} className="bg-amber-500/20 border border-amber-500/40 rounded px-3 py-1.5 flex items-center gap-2 text-xs cursor-pointer hover:bg-amber-500/30 transition-colors" onClick={() => setLocation(`/paciente/${p.id}`)}>
                  <span className="font-bold text-amber-200">Cama {p.bed}</span>
                  <span className="text-amber-500/70 border-l border-amber-500/30 pl-2">↓UFR</span>
                  <span className="text-amber-500/70">↓T°d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Monitor de Unidad — Hemodiálisis
          </h1>
          <p className="text-muted-foreground text-sm uppercase font-medium tracking-tight">
            Sesiones en curso · 15 pacientes activos · Predicción HID + IDHTN en
            tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-mono text-foreground/80">
            {time.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}{" "}
            p. m.
          </span>
        </div>
      </header>

      {/* Top Section Stats */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
             className="cursor-pointer transition-transform active:scale-95"
             onClick={() => openAlertsDialog("all")}
          >
            <StatCardSmall
              title="Pacientes activos"
              value={stats?.active || 15}
              subtitle="Sesión en curso"
              icon={<UsersIcon size={24} />}
              color="primary"
            />
          </div>
          <div
            className="cursor-pointer transition-transform active:scale-95"
            onClick={() => openAlertsDialog("hid")}
          >
            <StatCardSmall
              title="HID activa"
              value={stats?.hidActive || 0}
              subtitle="PAS < 90 mmHg"
              icon={<TrendingDown size={24} />}
              color="destructive"
              active={stats?.hidActive > 0}
            />
          </div>
          <div
            className="cursor-pointer transition-transform active:scale-95"
            onClick={() => openAlertsDialog("idht")}
          >
            <StatCardSmall
              title="IDHTN activa"
              value={stats?.idhtActive || 0}
              subtitle="HTA intradialítica"
              icon={<TrendingUp size={24} />}
              color="purple"
            />
          </div>
          <div
            className="cursor-pointer transition-transform active:scale-95"
            onClick={() => openAlertsDialog("highRisk")}
          >
            <StatCardSmall
              title="Alto / Muy alto"
              value={stats?.highRisk || 0}
              subtitle="Score >= 45/100"
              icon={<AlertTriangle size={24} />}
              color="warning"
            />
          </div>
          <div
            className="cursor-pointer transition-transform active:scale-95"
            onClick={() => openAlertsDialog("alerts")}
          >
            <StatCardSmall
              title="Alertas"
              value={stats?.alerts || 0}
              subtitle="Intervención sugerida"
              icon={<Activity size={24} />}
              color="destructive"
              active={stats?.alerts > 0}
            />
          </div>
        </div>

        {/* Risk Distribution Container */}
        <Card className="col-span-12 lg:col-span-4 bg-card/40 border-border shadow-none">
          <CardHeader className="py-3 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" /> Distribución de
              riesgo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            <RiskRow
              label="Bajo"
              count={riskCounts.bajo}
              total={patients.length}
              color="bg-emerald-500"
            />
            <RiskRow
              label="Moderado"
              count={riskCounts.moderado}
              total={patients.length}
              color="bg-yellow-500"
            />
            <RiskRow
              label="Alto"
              count={riskCounts.alto}
              total={patients.length}
              color="bg-orange-500"
            />
            <RiskRow
              label="Muy alto"
              count={riskCounts.muyAlto}
              total={patients.length}
              color="bg-rose-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Patient Table */}
      <Card className="bg-card/40 border-border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-black/20">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10 w-16">
                  Cama
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10 w-[200px]">
                  Paciente & Clínico
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10">
                  PA / FC
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10">
                  Tend. PA
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10">
                  Rx Dializado
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10">
                  UF / UFR
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10 w-[140px]">
                  Progreso
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10 text-center">
                  Historial
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase py-2 h-10 text-right">
                  Riesgo IA
                </TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient: any) => {
                const ufrRaw =
                  (patient.targetUfVolume * 1000) /
                  (patient.sessionDuration * patient.dryWeight);

                let autoUfr = ufrRaw;
                let autoTemp = patient.dialysateTemp;
                let isAiIntervening = false;

                const risk = patient.currentReading?.riskScore || 0;

                if (risk >= 65) {
                  autoUfr = Math.max(0, autoUfr - 8);
                  autoTemp = 35.5; 
                  isAiIntervening = true;
                } else if (risk >= 45) {
                  autoUfr = Math.max(5, autoUfr - 3);
                  autoTemp = 36.0;
                  isAiIntervening = true;
                } else if (risk < 25 && autoUfr < 15) {
                   autoUfr = Math.min(15, autoUfr + 1);
                }

                const ufr = ufrRaw; // Fallback mapping for original usage if needed outside

                const m1 = patient.id % 3 === 0 || patient.diabetic === 1;
                const m2 = patient.id % 4 === 1;
                const m3 = patient.id % 5 === 2 || patient.cardiopathy === 1;
                const history = [m1, m2, m3];

                return (
                  <TableRow
                    key={patient.id}
                    className="group cursor-pointer border-border/50 hover:bg-primary/5 transition-colors"
                    onClick={() => setLocation(`/paciente/${patient.id}`)}
                  >
                    <TableCell className="py-3">
                      <div
                        className={cn(
                          "text-sm font-bold flex flex-col",
                          patient.currentReading?.riskScore >= 65
                            ? "text-rose-500"
                            : "text-primary",
                        )}
                      >
                        <span>{patient.bed}</span>
                        {patient.currentReading?.riskScore >= 65 && (
                          <span className="text-[10px] flex items-center gap-1 font-bold text-rose-500 mt-1">
                            <AlertTriangle size={10} /> ALERTA
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">
                          {patient.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tight mb-1 mt-0.5">
                          {patient.age}a · {patient.sex === "M" ? "M" : "F"} ·{" "}
                          {patient.dialysisVintage}m HD · Alb{" "}
                          {patient.albumin?.toFixed(1)}
                        </span>
                        <div className="flex gap-1 mt-0.5">
                          {patient.diabetic === 1 && (
                            <Badge className="h-4 text-[8px] bg-orange-950/40 text-orange-400 border-none px-1 rounded-sm">
                              DM
                            </Badge>
                          )}
                          {patient.cardiopathy === 1 && (
                            <Badge className="h-4 text-[8px] bg-rose-950/40 text-rose-400 border-none px-1 rounded-sm">
                              CARDIO
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={cn(
                              "font-mono font-bold text-lg leading-none",
                              patient.currentReading?.sbp < 100
                                ? "text-rose-500"
                                : patient.currentReading?.sbp > 160
                                  ? "text-purple-400"
                                  : "text-yellow-400",
                            )}
                          >
                            {patient.currentReading?.sbp}/
                            {patient.currentReading?.dbp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono leading-tight mt-1.5">
                          <Heart
                            size={10}
                            className={
                              patient.currentReading?.hr > 90
                                ? "text-amber-500"
                                : "text-rose-500/70"
                            }
                          />{" "}
                          {patient.currentReading?.hr} lpm
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-20">
                      <div className="w-full h-8 flex items-center">
                        <MiniTrend
                          color={
                            patient.currentReading?.sbp < 110
                              ? "#f97316"
                              : "#22c55e"
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-[10px] font-mono leading-none w-24">
                        {isAiIntervening && (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-amber-500 uppercase pb-1 tracking-widest animate-pulse">
                            <ShieldCheck size={10} /> IA Intervino
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-muted-foreground mr-1 flex items-center gap-1">
                            T°d
                          </span>
                          <span
                            className={cn(
                              "font-bold",
                              isAiIntervening ? "text-amber-500" : (autoTemp >= 36.5 ? "text-amber-500" : "text-emerald-500")
                            )}
                          >
                            {isAiIntervening && autoTemp < patient.dialysateTemp && <span className="line-through text-muted-foreground mr-1">{patient.dialysateTemp}°</span>}
                            {autoTemp.toFixed(1)}°
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-muted-foreground mr-2">
                            Na+
                          </span>
                          <span
                            className={
                              patient.sodiumDialysate > 140
                                ? "text-amber-500 font-bold"
                                : "text-foreground font-bold"
                            }
                          >
                            {patient.sodiumDialysate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-muted-foreground mr-2">Qb</span>
                          <span className="text-foreground font-bold">
                            {patient.bloodFlowRate}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium leading-none">
                          {patient.currentReading?.ufRemoved?.toFixed(2)}{" "}
                          <span className="text-muted-foreground pb-0.5">
                            /{patient.targetUfVolume}L
                          </span>
                        </span>
                        <div className="flex flex-col mt-1">
                          {isAiIntervening && (
                            <span className="text-[8px] font-bold text-amber-500 uppercase mb-0.5">Ajuste IA (-{(ufrRaw - autoUfr).toFixed(1)})</span>
                          )}
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-tight",
                              isAiIntervening ? "text-amber-400" : (ufrRaw > 13 ? "text-rose-500" : ufrRaw > 10 ? "text-amber-500" : "text-emerald-500"),
                            )}
                          >
                            <span className="flex items-center gap-1">
                              UFR {isAiIntervening && <span className="line-through text-muted-foreground text-[8px]">{ufrRaw.toFixed(1)}</span>} 
                              <span className={cn(isAiIntervening && "animate-pulse")}>{autoUfr.toFixed(1)}</span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground leading-none">
                          <span>
                            {patient.minuteElapsed >=
                            patient.sessionDuration * 60
                              ? "Completa"
                              : `${Math.floor(patient.minuteElapsed / 60)}h ${patient.minuteElapsed % 60}m`}
                          </span>
                          <span className="font-bold">
                            {Math.min(100, Math.round(patient.sessionProgress))}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              patient.sessionProgress >= 100
                                ? "bg-emerald-500"
                                : patient.sessionProgress > 50
                                  ? "bg-amber-500"
                                  : "bg-primary",
                            )}
                            style={{
                              width: `${Math.min(100, patient.sessionProgress)}%`,
                            }}
                          />
                        </div>
                        <div className="text-[8px] text-muted-foreground uppercase text-right leading-none pt-0.5">
                          {patient.sessionDuration}h obj.
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-1.5">
                          {history.map((hadIdh, i) => (
                            <div
                              key={i}
                              title={hadIdh ? "IDH" : "OK"}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                hadIdh ? "bg-rose-500" : "bg-emerald-500/20",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">
                          Hist. (3)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-end leading-none relative">
                        <PhaseBadge phase={patient.phase} />
                        <span
                          className={cn(
                            "font-mono font-bold text-xl mt-2 leading-none",
                            getRiskColor(patient.currentReading?.riskCategory),
                          )}
                        >
                          {Math.round(patient.currentReading?.riskScore)}
                          <span className="text-[10px] ml-0.5 opacity-50">
                            /100
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-8 text-center">
                      <ChevronRight
                        size={14}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mx-auto"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <footer className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest pt-4 border-t border-border/20">
        <div>
          Actualización automática cada 3 s · Motor predictivo: Kim 2021 · Yang
          2024 · Marcos 2024 · KDOQI 2015
        </div>
        <div className="flex items-center gap-1">
          Solo uso educativo y de simulación clínica
        </div>
      </footer>
    </div>
  );
}

function StatCardSmall({
  title,
  value,
  subtitle,
  icon,
  color,
  active = false,
}: any) {
  const colorMap: any = {
    primary: "text-primary border-primary/20 bg-primary/5",
    destructive: "text-rose-500 border-rose-500/20 bg-rose-500/5",
    warning: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5",
    purple: "text-purple-400 border-purple-400/20 bg-purple-400/5",
  };

  return (
    <Card
      className={cn(
        "bg-card/40 border-border shadow-none transition-all",
        active &&
          "animate-pulse border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      )}
    >
      <CardContent className="p-4 flex gap-4 items-center">
        <div
          className={cn(
            "p-2 rounded-lg bg-black/20",
            colorMap[color]?.split(" ")[0],
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold leading-none">
              {value}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              {title}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase font-medium mt-1 leading-none">
            {subtitle}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskRow({ label, count, total, color }: any) {
  const percentage = (count / total) * 100;
  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <span className="col-span-3 text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
        {label}
      </span>
      <div className="col-span-8 h-2 bg-muted/20 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            color,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="col-span-1 text-[10px] font-mono font-bold text-right text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  switch (phase) {
    case "stable":
      return (
        <Badge className="bg-emerald-500 text-white uppercase text-[9px] font-bold px-2 py-0.5 h-auto border-none rounded-sm">
          Estable
        </Badge>
      );
    case "dropping":
      return (
        <Badge className="bg-yellow-500 text-black uppercase text-[9px] font-bold px-2 py-0.5 h-auto border-none rounded-sm">
          Dropping
        </Badge>
      );
    case "hid":
      return (
        <Badge className="bg-rose-500 text-white uppercase text-[9px] font-bold px-2 py-0.5 h-auto border-none rounded-sm">
          HID ACTIVA
        </Badge>
      );
    case "recovering":
      return (
        <Badge className="bg-blue-600 text-white uppercase text-[9px] font-bold px-2 py-0.5 h-auto border-none rounded-sm">
          Recuperando
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="uppercase text-[9px] font-bold py-0.5 h-auto border-none rounded-sm"
        >
          {phase}
        </Badge>
      );
  }
}

function MiniTrend({ color }: { color: string }) {
  const data = Array.from({ length: 15 }, (_, i) => ({
    val: 40 + Math.random() * 60 + i * 2,
  }));
  return (
    <ResponsiveContainer width="100%" height={24}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="val"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function getRiskColor(category: string) {
  switch (category) {
    case "muy alto":
      return "text-rose-500";
    case "alto":
      return "text-orange-500";
    case "moderado":
      return "text-yellow-500";
    default:
      return "text-emerald-500";
  }
}

function UsersIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
