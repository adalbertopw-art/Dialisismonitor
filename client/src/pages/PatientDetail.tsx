import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  FileText,
  Download,
  Settings,
  AlertCircle,
  Stethoscope,
  TrendingUp,
  Droplet,
  Clock,
  Thermometer,
  Zap,
  Activity,
  ClipboardList,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Patient, PatientReading } from "@shared/types";
import {
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  Scatter,
} from "recharts";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import InterventionLogger from "@/components/InterventionLogger";
import AudioAlarm from "@/components/AudioAlarm";
import UFAlert from "@/components/UFAlert";
import { ScientificEvidenceModal } from "@/components/ScientificEvidenceModal";
import { DigitalTwinSimulator } from "@/components/DigitalTwinSimulator";
import { BioimpedancePhenotype } from "@/components/BioimpedancePhenotype";
import { ClosedLoopBiofeedback } from "@/components/ClosedLoopBiofeedback";
import { SodiumUFProfile } from "@/components/SodiumUFProfile";
import { BodyCompositionChart } from "@/components/BodyCompositionChart";
import { DryWeightOptimizer } from "@/components/DryWeightOptimizer";
import { AnemiaManager } from "@/components/AnemiaManager";
import { AVFThrombosisPredictor } from "@/components/AVFThrombosisPredictor";
import { SBARNoteGenerator } from "@/components/SBARNoteGenerator";
import { NursingNotesMiner } from "@/components/NursingNotesMiner";
import { ClinicalHistoryNote } from "@/components/ClinicalHistoryNote";
import { AIReasoningTerminal } from "@/components/AIReasoningTerminal";
import { PatientClinicalSummary } from "@/components/PatientClinicalSummary";

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const detailRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("monitor");

  const [simulatedReadings, setSimulatedReadings] = useState<
    PatientReading[] | null
  >(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;

    const handleScroll = () => {
      setIsScrolled(mainContainer.scrollTop > 80);
    };
    
    // Check initial position
    handleScroll();

    mainContainer.addEventListener("scroll", handleScroll);
    return () => mainContainer.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isSimulating) {
      setSimulatedReadings(null);
      return;
    }

    const interval = setInterval(() => {
      setSimulatedReadings((prev) => {
        if (!prev) return prev;
        const last = prev[prev.length - 1];

        // Simular un colapso en la presión arterial
        const sbpDrop = Math.floor(Math.random() * 5) + 3; // Drops 3-7 mmHg
        const dbpDrop = Math.floor(Math.random() * 3) + 1; // Drops 1-3 mmHg
        const hrIncrease = Math.floor(Math.random() * 5) + 1; // HR goes up as compensation

        const newSbp = Math.max(60, last.sbp - sbpDrop);
        const newDbp = Math.max(40, last.dbp - dbpDrop);

        // Risk score algorithm simplified sum
        let extraRisk = 0;
        if (newSbp < 100) extraRisk += 20;
        if (newSbp < 90) extraRisk += 30;

        const newReading: PatientReading = {
          id: last.id + 1,
          patientId: last.patientId,
          sessionId: last.sessionId || "demo-session",
          minuteOfSession: last.minuteOfSession + 1,
          sbp: newSbp,
          dbp: newDbp,
          hr: (last.hr || 70) + hrIncrease,
          ufRemoved: (last.ufRemoved || 0) + 10, // dummy removed
          riskScore: Math.min(100, last.riskScore + extraRisk + 5), // risk shoots up
          riskCategory: newSbp < 100 ? "Critico" : "Alto",
          hidEvent: newSbp < 100 ? 1 : 0,
          idhtEvent: newSbp < 90 ? 1 : 0,
          idhtRiskScore: last.idhtRiskScore || 0,
          phase: newSbp < 100 ? "dropping" : "stable",
          timestamp: new Date().toISOString(),
        };

        return [...prev.slice(-40), newReading]; // Keep last 40 to avoid massive arrays in demo
      });
    }, 1000); // 1 tick per second

    return () => clearInterval(interval);
  }, [isSimulating]);

  const { data: detail, isLoading } = useQuery<{
    patient: Patient;
    readings: PatientReading[];
  }>({
    queryKey: [`/api/patients/${id}`],
    refetchInterval: isSimulating ? false : 3000, // Stop real refetching when simulating
  });

  // Use simulated readings when active to allow user to see how UI updates
  useEffect(() => {
    if (isSimulating && !simulatedReadings && detail?.readings) {
      setSimulatedReadings(detail.readings);
    }
  }, [isSimulating, detail?.readings, simulatedReadings]);

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 shadow-sm">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const patient = detail.patient;

  const activeReadings = simulatedReadings || detail.readings;
  const readings = activeReadings;
  const lastReading: any = activeReadings[activeReadings.length - 1] || {};

  const predictiveHorizon = generatePredictiveHorizon(
    readings,
    lastReading.phase || "stable",
    patient,
  );
  const predictiveLog = readings
    .slice(-30)
    .map((r) => {
      const risk = r.riskScore || 0;
      const isAiIntervening = risk >= 45;
      
      const ufrRaw = (patient.targetUfVolume * 1000) / (patient.sessionDuration * patient.dryWeight);
      let ufrStr = "";
      let tempStr = "";
      
      if (risk >= 65) {
          ufrStr = `↓ UFR a ${Math.max(0, ufrRaw - 8).toFixed(1)}`;
          tempStr = `↓ T°d 35.5°C`;
      } else if (risk >= 45) {
          ufrStr = `↓ UFR a ${Math.max(5, ufrRaw - 3).toFixed(1)}`;
          tempStr = `↓ T°d 36.0°C`;
      }

      return { 
        minute: r.minuteOfSession, 
        sbp: r.sbp,
        aiInterventionMarker: isAiIntervening ? r.sbp : null,
        interventionDetails: isAiIntervening ? `${ufrStr} | ${tempStr}` : null
      };
    });

  const riskStatusLabel =
    lastReading.riskScore > 65
      ? "Muy alto"
      : lastReading.riskScore > 45
        ? "Alto"
        : "Normal";
  const idhtRiskStatusLabel =
    lastReading.idhtEvent === 1 ? "Crítico" : "Normal";

  const handleExport = async () => {
    if (!detailRef.current) return;
    const canvas = await html2canvas(detailRef.current, {
      backgroundColor: "#0b0e14",
    });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `reporte-paciente-${patient.name}.png`;
    link.href = imgData;
    link.click();
  };

  const ufr =
    (patient.targetUfVolume * 1000) /
      ((patient.sessionDuration || 4) * (patient.dryWeight || 68.5)) || 0;

  const activeFactors = [];
  if (lastReading.sbp < 105)
    activeFactors.push({
      label: "PAS límite bajo",
      value: `${lastReading.sbp} mmHg`,
    });
  if (ufr > 10)
    activeFactors.push({
      label: "UFR elevada",
      value: `${ufr.toFixed(1)} mL/kg/h`,
    });
  if (lastReading.riskScore > 50)
    activeFactors.push({
      label: "Score predictivo alto",
      value: `${Math.round(lastReading.riskScore)}/100`,
    });
  if (patient.diabetic && patient.cardiopathy)
    activeFactors.push({
      label: "DM + Cardiopatía",
      value: "Alto riesgo compuesto",
    });
  else if (patient.diabetic)
    activeFactors.push({ label: "Diabetes Mellitus", value: "Comorbilidad" });
  else if (patient.cardiopathy)
    activeFactors.push({ label: "Cardiopatía", value: "Comorbilidad" });
  if (patient.albumin < 3.5)
    activeFactors.push({
      label: "Albúmina baja",
      value: `${patient.albumin} g/dL`,
    });
  if (lastReading.phase === "dropping")
    activeFactors.push({
      label: "Fase de descenso activo",
      value: "Tendencia hacia HID",
      color: "destructive",
    });
  const sessionDurationParams = patient.sessionDuration || 4; // default to 4h
  const minuteProgress =
    Math.round(
      (lastReading.minuteOfSession / (sessionDurationParams * 60)) * 100,
    ) || 0;

  if (lastReading.minuteOfSession > (sessionDurationParams * 60) / 2) {
    activeFactors.push({
      label: "Segunda mitad de sesión",
      value: `${minuteProgress}% completado`,
    });
  }

  const getProb = (sbp: number) =>
    Math.max(5, Math.min(99, Math.round(99 - ((sbp - 80) / 50) * 94)));

  return (
    <div
      className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10 relative"
      ref={detailRef}
    >
      <AudioAlarm riskScore={lastReading.riskScore || 0} />

      {/* Header Compacto y Moderno */}
      <header className="bg-transparent -mx-4 px-4 md:-mx-8 md:px-8 py-2 md:py-3 mb-2">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer">
                <ArrowLeft size={16} />
              </div>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-xl font-bold tracking-tight text-white/90">
                  {patient.name}
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isSimulating && (
                    <div
                      className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                      title="Simulación Activa"
                    />
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] h-4 font-bold uppercase tracking-widest bg-emerald-500/5 text-emerald-400 border-emerald-500/20",
                      lastReading.phase !== "stable" &&
                        "bg-blue-500/5 text-blue-400 border-blue-500/20",
                    )}
                  >
                    {lastReading.phase === "stable" ? "Estable" : "Recup."}
                  </Badge>
                  {patient.hidEpisodes > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 font-bold uppercase tracking-widest bg-rose-500/5 text-rose-400 border-rose-500/20"
                    >
                      {patient.hidEpisodes} HID
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                <span>{patient.bed}</span>
                <span className="w-0.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                <span>{patient.age}A</span>
                <span className="w-0.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                <span className="hidden sm:inline">
                  {patient.sex === "masculino" ? "M" : "F"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex-1 md:flex-initial flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <Button
                onClick={() => setIsSimulating(!isSimulating)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 md:px-3 text-[9px] font-bold uppercase tracking-widest transition-all",
                  isSimulating
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-muted-foreground hover:bg-white/5",
                )}
              >
                <Zap
                  size={12}
                  className={cn("md:mr-1.5", isSimulating && "text-amber-500")}
                />
                <span className="hidden md:inline">
                  {isSimulating ? "Detener" : "Simular"}
                </span>
              </Button>

              <ScientificEvidenceModal />

              <Link href={`/paciente/${id}/pre-dialisis`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 md:px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  <ClipboardList size={12} className="md:mr-1.5" />{" "}
                  <span className="hidden md:inline">Pre-dial</span>
                </Button>
              </Link>

              <Button
                onClick={handleExport}
                variant="ghost"
                size="sm"
                className="h-8 px-2 md:px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5"
              >
                <Download size={12} className="md:mr-1.5" />{" "}
                <span className="hidden md:inline">Export</span>
              </Button>

              <ClinicalHistoryNote
                patient={patient}
                lastReading={lastReading}
              />
            </div>

            <div className="hidden lg:flex flex-col items-end min-w-[100px] ml-4">
              <div className="flex justify-between w-full text-[8px] uppercase font-bold text-muted-foreground/50 mb-0.5">
                <span>
                  {Math.floor(lastReading.minuteOfSession / 60)}h:
                  {String(lastReading.minuteOfSession % 60).padStart(2, "0")}m
                </span>
                <span>{minuteProgress}%</span>
              </div>
              <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000 bg-primary",
                    lastReading.minuteOfSession /
                      (sessionDurationParams * 60) >=
                      1 && "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(100, minuteProgress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar thin bottom of header for mobile/global visibility */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5">
          <div
            className="h-full bg-primary/40 transition-all duration-1000"
            style={{ width: `${Math.min(100, minuteProgress)}%` }}
          />
        </div>

        {lastReading.riskScore > 65 && (
          <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 bg-rose-500 text-white px-4 py-1 rounded-b-lg flex items-center gap-2 shadow-lg shadow-rose-900/20 border border-rose-400/20 animate-in slide-in-from-top duration-300">
            <AlertCircle size={12} className="animate-bounce" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Alerta: Riesgo HID Crítico
            </span>
          </div>
        )}
      </header>

      {/* Floating Pill when scrolled */}
      <div 
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 pointer-events-none",
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <div className={cn("flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl", isScrolled ? "pointer-events-auto" : "pointer-events-none")}>
          <Link href="/">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer">
              <ArrowLeft size={12} />
            </div>
          </Link>
          <span className="text-sm font-bold tracking-tight text-white/90 whitespace-nowrap">
            {patient.name}
          </span>
          <div className="flex flex-col items-start px-2 border-l border-white/10">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
              {patient.bed} · {patient.age}a
            </span>
          </div>
          {lastReading.phase !== "stable" && (
            <Badge
              variant="outline"
              className="text-[8px] h-4 font-bold uppercase tracking-widest bg-blue-500/5 text-blue-400 border-blue-500/20 px-1.5"
            >
              Recup.
            </Badge>
          )}
        </div>
      </div>

      {/* Información Detallada del Paciente (Collapsible) */}
      <div className="bg-[#111] border border-white/5 rounded-lg shadow-sm mx-0 md:mx-0">
        <button
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="w-full flex items-center justify-between p-3 md:px-4 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-sky-400">
            <Info size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
              Información Clínica Detallada
            </span>
          </div>
          {isInfoExpanded ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </button>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isInfoExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 border-t border-white/5 bg-[#0a0a0a]">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Edad
                </span>
                <p className="text-sm font-mono font-bold text-white/90">
                  {patient.age} años
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Sexo
                </span>
                <p className="text-sm font-mono font-bold text-white/90 capitalize">
                  {patient.sex}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   Vintage HD
                </span>
                <p className="text-sm font-mono font-bold text-white/90">
                  {patient.dialysisVintage} meses
                </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Peso Seco
                </span>
                <p className="text-sm font-mono font-bold text-white/90">
                  {patient.dryWeight} kg
                </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Etiología
                </span>
                <p className="text-xs font-bold text-white/90 truncate" title={patient.etiology}>
                  {patient.etiology || "-"}
                </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Diabetes
                </span>
                <p className="text-sm font-mono font-bold text-white/90">
                  {patient.diabetic ? "Sí" : "No"}
                </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Cardiopatía
                </span>
                <p className="text-sm font-mono font-bold text-white/90">
                  {patient.cardiopathy ? "Sí" : "No"}
                </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Acceso
                </span>
                <p className="text-xs font-bold text-white/90 truncate" title={`${patient.vascularAccessType} (${patient.vascularAccessLocation})`}>
                  {patient.vascularAccessType || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar my-4 pb-1">
        <button
          onClick={() => setActiveTab("monitor")}
          className={cn(
            "flex-none px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap border",
            activeTab === "monitor"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-[#111] text-muted-foreground border-white/5 hover:text-white hover:bg-white/5",
          )}
        >
          Monitor en Vivo
        </button>
        <button
          onClick={() => setActiveTab("laboratorios")}
          className={cn(
            "flex-none px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap border",
            activeTab === "laboratorios"
              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
              : "bg-[#111] text-muted-foreground border-white/5 hover:text-white hover:bg-white/5",
          )}
        >
          Labs y Prescripción
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={cn(
            "flex-none px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap border",
            activeTab === "historial"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-[#111] text-muted-foreground border-white/5 hover:text-white hover:bg-white/5",
          )}
        >
          Historial y Evolución
        </button>
        <button
          onClick={() => setActiveTab("vascular")}
          className={cn(
            "flex-none px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap border",
            activeTab === "vascular"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : "bg-[#111] text-muted-foreground border-white/5 hover:text-white hover:bg-white/5",
          )}
        >
          Acceso Vascular
        </button>
      </div>

      {activeTab === "monitor" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCardSmall
              label="PA SISTÓLICA"
              value={lastReading.sbp}
              unit={`/ ${lastReading.dbp} mmHg`}
              status={
                lastReading.sbp < 100
                  ? "destructive"
                  : lastReading.sbp < 115
                    ? "warning"
                    : "default"
              }
            />
            <MetricCardSmall
              label="FREC. CARD."
              value={lastReading.hr}
              unit="lpm"
              icon={<Droplet size={14} className="text-rose-400" />}
            />
            <MetricCardSmall
              label="UF REMOVIDA"
              value={lastReading.ufRemoved}
              unit={`/ ${patient.targetUfVolume} L`}
              icon={<Droplet size={14} className="text-sky-400" />}
            />
            <MetricCardSmall
              label="UFR"
              value={(
                (patient.targetUfVolume * 1000) /
                (patient.sessionDuration * patient.dryWeight)
              ).toFixed(1)}
              unit="mL/kg/h"
              subValue={
                (patient.targetUfVolume * 1000) /
                  (patient.sessionDuration * patient.dryWeight) >
                13
                  ? "Alta — KDOQI"
                  : "Estable"
              }
              status={
                (patient.targetUfVolume * 1000) /
                  (patient.sessionDuration * patient.dryWeight) >
                13
                  ? "destructive"
                  : "default"
              }
            />
            <MetricCardSmall
              label="RIESGO HID"
              value={Math.round(lastReading.riskScore || 0)}
              unit="/ 100"
              subValue={riskStatusLabel}
              status={
                lastReading.riskScore > 65
                  ? "destructive"
                  : lastReading.riskScore > 45
                    ? "warning"
                    : "default"
              }
              isLarge
            />
            <MetricCardSmall
              label="RIESGO IDHTN"
              value={Math.round(lastReading.idhtRiskScore || 0)}
              unit="/ 100"
              subValue="Normal"
              status="default"
              isLarge
            />
          </div>

          {/* Prediction Section - Enhanced with AI Interpretability */}
          <div className="bg-[#1a1010]/30 border border-rose-500/10 rounded-xl p-6 space-y-6">
            <header className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
                  <TrendingUp size={16} /> Predicción LSTM de Crisis HID
                  (Horizonte 60 min)
                </h3>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase">
                  Modelo Deep Learning Transformer + TCN (AUROC 0.94) · Yang AJKD 2024
                  · Explicabilidad SHAP
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-[10px] uppercase font-bold text-emerald-500 tracking-widest">
                  Gradiente SBP: +1.46 mmHg/min
                </span>
                <span className="hidden md:flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                  Intervención IA
                </span>
                <Badge className="bg-rose-500 text-white border-none h-6 px-3 text-[10px] font-black uppercase tracking-widest leading-none">
                  Riesgo Inminente
                </Badge>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-3 h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={predictiveLog}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#333"
                      strokeOpacity={0.2}
                    />
                    <XAxis
                      dataKey="minute"
                      stroke="#555"
                      fontSize={9}
                      tickFormatter={(v) => `${v}m`}
                    />
                    <YAxis domain={[50, 200]} hide />
                    <ReferenceLine
                      y={90}
                      stroke="#f43f5e"
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                      label={{
                        value: "Umbral HID (90mmHg)",
                        fill: "#f43f5e",
                        fontSize: 9,
                        position: "left",
                      }}
                    />

                    {/* Historical Area */}
                    <Area
                      type="monotone"
                      dataKey="sbp"
                      data={predictiveLog}
                      stroke="none"
                      fill="#f43f5e"
                      fillOpacity={0.1}
                    />

                    {/* Historical Line */}
                    <Line
                      type="monotone"
                      dataKey="sbp"
                      data={predictiveLog}
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* Prediction Line */}
                    <Line
                      type="monotone"
                      dataKey="sbp"
                      data={predictiveHorizon.map((p) => ({
                        minute: lastReading.minuteOfSession + p.minute,
                        sbp: p.sbp,
                      }))}
                      stroke="#f43f5e"
                      strokeWidth={3}
                      strokeDasharray="6 6"
                      dot={(props: any) => {
                        if (
                          props.index === 0 ||
                          props.index === 3 ||
                          props.index === 6
                        ) {
                          return (
                            <circle
                              key={`dot-proj-${props.index}`}
                              cx={props.cx}
                              cy={props.cy}
                              r={4}
                              fill="white"
                              stroke="#f43f5e"
                              strokeWidth={2}
                            />
                          );
                        }
                        return null;
                      }}
                      isAnimationActive={false}
                    />

                    {/* Confidence Interval Area (Simulated) */}
                    <Area
                      type="monotone"
                      dataKey="ciMax"
                      data={predictiveHorizon.map((p) => ({
                        minute: lastReading.minuteOfSession + p.minute,
                        ciMax: p.sbp + 8,
                        ciMin: p.sbp - 10,
                      }))}
                      stroke="none"
                      fill="#f43f5e"
                      fillOpacity={0.05}
                    />
                    
                    {/* AI Interventions */}
                    <Scatter 
                      dataKey="aiInterventionMarker" 
                      fill="#f59e0b" 
                      stroke="#000"
                      strokeWidth={1}
                      r={6}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const ptData = payload[0].payload;
                          const hasIntervention = ptData.aiInterventionMarker !== null && ptData.aiInterventionMarker !== undefined;
                          return (
                            <div className={`bg-[#000]/90 border border-white/10 p-3 rounded shadow-xl ${hasIntervention ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}`}>
                              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2 mb-1">
                                <Clock size={10} /> Min.{" "}
                                {ptData.minute} — PREDICCIÓN LSTM
                              </div>
                              <div className="text-sm font-bold text-white mb-2 flex items-center justify-between gap-4">
                                <span>PAS Estimada: <span className="text-rose-500">{payload[0].value}</span> mmHg</span>
                                {hasIntervention && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded animate-pulse">IA INTERVINO</span>}
                              </div>
                              {hasIntervention && ptData.interventionDetails && (
                                <div className="text-[10px] font-bold text-amber-400 mb-2 border-l-2 border-amber-500 pl-2">
                                  {ptData.interventionDetails}
                                </div>
                              )}
                              <div className="text-[9px] text-muted-foreground">
                                IC 80%: [
                                {Math.round(Number(payload[0].value) - 10)} -{" "}
                                {Math.round(Number(payload[0].value) + 8)}]
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Explainability Panel (SHAP values & TTE) */}
              <div className="flex flex-col gap-4">
                <div className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 animate-pulse"></div>
                  <Activity
                    size={24}
                    className="text-rose-500 mb-2 opacity-50"
                  />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 text-center">
                    Tiempo estimado c/riesgo
                  </div>
                  <div className="text-4xl font-black text-rose-500 font-mono tracking-tighter">
                    18<span className="text-base text-rose-500/50">min</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground/50 uppercase mt-1">
                    Nivel de Confianza: 87%
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-lg p-4 flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Settings size={12} /> Factores Clave (SHAP)
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/80">
                          Tendencia SBP Acum.
                        </span>
                        <span className="text-rose-400 font-mono">+0.42</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-[85%]"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/80">UFR Actual (15.2)</span>
                        <span className="text-rose-400 font-mono">+0.31</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500/80 h-full w-[60%]"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/80">
                          Edad / Vasculopatía
                        </span>
                        <span className="text-rose-400 font-mono">+0.15</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500/60 h-full w-[35%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counterfactuals */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-2">
                    Análisis What-If
                  </div>
                  <p className="text-[10px] text-emerald-400/80 leading-tight">
                    Reducir UFR a <strong>8.0 mL/kg/h</strong> retrasaría la
                    crisis en al menos <strong>+45 min</strong>. (Confianza:
                    Alta)
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-wider">
              Predicción y explicabilidad generadas por ensamble LSTM-XGBoost
              entrenado con {">"}2M de sesiones. No reemplaza juicio médico.
            </p>
          </div>

          {/* UF Projection Section */}
          <Card className="bg-[#0a0a0a] border-emerald-500/10">
            <CardHeader className="py-3 px-4 border-b border-emerald-500/5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <CheckCircle2 size={14} /> Proyección UF — Fin de sesión
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] h-4 font-bold">
                Normal
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground/60">
                    UF removida:{" "}
                    <span className="text-foreground">
                      {lastReading.ufRemoved.toFixed(2)} L
                    </span>
                  </span>
                </div>
                <span className="text-muted-foreground/60">
                  Objetivo:{" "}
                  <span className="text-foreground">
                    {patient.targetUfVolume} L
                  </span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{
                      width: `${(lastReading.ufRemoved / patient.targetUfVolume) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground/40 uppercase">
                  <span>
                    Ahora:{" "}
                    {Math.round(
                      (lastReading.ufRemoved / patient.targetUfVolume) * 100,
                    )}
                    %
                  </span>
                  <span className="text-sky-400">Proyectado fin: 100%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">
                    UFR actual
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-500">
                    {(
                      (patient.targetUfVolume * 1000) /
                      (patient.sessionDuration * patient.dryWeight)
                    ).toFixed(1)}{" "}
                    mL/kg/h
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">
                    Déficit proyectado
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-500">
                    0.00 L (0%)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">
                    ¿Completará?
                  </div>
                  <div className="text-xs font-bold text-emerald-500">Sí</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Timeline Section */}
          <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl">
            <CardHeader className="py-4 px-6 flex-row items-center justify-between border-b border-white/5">
              <div className="space-y-1">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-sky-400">
                  <Clock size={16} /> Línea de Tiempo de Riesgo — Ventanas 15 /
                  30 / 60 min
                </CardTitle>
                <CardDescription className="text-[9px] uppercase tracking-widest font-bold">
                  Sistema de alerta temprana · Kim CJASN 2021 · BestShape CKJ
                  2025 · Yang 2024
                </CardDescription>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold uppercase opacity-50">
                {activeFactors.length} factores activos
              </span>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Timeline vertical bar */}
                <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-border md:hidden" />

                <RiskTimelineCard
                  time="+15 min"
                  probability={getProb(
                    predictiveHorizon[2]?.sbp || lastReading.sbp,
                  )}
                  projectedSbp={predictiveHorizon[2]?.sbp || lastReading.sbp}
                  factors={activeFactors.slice(0, 4)}
                  action={
                    lastReading.riskScore > 65
                      ? "Actuar AHORA: suspender UF + Trendelenburg + avisar médico"
                      : "Optimización proactiva"
                  }
                  isUrgent={lastReading.riskScore > 65}
                />

                <RiskTimelineCard
                  time="+30 min"
                  probability={getProb(
                    predictiveHorizon[5]?.sbp || lastReading.sbp,
                  )}
                  projectedSbp={predictiveHorizon[5]?.sbp || lastReading.sbp}
                  factors={activeFactors.slice(0, 3)}
                  action={
                    lastReading.riskScore > 45
                      ? "Reducir UFR inmediato + enfriar dializante + considerar midodrina"
                      : "Monitoreo estándar"
                  }
                  isUrgent={false}
                />

                <RiskTimelineCard
                  time="+60 min"
                  probability={getProb(
                    predictiveHorizon[8]?.sbp || lastReading.sbp,
                  )}
                  projectedSbp={predictiveHorizon[8]?.sbp || lastReading.sbp}
                  factors={activeFactors.slice(0, 3)}
                  action={
                    lastReading.riskScore > 45
                      ? "Reevaluar prescripción completa. Considerar terminar sesión anticipado"
                      : "Evaluación continua"
                  }
                  isUrgent={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contributing Factors Tags */}
          <div className="flex flex-wrap gap-2 py-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest mr-2 py-1">
              Factores de riesgo contribuyentes
            </span>
            {activeFactors.map((factor: any, i: number) => (
              <RiskFactorTag
                key={`factor-tag-${i}`}
                label={factor.label}
                value={factor.value}
                color={factor.color || "amber"}
              />
            ))}
          </div>

          {/* Digital Twin Simulator & AI Reasoning Module */}
          <div className="py-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <DigitalTwinSimulator
                currentSbp={lastReading.sbp || 120}
                currentUfr={lastReading.ufRate || 10.5}
                riskScore={lastReading.riskScore || 20}
              />
            </div>
            <div className="xl:col-span-1 h-[400px] xl:h-[500px]">
              <AIReasoningTerminal
                patient={patient}
                lastReading={lastReading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Charts */}
            <div className="space-y-4">
              <Card className="bg-[#111] border-white/5 shadow-2xl">
                <CardHeader className="py-3 px-4 flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                    <Activity size={14} className="text-rose-400" /> Presión
                    Arterial — Sesión en curso
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[240px] px-2 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#222"
                      />
                      <XAxis
                        dataKey="minuteOfSession"
                        stroke="#444"
                        fontSize={9}
                        tickFormatter={(v) => `${v}m`}
                        hide
                      />
                      <YAxis
                        domain={[40, 200]}
                        stroke="#444"
                        fontSize={9}
                        tickCount={6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid #333",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                      />
                      <ReferenceLine
                        y={90}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="sbp"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        dot={false}
                        name="PAS"
                        animationDuration={1000}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="dbp"
                        stroke="#0ea5e9"
                        strokeWidth={1}
                        dot={false}
                        name="PAD"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-white/5">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                    <Activity size={14} className="text-rose-400" /> Frecuencia
                    Cardíaca
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[180px] px-2 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readings}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#222"
                      />
                      <YAxis domain={[50, 130]} stroke="#444" fontSize={9} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid #333",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hr"
                        stroke="#f472b6"
                        strokeWidth={1.5}
                        dot={false}
                        name="FC"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-[#111] border-white/5">
                <CardHeader className="py-3 px-4 flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                    <TrendingUp size={14} className="text-sky-400" /> Score de
                    riesgo HID — Evolución
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[240px] px-2 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                      <defs>
                        <linearGradient
                          id="riskGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0ea5e9"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0ea5e9"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#222"
                      />
                      <YAxis domain={[0, 100]} stroke="#444" fontSize={9} />
                      <ReferenceLine
                        y={45}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{
                          value: "Alto",
                          fill: "#f59e0b",
                          fontSize: 9,
                          position: "right",
                        }}
                      />
                      <ReferenceLine
                        y={65}
                        stroke="#f43f5e"
                        strokeDasharray="3 3"
                        label={{
                          value: "Muy alto",
                          fill: "#f43f5e",
                          fontSize: 9,
                          position: "right",
                        }}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="riskScore"
                        stroke="#0ea5e9"
                        fill="url(#riskGrad)"
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-white/5">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                    <Droplet size={14} className="text-sky-400" /> UF Removida
                    Acumulada
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[180px] px-2 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#222"
                      />
                      <YAxis
                        domain={[0, patient.targetUfVolume * 1.1]}
                        stroke="#444"
                        fontSize={9}
                      />
                      <Area
                        type="monotone"
                        dataKey="ufRemoved"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Control de Lazo Cerrado (Biofeedback) */}
          <ClosedLoopBiofeedback
            patient={patient}
            readings={readings}
            lastReading={lastReading}
          />

          {/* Fusión de Datos Lab - Prescripción */}
          <SodiumUFProfile
            patient={patient}
            sessionDurationParams={sessionDurationParams}
            currentMinute={lastReading.minuteOfSession}
          />

          {/* Intervention Log & HID Episodes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            <Card className="bg-[#111] border-white/5 overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                  <ClipboardList size={14} className="text-emerald-400" />{" "}
                  Registro de Intervenciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InterventionLogger patientId={id} />
              </CardContent>
            </Card>

            <Card className="bg-[#1a1010]/20 border-rose-500/10">
              <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 border-b border-rose-500/5">
                <AlertCircle size={14} className="text-rose-500" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">
                  Episodios de HID registrados ({patient.hidEpisodes})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-1">
                  {readings
                    .filter((r) => r.sbp < 90)
                    .slice(-5)
                    .map((r, i) => (
                      <div
                        key={`hid-log-${i}`}
                        className="flex items-center gap-4 text-[10px] py-1 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded"
                      >
                        <span className="text-muted-foreground w-12">
                          Min. {r.minuteOfSession}
                        </span>
                        <span className="text-rose-500 font-bold w-32">
                          PAS {r.sbp}/{r.dbp} mmHg
                        </span>
                        <span className="text-muted-foreground">
                          FC {r.hr} lpm
                        </span>
                      </div>
                    ))}
                  {readings.filter((r) => r.sbp < 90).length === 0 && (
                    <p className="text-[10px] text-muted-foreground/50 italic text-center py-4 uppercase tracking-widest font-bold">
                      No se han registrado episodios de HID en esta sesión
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "laboratorios" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DryWeightOptimizer patient={patient} />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="bg-[#111] border-white/5">
              <CardHeader className="py-3 px-4 border-b border-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                  <Users size={14} className="text-sky-400" /> Datos del
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <SimpleRow label="Edad" value={`${patient.age} años`} />
                <SimpleRow label="Sexo" value={patient.sex} />
                <SimpleRow
                  label="Etiología SRC"
                  value={patient.etiology || "-"}
                />
                <SimpleRow
                  label="Disf. Autonómica"
                  value={patient.autonomicDysfunction ? "Sí" : "No"}
                  highlight={!!patient.autonomicDysfunction}
                />
                <SimpleRow
                  label="Fracción Eyección"
                  value={patient.ejectionFraction ? `${patient.ejectionFraction}%` : "-"}
                  highlight={patient.ejectionFraction ? patient.ejectionFraction < 50 : false}
                />
                <SimpleRow
                  label="Lista Trasplante"
                  value={patient.transplantList ? "Activo" : "No"}
                />
                <SimpleRow
                  label="Peso seco"
                  value={`${patient.dryWeight} kg`}
                />
                <SimpleRow
                  label="IMC aprox."
                  value={`${(patient.dryWeight / 1.75 ** 2).toFixed(1)} kg/m²`}
                  highlight={(patient.dryWeight / 1.75 ** 2) < 21}
                />
                <SimpleRow
                  label="Vintage HD"
                  value={`${patient.dialysisVintage} meses`}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5">
              <CardHeader className="py-3 px-4 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                  <Droplet size={14} className="text-rose-400" /> Labs Recientes
                </CardTitle>
                <div className="text-[8px] text-muted-foreground uppercase">{patient.historicalLabs?.[0]?.date.split('-').slice(1).join('/') || "Mes Actual"}</div>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <SimpleRow
                  label="Albúmina"
                  value={`${patient.historicalLabs?.[0]?.albumin || patient.albumin} g/dL`}
                  highlight={(patient.historicalLabs?.[0]?.albumin || patient.albumin) < 3.5}
                />
                <SimpleRow
                  label="Hemoglobina"
                  value={`${patient.historicalLabs?.[0]?.hemoglobin || patient.hemoglobin} g/dL`}
                  highlight={(patient.historicalLabs?.[0]?.hemoglobin || patient.hemoglobin) < 10}
                />
                <SimpleRow
                  label="Kt/V (sp)"
                  value={`${patient.historicalLabs?.[0]?.spKtv || '?'} `}
                  highlight={(patient.historicalLabs?.[0]?.spKtv || 1.3) < 1.2}
                />
                <SimpleRow
                  label="Fósforo"
                  value={`${patient.historicalLabs?.[0]?.phosphorus || '?'} mg/dL`}
                  highlight={(patient.historicalLabs?.[0]?.phosphorus || 4.5) > 5.5}
                />
                <SimpleRow
                  label="Calcio"
                  value={`${patient.historicalLabs?.[0]?.calcium || '?'} mg/dL`}
                />
                <SimpleRow
                  label="PTH Intacta"
                  value={`${patient.historicalLabs?.[0]?.pth || '?'} pg/mL`}
                  highlight={(patient.historicalLabs?.[0]?.pth || 250) > 300}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5">
              <CardHeader className="py-3 px-4 border-b border-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                  <Activity size={14} className="text-violet-400" /> Biomarcadores
                  Avanzados
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <SimpleRow
                  label="BNP"
                  value={`${patient.historicalLabs?.[0]?.bnp || '?'} pg/mL`}
                  highlight={(patient.historicalLabs?.[0]?.bnp || 0) > 300}
                />
                <SimpleRow
                  label="Troponina T"
                  value={`${patient.historicalLabs?.[0]?.tnt || '?'} ng/L`}
                  highlight={(patient.historicalLabs?.[0]?.tnt || 0) > 14}
                />
                <SimpleRow
                  label="Proteína C Reactiva"
                  value={`${patient.historicalLabs?.[0]?.pcr || '?'} mg/dL`}
                  highlight={(patient.historicalLabs?.[0]?.pcr || 0) > 1.0}
                />
                <SimpleRow
                  label="Ferritina"
                  value={`${patient.historicalLabs?.[0]?.ferritin || '?'} ng/mL`}
                  highlight={(patient.historicalLabs?.[0]?.ferritin || 0) > 500}
                />
                <SimpleRow
                  label="Sat. Transferrina"
                  value={`${patient.historicalLabs?.[0]?.tsat || '?'} %`}
                  highlight={(patient.historicalLabs?.[0]?.tsat || 30) < 20}
                />
                <SimpleRow
                  label="BUN Pre/Post"
                  value={`${patient.historicalLabs?.[0]?.bunPre || '?'}/${patient.historicalLabs?.[0]?.bunPost || '?'} mg/dL`}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-white/5">
              <CardHeader className="py-3 px-4 border-b border-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                  <Settings size={14} className="text-amber-400" /> Prescripción
                  HD
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <SimpleRow
                  label="Duración sesión"
                  value={`${patient.sessionDuration} h`}
                />
                <SimpleRow
                  label="Vol. UF objetivo"
                  value={`${patient.targetUfVolume} L`}
                />
                <SimpleRow
                  label="Flujo sanguíneo"
                  value={`${patient.bloodFlowRate} mL/min`}
                />
                <SimpleRow
                  label="Temp. dializante"
                  value={`${patient.dialysateTemp} °C`}
                />
                <SimpleRow
                  label="Na dializante"
                  value={`${patient.sodiumDialysate} mEq/L`}
                />
              </CardContent>
            </Card>
          </div>

          <AnemiaManager patient={patient} />
          <PatientClinicalSummary patient={patient} />
          <BioimpedancePhenotype patient={patient} lastReading={lastReading} />
          <BodyCompositionChart patient={patient} lastReading={lastReading} />
        </div>
      )}

      {activeTab === "historial" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NursingNotesMiner patient={patient} />
          <SBARNoteGenerator
            patient={patient}
            lastReading={lastReading}
            activeFactors={activeFactors}
          />
        </div>
      )}

      {activeTab === "vascular" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AVFThrombosisPredictor patient={patient} lastReading={lastReading} />
        </div>
      )}
    </div>
  );
}

function MetricCardSmall({
  label,
  value,
  unit,
  subValue,
  status,
  isLarge,
}: any) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-lg p-4 flex flex-col justify-between h-[100px] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </span>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "font-mono font-bold tracking-tighter leading-none",
              isLarge ? "text-3xl" : "text-2xl",
              status === "destructive"
                ? "text-rose-500"
                : status === "warning"
                  ? "text-amber-500"
                  : "text-foreground",
            )}
          >
            {value}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {unit}
          </span>
        </div>
        {subValue && (
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-widest mt-1",
              status === "destructive"
                ? "text-rose-500/70"
                : "text-muted-foreground/50",
            )}
          >
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

function SimpleRow({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
      <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-mono font-bold",
          highlight ? "text-amber-500" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function InterventionActionItem({ text, priority, type }: any) {
  const isUrgent = priority === "urgente";
  return (
    <div
      className={cn(
        "border-l-4 p-4 rounded-r-lg group transition-colors",
        isUrgent
          ? "bg-rose-500/5 border-rose-500 hover:bg-rose-500/10"
          : "bg-emerald-500/5 border-emerald-500 hover:bg-emerald-500/10",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold">{text}</h4>
            <Badge
              className={cn(
                "h-4 text-[8px] font-black uppercase px-2",
                isUrgent ? "bg-rose-500" : "bg-emerald-500",
              )}
            >
              {isUrgent ? "URGENTE" : "RECOMENDADA"}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed max-w-2xl">
            {isUrgent
              ? "Actuar AHORA: suspender UF + Trendelenburg + avisar médico"
              : "Optimización proactiva para reducir riesgo de evento hemodinámico."}
          </p>
          <p className="text-[9px] text-muted-foreground/40 italic font-mono">
            Evidencia: KDOQI + PMC 2023 — UFR {">"} 10-13 mL/kg/h se asocia a
            2-3x mayor riesgo de HID.
          </p>
        </div>
        {isUrgent ? (
          <AlertCircle size={18} className="text-rose-500" />
        ) : (
          <Settings size={18} className="text-emerald-500" />
        )}
      </div>
    </div>
  );
}

function generatePredictiveHorizon(
  readings: any[],
  currentPhase: string,
  patient: any,
) {
  // Use last 20 points as per Piccoli NDT 2023 evidence
  const last20 = readings.slice(-20);
  if (last20.length < 3) return [];

  // Simulate LOESS smoothing local slope over the window
  // Give more weight to the most recent elements
  let weightedSumSbp = 0;
  let weightSum = 0;
  for (let i = 0; i < last20.length; i++) {
    const weight = (i + 1) / last20.length; // linear weight increase
    weightedSumSbp += last20[i].sbp * weight;
    weightSum += weight;
  }
  const smoothedLastSbp = weightedSumSbp / weightSum;
  
  // Calculate a recent gradient (simulate local regression)
  const recentSlice = last20.slice(-5);
  const recentSlope = (recentSlice[recentSlice.length - 1].sbp - recentSlice[0].sbp) / recentSlice.length;

  const points = [];
  for (let min = 5; min <= 60; min += 5) {
    let predictedSbp = smoothedLastSbp + recentSlope * (min / 2);
    
    // Factors: IDWG / UFR effect (BestShape Project)
    const ufrRaw = (patient.targetUfVolume * 1000) / (patient.sessionDuration * patient.dryWeight);
    const ufrImpact = (ufrRaw - 10) * 0.5 * (min / 10);
    predictedSbp -= Math.max(0, ufrImpact);
    
    // Integrate AI intervention effects based on RiskScore (Kim et al.)
    const risk = patient.currentReading?.riskScore || 0;
    if (risk >= 45) {
        // AI intervention is active, counteracting the slope gradually
        predictedSbp += 1.5 * (min / 5); 
    } else if (currentPhase === "stable") {
      const target = 130;
      predictedSbp += (target - predictedSbp) * 0.05 * (min / 10);
    }
    
    points.push({
      minute: min,
      sbp: Math.round(Math.max(60, Math.min(200, predictedSbp))),
    });
  }
  return points;
}

function getRecommendations(patient: any, reading: any, phase: string) {
  const recs = [];
  if (reading.sbp < 105 || reading.riskScore > 65) {
    recs.push({
      priority: "urgente",
      text: "Reducir tasa de ultrafiltración (UFR)",
      type: "prescription",
    });
    recs.push({
      priority: "urgente",
      text: "Evaluación sintomática activa",
      type: "monitoring",
    });
  }

  recs.push({
    priority: "alta",
    text: "Extender duración de sesión",
    type: "prescription",
  });
  recs.push({
    priority: "alta",
    text: "Suspender ingesta de alimentos intradialítica",
    type: "monitoring",
  });

  return recs;
}

function RiskTimelineCard({
  time,
  probability,
  projectedSbp,
  factors,
  action,
  isUrgent,
}: any) {
  return (
    <div className="space-y-4 relative">
      <div
        className={cn(
          "absolute -left-[23px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0a0a0a] z-10 hidden md:block",
          isUrgent
            ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            : "bg-sky-400",
        )}
      />

      <div
        className={cn(
          "bg-[#111] border rounded-xl p-6 space-y-5 relative overflow-hidden transition-all hover:border-white/10",
          isUrgent ? "border-rose-500/30" : "border-white/5",
        )}
      >
        {isUrgent && (
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest">
            Crítico
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isUrgent ? "bg-rose-500 animate-pulse" : "bg-rose-500",
                )}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                {time}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-3xl font-mono font-bold leading-none">
              {probability}%
            </div>
            <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
              prob. HID
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-xl font-mono font-bold text-amber-500">
              ~{projectedSbp} mmHg
            </div>
            <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
              PAS proyectada
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {factors.map((f: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider"
            >
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  i === 0 ? "bg-amber-500" : "bg-muted-foreground/30",
                )}
              />
              <span className="opacity-60">{f.label}:</span>
              <span className={cn(i === 0 && "text-amber-500/80")}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "pt-4 border-t border-white/5 mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
            isUrgent ? "text-rose-500" : "text-amber-500",
          )}
        >
          <ArrowLeft size={12} className="rotate-180" /> {action}
        </div>
      </div>
    </div>
  );
}

function RiskFactorTag({ label, value, color }: any) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest",
        color === "amber"
          ? "bg-amber-500/5 border-amber-500/20 text-amber-500/70"
          : "bg-rose-500/5 border-rose-500/20 text-rose-500/70",
      )}
    >
      <div
        className={cn(
          "w-1 h-1 rounded-full",
          color === "amber" ? "bg-amber-500" : "bg-rose-500",
        )}
      />
      <span>{label}</span>
      <span className="opacity-50">{value}</span>
    </div>
  );
}

function UsersIcon({ size, className }: any) {
  return <Users size={size} className={className} />;
}
