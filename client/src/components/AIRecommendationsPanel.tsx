import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, Cpu, Thermometer, Droplets, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Recommendation = {
  id: string;
  type: 'uf' | 'temp' | 'time' | 'other';
  title: string;
  description: string;
  value: string;
};

export function AIRecommendationsPanel({ 
  recommendations, 
  onAccept, 
  onReject 
}: { 
  recommendations: Recommendation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { toast } = useToast();
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});

  const handleFeedback = (recId: string, level: string) => {
    setFeedbackGiven(prev => ({ ...prev, [recId]: level }));
    toast({
      title: "Feedback Registrado",
      description: `Se ha guardado: "${level}". Esto ayudará a refinar el modelo predictivo.`,
    });
    // Here you would typically also make an API call to save the feedback
  };

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="bg-amber-500/5 border-amber-500/20 shadow-none relative overflow-hidden mt-6">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
      <CardHeader className="pb-3 border-b border-amber-500/10 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
          <Cpu size={16} className="animate-pulse" />
          Recomendaciones Prescriptivas IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid gap-4 lg:grid-cols-2">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
            <div className="flex gap-3 mb-4">
              <div className={`p-2 rounded-full h-fit flex-none ${
                rec.type === 'uf' ? 'bg-sky-500/10 text-sky-400' :
                rec.type === 'temp' ? 'bg-rose-500/10 text-rose-400' :
                rec.type === 'time' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-purple-500/10 text-purple-400'
              }`}>
                {rec.type === 'uf' && <Droplets size={16} />}
                {rec.type === 'temp' && <Thermometer size={16} />}
                {rec.type === 'time' && <Clock size={16} />}
                {rec.type === 'other' && <AlertCircle size={16} />}
              </div>
              <div className="w-full">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{rec.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                <div className="mt-2 inline-flex border py-1 px-2 border-white/10 rounded text-[10px] font-mono text-white/90 font-bold bg-[#111]">
                  Ajuste sugerido: <span className="text-amber-400 ml-1">{rec.value}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full h-8 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  onClick={() => {
                    toast({
                      title: "Recomendación Aceptada",
                      description: `Se ha aplicado el ajuste: ${rec.value} y enviado al HL7.`,
                    });
                    onAccept(rec.id);
                  }}
                >
                  <Check size={14} className="mr-2" /> Aceptar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full h-8 text-[10px] uppercase font-bold tracking-widest bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                  onClick={() => {
                    toast({
                      title: "Recomendación Rechazada",
                      description: "El parámetro actual se mantendrá sin cambios.",
                      variant: "destructive"
                    });
                    onReject(rec.id);
                  }}
                >
                  <X size={14} className="mr-2" /> Rechazar
                </Button>
              </div>

              {/* Feedback Mechanism */}
              <div className="flex flex-col gap-1.5 pt-3 border-t border-white/5">
                <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  ¿Qué tan útil fue esta sugerencia?
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!!feedbackGiven[rec.id]}
                    className={`h-7 px-2 text-[9px] font-bold ${feedbackGiven[rec.id] === 'útil' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    onClick={() => handleFeedback(rec.id, 'útil')}
                  >
                    👍 Útil
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!!feedbackGiven[rec.id]}
                    className={`h-7 px-2 text-[9px] font-bold ${feedbackGiven[rec.id] === 'poco útil' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    onClick={() => handleFeedback(rec.id, 'poco útil')}
                  >
                    😐 Poco útil
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!!feedbackGiven[rec.id]}
                    className={`h-7 px-2 text-[9px] font-bold ${feedbackGiven[rec.id] === 'incorrecta' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    onClick={() => handleFeedback(rec.id, 'incorrecta')}
                  >
                    👎 Incorrecta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
