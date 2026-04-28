import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Activity, AlertTriangle, ChevronRight, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NursingNotesMiner({ patient }: any) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Raw mock nursing notes (últimos 6 meses: nov 2025 - abr 2026)
  const rawNotes = [
    { date: "2025-11-20 10:15", nurse: "L. Méndez", text: "Paciente refiere sentirse un poco mareado al llegar. Peso inicial 72.5kg. Se inicia conexión sin incidencias. Refiere que anoche tuvo calambres leves." },
    { date: "2026-01-15 11:30", nurse: "L. Méndez", text: "Durante la sesión de hoy. Asintomático las primeras horas, luego presentó fatiga leve." },
    { date: "2026-03-10 12:45", nurse: "J. Ruiz", text: "Ligera hipotensión (100/60) corregida con posición en trendelenburg y pausa de UF por 10 min. Paciente reporta náuseas." },
    { date: "2026-04-22 14:00", nurse: "J. Ruiz", text: "Desconexión completa tras la sesión de hoy. Sangrado post punción cohíbido. Se retira caminando con calambres moderados." }
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <Card className="bg-[#0a0a0a] border-white/5 shadow-xl mt-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors" />
      <CardHeader className="py-4 px-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-400">
              <BrainCircuit size={16} /> Procesamiento de Notas (NLP)
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70 mt-1 flex items-center gap-2">
               <FileText size={10} /> Extracción Automatizada de Síntomas Intradialíticos (PROMs)
            </CardDescription>
          </div>
          {!analyzed && !analyzing && (
            <button
              onClick={handleAnalyze}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2"
            >
              <Search size={14} /> Minería de Datos
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
         <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Raw Notes Column */}
            <div className="p-6">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                 <FileText size={14} className="text-white/40" /> Notas Libres de Enfermería
               </h4>
               <div className="space-y-4">
                 {rawNotes.map((note, idx) => (
                    <div key={idx} className="bg-[#111] p-3 rounded-lg border border-white/5">
                       <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                         <span>{note.date}</span>
                         <span>Enf. {note.nurse}</span>
                       </div>
                       <p className={`text-[11px] leading-relaxed ${analyzed ? 'text-white/50' : 'text-white/80'}`}>
                          {analyzed ? (
                            note.text.split(/(mareado|calambres|hipotensión|náuseas|fatiga)/gi).map((part, i) => {
                              const isMatch = /^(mareado|calambres|hipotensión|náuseas|fatiga)$/i.test(part);
                              return isMatch ? (
                                <span key={i} className="bg-indigo-500/20 text-indigo-300 font-bold px-1 rounded">{part}</span>
                              ) : <span key={i}>{part}</span>
                            })
                          ) : note.text}
                       </p>
                    </div>
                 ))}
               </div>
            </div>

            {/* Extracted NLP Column */}
            <div className="p-6 bg-gradient-to-b from-transparent to-indigo-500/5">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                 <Activity size={14} className="text-indigo-400" /> Síntomas Estructurados
               </h4>

               {analyzing ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                   <div className="text-center">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Analizando Sintaxis</p>
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Modelo NER extrayendo entidades biomédicas...</p>
                   </div>
                 </div>
               ) : analyzed ? (
                 <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="bg-[#111] border border-white/5 rounded-lg p-4">
                       <h5 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-3 border-b border-indigo-500/10 pb-2">Entidades Extraídas (SNOMED-CT)</h5>
                       
                       <div className="space-y-3">
                         <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                            <span className="text-[11px] font-medium text-white/90">Hipotensión</span>
                            <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20">Crítico</Badge>
                         </div>
                         <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                            <span className="text-[11px] font-medium text-white/90">Calambres Musculares</span>
                            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">Moderado</Badge>
                         </div>
                         <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                            <span className="text-[11px] font-medium text-white/90">Náuseas</span>
                            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">Moderado</Badge>
                         </div>
                         <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                            <span className="text-[11px] font-medium text-white/90">Mareos</span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Leve</Badge>
                         </div>
                         <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                            <span className="text-[11px] font-medium text-white/90">Fatiga Post-Diálisis</span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Leve</Badge>
                         </div>
                       </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 relative overflow-hidden">
                       <AlertTriangle size={80} className="absolute -right-4 -bottom-4 text-indigo-500/10" />
                       <h5 className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 mb-2">Conclusión Algorítmica</h5>
                       <p className="text-[11px] text-white/80 leading-relaxed font-medium relative z-10">
                         Alta densidad de síntomas asociados a <span className="text-indigo-400">depleción de volumen intravascular</span> (varios episodios en el último semestre). Se recomienda revisión inmediata del peso seco objetivo y curva de ultrafiltración.
                       </p>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-16 opacity-30">
                   <BrainCircuit size={48} className="mb-4 text-white/40" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-center px-8">
                     Esperando ejecución de modelo NLP para extracción de entidades clínicas.
                   </p>
                 </div>
               )}
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
