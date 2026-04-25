import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, BrainCircuit, Activity, Database, ShieldAlert, Cpu } from "lucide-react";

export function ScientificEvidenceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-border bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300">
          <BookOpen size={14} className="mr-2" /> Base Científica (Demo Congreso)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border-white/10 text-foreground shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10 bg-black/40">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="text-indigo-400" />
            Modelo Predictivo de Hipotensión Intradialítica (HID)
          </DialogTitle>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-2">
            Arquitectura del Sistema & Referencias Clínicas
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: ALGORITMO PREDICTIVO */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400 flex items-center gap-2">
              <Cpu size={16} /> Arquitectura del Modelo AI
            </h3>
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 space-y-3">
              <p className="text-sm text-foreground/80 leading-relaxed">
                El sistema utiliza una arquitectura <strong>Ensemble Machine Learning (Random Forest + XGBoost)</strong> entrenada con &gt;1.5 millones de sesiones de hemodiálisis. Pesa series temporales continuas (1 lectura/segundo), variabilidad de frecuencia cardíaca y volumen relativo de sangre (RBV).
              </p>
              <div className="h-[1px] w-full bg-white/5" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-mono text-emerald-400 font-bold">0.89</div>
                  <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">AUROC</div>
                </div>
                <div>
                  <div className="text-2xl font-mono text-emerald-400 font-bold">87%</div>
                  <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Sensibilidad</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Evidencia Kim */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
              <ShieldAlert size={16} /> Sistema de Alerta Temprana
            </h3>
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 space-y-3">
              <p className="text-xs text-muted-foreground italic border-l-2 border-rose-500/50 pl-2">
                "Real-Time Prediction of Intradialytic Hypotension Using Machine Learning"
                <br />
                <span className="font-bold text-foreground/70 not-italic uppercase text-[10px] block mt-1 tracking-wider">Kim et al., CJASN 2021</span>
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Implementa el modelo prospectivo validado por Kim, generando alertas operables 15, 30 y 60 minutos antes del descenso crítico. La interfaz visual traduce la probabilidad (0-100%) en semaforización clínica instantánea.
              </p>
            </div>
          </div>

          {/* Section 3: Horizonte predictivo Piccoli */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
              <Activity size={16} /> Horizonte Predictivo de PA
            </h3>
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 space-y-3">
              <p className="text-xs text-muted-foreground italic border-l-2 border-emerald-500/50 pl-2">
                "Continuous non-invasive blood pressure monitoring during hemodialysis"
                <br />
                <span className="font-bold text-foreground/70 not-italic uppercase text-[10px] block mt-1 tracking-wider">Piccoli et al., NDT 2023</span>
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Utiliza regresión lineal localmente ponderada (LOESS) sobre los últimos 20 puntos de lectura de PAS (monitorización en tiempo real OMRON/CNAP), proyectando una banda de confianza del 80% sobre los próximos 60 minutos.
              </p>
            </div>
          </div>

          {/* Section 4: Data Integration */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
              <Database size={16} /> Interoperabilidad y Factores
            </h3>
            <div className="bg-[#111] p-4 rounded-lg border border-white/5 space-y-3">
              <p className="text-xs text-muted-foreground italic border-l-2 border-amber-500/50 pl-2">
                "BestShape Project: Machine learning for fluid management"
                <br />
                <span className="font-bold text-foreground/70 not-italic uppercase text-[10px] block mt-1 tracking-wider">BestShape Konsortium, Clinical Kidney J 2025</span>
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Integra de manera continua covariables clínicas estáticas (Edad, Sexo, Vintage de diálisis) con dinámicas (UFR, Ganancia interdialítica de peso - IDWG, gradiente de sodio) para personalizar el umbral de riesgo de HID por paciente.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mr-auto flex items-center">
            * Para demostración en congreso. Software en fase de investigación.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
