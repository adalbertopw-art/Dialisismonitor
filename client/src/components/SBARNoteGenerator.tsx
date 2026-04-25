import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SBARNoteGenerator({ patient, lastReading, activeFactors }: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateNote = () => {
    setIsGenerating(true);
    setGeneratedNote(null);
    setCopied(false);

    // Simulate AI processing delay
    setTimeout(() => {
      const isUrgent = lastReading.sbp < 100 || lastReading.riskScore > 65;
      const ufRateStr = lastReading.ufRate ? lastReading.ufRate.toFixed(1) : "N/D";
      const sbpStr = lastReading.sbp || "N/D";
      const hrStr = lastReading.hr || lastReading.heartRate || "N/D";
      
      const s = `Paciente ${patient.sex === "M" ? "masculino" : "femenino"} de ${patient.age} años en sesión de hemodiálisis de mantenimiento. Presenta en el minuto ${lastReading.minuteOfSession} una PAS de ${sbpStr} mmHg con FC de ${hrStr} lpm. ${isUrgent ? "Alerta predictiva del sistema activada por alto riesgo de hipotensión intradialítica (HID)." : "Estabilidad hemodinámica mantenida hasta el momento."}`;
      
      const b = `Antecedentes relevantes (según AI Phenotype): ${activeFactors.length > 0 ? activeFactors.map((f: any) => f.label).join(", ") : "Sin factores de riesgo crítico activos"}. Meta de UF asignada con tasa actual de ${ufRateStr} mL/h/kg. Evaluación BCM previa indica estado de sobrehidratación moderada.`;
      
      const a = `El modelo predictivo (Random Forest + XGBoost) evalúa un score de riesgo de ${Math.round(lastReading.riskScore)}/100. La trayectoria de la PA muestra un ${isUrgent ? "descenso rápido >10mmHg en las últimas lecturas, sugiriendo claudicación de los mecanismos compensatorios intravasculares" : "patrón conservado con rellenado capilar adecuado"}. Riesgo proyectado a 30 mins: ${isUrgent ? "Crítico (>85%)" : "Bajo-Moderado"}.`;
      
      const r = isUrgent 
        ? `1) Pausa inmediata de UFR. 2) Posición de Trendelenburg. 3) Administrar bolo de salino isotónico (100-200cc) según protocolo. 4) Reevaluación médica de metas de peso seco y perfil de Na/UF para próximas sesiones.` 
        : `1) Continuar monitoreo estándar. 2) Mantener UFR actual. 3) Reevaluar en 30 minutos según horizonte predictivo.`;

      const note = `**[S] SITUACIÓN**\n${s}\n\n**[B] BACKGROUND (ANTECEDENTES)**\n${b}\n\n**[A] ASSESSMENT (EVALUACIÓN NLP)**\n${a}\n\n**[R] RECOMMENDATION (RECOMENDACIÓN AI)**\n${r}`;

      setGeneratedNote(note);
      setIsGenerating(false);
    }, 2500); // 2.5s simulated NLP parsing
  };

  const copyToClipboard = () => {
    if (generatedNote) {
      navigator.clipboard.writeText(generatedNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-[#0a0a0a] border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.05)] mt-4">
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-purple-500/5 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-purple-400">
            <Sparkles size={16} /> Generación de Notas NLP (SBAR)
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
            Síntesis automatizada del contexto clínico e IA predictiva para expediente electrónico
          </CardDescription>
        </div>
        {!generatedNote && !isGenerating && (
          <Button 
            onClick={generateNote}
            className="bg-purple-600 hover:bg-purple-500 h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-white ml-auto"
          >
            <FileText size={14} className="mr-2" /> Sintetizar Caso
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <div className="space-y-1 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Motor NLP Activo</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Analizando variables biométricas, fenotipo y proyecciones AI...</p>
            </div>
          </div>
        )}

        {!isGenerating && !generatedNote && (
          <div className="flex items-center justify-center py-12 opacity-40">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Presiona "Sintetizar Caso" para generar nota clínica estructurada</p>
          </div>
        )}

        {generatedNote && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-[#111] border border-white/5 rounded-lg p-5 font-mono text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap relative group">
              {/* Animated formatting for SBAR */}
              {generatedNote.split('\n\n').map((section, idx) => {
                const [title, ...contentLines] = section.split('\n');
                return (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="text-purple-400 font-bold mb-1">{title.replace(/\*\*/g, '')}</div>
                    <div className="text-foreground/80 pl-2 border-l-2 border-purple-500/20">{contentLines.join('\n')}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center pt-2">
               <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest bg-yellow-500/10 text-yellow-500/80 px-2 py-1 rounded inline-flex items-center">
                 Alerta: Contenido generado por IA. Requiere validación médica antes de firmar.
               </div>
               <Button 
                variant="outline" 
                size="sm"
                onClick={copyToClipboard}
                className={cn(
                  "h-8 text-[9px] uppercase font-bold tracking-widest transition-colors",
                  copied ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30" : "border-white/10 hover:bg-white/5"
                )}
               >
                 {copied ? <CheckCircle2 size={12} className="mr-2" /> : <Copy size={12} className="mr-2" />}
                 {copied ? "Copiado al Portapapeles" : "Copiar a Expediente (HIS)"}
               </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
