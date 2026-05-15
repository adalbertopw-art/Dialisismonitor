import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileText, CheckCircle2, History, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from "@/lib/utils";

export function ClinicalHistoryNote({ patient, lastReading }: any) {
  const [copied, setCopied] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [expandedNote, setExpandedNote] = useState<number | null>(0); // First expanded by default

  if (!patient || !lastReading) return null;

  const sbp = lastReading.sbp || 120;
  const dbp = lastReading.dbp || 80;
  const hr = lastReading.hr || lastReading.heartRate || 75;
  const hgbScore = patient.hemoglobin < 10 
    ? 'Anormal, por debajo de meta para ERC' 
    : patient.hemoglobin >= 10 && patient.hemoglobin <= 11.5 
      ? 'Normal, en meta terapéutica' 
      : 'Anormal, por encima de meta';

  const albScore = patient.albumin < 3.8 
    ? 'Anormal, disminución de reservas viscerales, riesgo de malnutrición' 
    : 'Normal, adecuado estado nutricional visceral';

  const rxSbp = sbp > 140 ? 'elevadas' : sbp < 100 ? 'limítrofes requiriendo ajuste hídrico' : 'controladas intradiálisis';
  const rxHgb = patient.hemoglobin < 10 
    ? 'Cursa con anemia renal en rango subóptimo, se requiere ajuste de dosis de agente estimulante de eritropoyesis y suplencia de hierro endovenoso.' 
    : 'Anemia renal controlada sin requerimientos de ajustes agudos.';
  const rxAlb = patient.albumin < 3.8 
    ? 'un deterioro nutricional leve a moderado. Se indicará suplementación hiperproteica intradiálisis.' 
    : 'un estado basal satisfactorio sin estigmas de desgaste proteico energético severo.';

  const isDiabetic = !!patient.diabetic;
  const isCardiopath = !!patient.cardiopathy;

  const note = `Subjetivo:
Enfermedad renal crónica estadio 5, en hemodiálisis de mantenimiento.
Comorbilidades: ${isDiabetic ? 'Diabetes Mellitus tipo 2, ' : ''}${isCardiopath ? 'Cardiopatía isquémica, ' : ''}Hipertensión arterial sistémica secundaria.
Síntomas: Paciente refiere adecuado estado general actual, niega disnea, dolor torácico, palpitaciones o edema de miembros inferiores de nuevo inicio.

Objetivo:
Paciente en sesión de hemodiálisis en su minuto ${lastReading.minuteOfSession || 0} de un total de ${patient.sessionDuration} minutos planeados.
Estado del acceso: Fístula arteriovenosa o catéter venoso central funcionante, buen flujo sanguíneo (${patient.bloodFlowRate} ml/min), sin signos locales de infección, sangrado o disfunción.
Examen físico: Peso seco meta: ${patient.dryWeight} kg. Signos vitales actuales intra-sesión: PA ${sbp}/${dbp} mmHg, FC ${hr} lpm. 
Ultrafiltración programada: ${patient.targetUfVolume} L, con volumen removido a la fecha de ${lastReading.ufRemoved ? lastReading.ufRemoved.toFixed(2) : 0} L.

Interpretación de laboratorios del mes en curso:
- Hemoglobina: ${patient.hemoglobin} g/dL (${hgbScore}).
- Albúmina: ${patient.albumin} g/dL (${albScore}).
- Perfil restante: Se asume hiperparatiroidismo secundario en metas, Fósforo y Calcio sérico en parámetros aceptables.

Análisis:
- sistema renal y adecuación dialítica: Paciente con ERC estadio 5 anúrico, en terapia de reemplazo renal continuo. Acorde al volumen de ultrafiltración proyectado y flujos actuales de bomba, se mantiene adecuada depuración de solutos medios y bajos.
- sistema cardiovascular y estado tensional: Cursa con cifras tensionales ${rxSbp}. Se optimizará o mantendrá peso seco actual acorde a tolerancia intradiálisis. Riesgo hemodinámico proyectado: ${lastReading.riskCategory || 'Bajo'} (Score: ${Math.round(lastReading.riskScore || 0)}).
- sistema hematológico y anemia renal: ${rxHgb}
- metabolismo óseo mineral: En rangos bioquímicos aceptables para estadio renal, mantenido bajo tratamiento actual con quelantes no cálcicos y vitamina D activa en los interdialíticos.
- estado nutricional: Parámetros viscerales (${patient.albumin} g/dL) sugieren ${rxAlb}
- control metabólico y electrolítico: Sin evidencia de alteraciones agudas del potasio ni desequilibrio ácido base descompensado en el ciclo actual. ${isDiabetic ? 'Se mantiene control glucémico sin hipoglucemias reportadas en sala. ' : ''}
- acceso vascular: Permeabilidad conservada, posibilitando mantener las tasas de flujo vascular pautadas de ${patient.bloodFlowRate} ml/min sin alterar presiones de retorno venoso o entrada en el circuito extracorpóreo.

Plan:
1. Continuar hemodiálisis crónica, ${Math.round((patient.sessionDuration / 60) * 10) / 10} horas por sesión, 3 veces por semana.
2. Mantener peso seco prescripto de ${patient.dryWeight} kg.
3. Tratamiento farmacológico:
   - Eritropoyetina alfa (según titulación periódica)
   - Hierro sacarosa
   - Sevelamero 800mg (con comidas principales)
   - Complejo B 1 tableta posdiálisis
   - Amlodipino 5mg/día
   ${isDiabetic ? '- Insulina basal tipo Glargina s/esquema endocrinológico\n   ' : ''}${isCardiopath ? '- Ácido acetilsalicílico 100mg/día\n   - Atorvastatina 20mg/día\n   ' : ''}
4. Estudios solicitados: Analíticas mensuales de control según protocolo de centro ambulatorio.
5. Justificación para seguir diálisis: Paciente con falla renal terminal estadio 5 con riesgo vital inminente suspendiéndose el soporte, sin posibilidad de tratamiento médico conservador que frene progresión a uremia clínica sistémica, hiperkalemia y congestión refractaria.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock history data with more detail
  const historyNotes = [
    { 
      date: "18 Abr 2026", 
      session: "Sesión 142",
      stats: { uf: "2.1 L", preWeight: "70.5 kg", postWeight: "68.4 kg", avgBP: "135/82 mmHg", ktv: "1.32" },
      note: "Paciente cursa sesión sin complicaciones hemodinámicas. Toleró meta de UF de 2.1L. Flujos de acceso vascular adecuados. Examen físico post-diálisis sin edemas.",
      trendData: [ { time: '0h', sys: 140 }, { time: '1h', sys: 135 }, { time: '2h', sys: 130 }, { time: '3h', sys: 132 }, { time: '4h', sys: 128 } ]
    },
    { 
      date: "15 Ene 2026", 
      session: "Sesión 103",
      stats: { uf: "2.8 L", preWeight: "71.2 kg", postWeight: "68.4 kg", avgBP: "110/65 mmHg", ktv: "1.28" },
      note: "Sesión con episodios de hipotensión (90/55) en la hora 3. Se administró bolo de ssN 150cc y se ajustó perfil de sodio. Se sugiere reevaluar peso seco.",
      trendData: [ { time: '0h', sys: 130 }, { time: '1h', sys: 120 }, { time: '2h', sys: 105 }, { time: '3h', sys: 90 }, { time: '4h', sys: 110 } ]
    },
    { 
      date: "12 Nov 2025", 
      session: "Sesión 75",
      stats: { uf: "1.9 L", preWeight: "70.3 kg", postWeight: "68.4 kg", avgBP: "142/85 mmHg", ktv: "1.35" },
      note: "Sesión habitual sin eventualidades. Ultrafiltración según meta. Laboratorios de control tomados, pendiente revisión en próxima consulta.",
      trendData: [ { time: '0h', sys: 145 }, { time: '1h', sys: 142 }, { time: '2h', sys: 138 }, { time: '3h', sys: 140 }, { time: '4h', sys: 135 } ]
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-border bg-card/10 hover:bg-card/30">
          <FileText size={14} className="mr-2" /> Evolución
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl bg-background border-border shadow-2xl p-0 overflow-hidden flex flex-col h-[85vh]">
        <DialogHeader className="p-6 border-b border-border bg-emerald-500/5 shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-[14px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-400">
              <FileText size={16} /> Evolución Clínica Nefrológica
            </DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
              {viewHistory ? "Historial de Evoluciones Previas e Histórico de Sesiones" : "Generada a partir de la sesión actual"}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewHistory(!viewHistory)}
              className="h-8 text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted/50"
            >
              <History size={12} className="mr-2" />
              {viewHistory ? "Ver Evolución Actual" : "Historial y Sesiones"}
            </Button>
            {!viewHistory && (
              <Button 
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "h-8 text-[10px] uppercase font-bold tracking-widest transition-colors",
                  copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30" : "bg-emerald-600 hover:bg-emerald-500 text-foreground"
                )}
              >
                {copied ? <CheckCircle2 size={12} className="mr-2" /> : <Copy size={12} className="mr-2" />}
                {copied ? "Copiado" : "Copiar a HIS"}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {viewHistory ? (
            <ScrollArea className="h-full">
               <div className="p-6 space-y-4">
                 {historyNotes.map((item, i) => (
                   <div key={i} className={cn("bg-card border border-border rounded-lg overflow-hidden transition-all duration-300", expandedNote === i ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "")}>
                     <div 
                       className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                       onClick={() => setExpandedNote(expandedNote === i ? null : i)}
                     >
                       <div className="flex items-center gap-4">
                         <div className="text-[12px] uppercase tracking-widest font-bold text-emerald-500">{item.date}</div>
                         <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-emerald-500/30 text-emerald-400">{item.session}</Badge>
                       </div>
                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                         {expandedNote === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                       </Button>
                     </div>
                     
                     {expandedNote === i && (
                       <div className="p-5 border-t border-border animate-in slide-in-from-top-2 duration-200">
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                           <div className="flex flex-col bg-black/40 p-3 rounded-md border border-border">
                             <span className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">UF Total</span>
                             <span className="text-[13px] font-mono font-bold text-foreground">{item.stats.uf}</span>
                           </div>
                           <div className="flex flex-col bg-black/40 p-3 rounded-md border border-border">
                             <span className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">PA Promedio</span>
                             <span className="text-[13px] font-mono font-bold text-foreground">{item.stats.avgBP}</span>
                           </div>
                           <div className="flex flex-col bg-black/40 p-3 rounded-md border border-border">
                             <span className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Peso Pre</span>
                             <span className="text-[13px] font-mono font-bold text-emerald-400/80">{item.stats.preWeight}</span>
                           </div>
                           <div className="flex flex-col bg-black/40 p-3 rounded-md border border-border">
                             <span className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Peso Post</span>
                             <span className="text-[13px] font-mono font-bold text-sky-400/80">{item.stats.postWeight}</span>
                           </div>
                           <div className="flex flex-col bg-black/40 p-3 rounded-md border border-border">
                             <span className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">spKt/V</span>
                             <span className="text-[13px] font-mono font-bold text-foreground">{item.stats.ktv}</span>
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="md:col-span-2">
                             <h4 className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Nota Evolutiva Central</h4>
                             <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg text-[12px] font-mono text-emerald-100/90 leading-relaxed min-h-[100px]">
                               {item.note}
                             </div>
                           </div>
                           <div>
                             <h4 className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Tendencia PA Sistólica</h4>
                             <div className="bg-black/60 border border-border rounded-lg p-3 h-[100px]">
                               <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={item.trendData}>
                                   <Line isAnimationActive={false} type="monotone" dataKey="sys" stroke="#10b981" strokeWidth={2} dot={{ r: 2, fill: '#10b981' }} />
                                   <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                                   <RechartsTooltip 
                                     contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '6px' }}
                                     itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                   />
                                 </LineChart>
                               </ResponsiveContainer>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="bg-card border border-border rounded-lg p-6 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap selection:bg-emerald-500/30">
                {note.split('\n\n').map((section, idx) => {
                  const lines = section.split('\n');
                  const title = lines[0];
                  const content = lines.slice(1).join('\n');
                  return (
                    <div key={idx} className="mb-5 last:mb-0">
                      <div className="text-emerald-400 font-bold mb-1 text-[13px]">{title}</div>
                      <div className="text-foreground/80 pl-3 border-l-[1.5px] border-emerald-500/20">{content}</div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

