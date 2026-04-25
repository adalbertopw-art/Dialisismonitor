import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { InterventionLog } from "@shared/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InterventionLogger({ patientId }: { patientId: number }) {
  const { toast } = useToast();
  const [type, setType] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [saline, setSaline] = useState("");
  const [ufr, setUfr] = useState("");
  const [temp, setTemp] = useState("");
  const [performedBy, setPerformedBy] = useState("Enfermero/a");

  const { data: interventions = [] } = useQuery<InterventionLog[]>({
    queryKey: [`/api/patients/${patientId}/interventions`],
  });

  const createMutation = useMutation({
    mutationFn: (newIntervention: any) => apiRequest("POST", `/api/patients/${patientId}/interventions`, newIntervention),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/interventions`] });
      setType("");
      setDetail("");
      setSaline("");
      setUfr("");
      setTemp("");
      toast({ title: "Intervención registrada", description: "Se ha guardado correctamente el registro." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/interventions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/interventions`] });
    }
  });

  const handleRegister = () => {
    if (!type) return;
    createMutation.mutate({
      interventionType: type,
      detail,
      salineVolumeMl: saline ? parseInt(saline) : undefined,
      ufrNewValue: ufr ? parseFloat(ufr) : undefined,
      dialysateTempNew: temp ? parseFloat(temp) : undefined,
      performedBy,
      timestamp: new Date().toISOString(),
      minuteOfSession: 0, // In a real app we'd get this from the state
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PlusCircle size={16} /> Registrar Intervención
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-xs">Tipo de Intervención</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="h-8 text-xs bg-background">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Posición Trendelenburg">Posición Trendelenburg</SelectItem>
                <SelectItem value="Parar UF">Parar UF</SelectItem>
                <SelectItem value="Reducir UFR">Reducir UFR</SelectItem>
                <SelectItem value="Bolo SF 100-200 mL">Bolo SF 100-200 mL</SelectItem>
                <SelectItem value="Enfriamiento dializado">Enfriamiento dializado</SelectItem>
                <SelectItem value="Perfil de sodio">Perfil de sodio</SelectItem>
                <SelectItem value="Extender sesión">Extender sesión</SelectItem>
                <SelectItem value="Midodrina">Midodrina</SelectItem>
                <SelectItem value="Reducir sodio en dializado">Reducir sodio en dializado</SelectItem>
                <SelectItem value="Ajustar peso seco">Ajustar peso seco</SelectItem>
                <SelectItem value="Administrar antihipertensivo">Administrar antihipertensivo</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="detail" className="text-xs">Detalle / Notas</Label>
            <Input 
              id="detail" 
              className="h-8 text-xs bg-background" 
              placeholder="..." 
              value={detail} 
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="performedBy" className="text-xs">Personal</Label>
            <Select value={performedBy} onValueChange={setPerformedBy}>
              <SelectTrigger id="performedBy" className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Médico">Médico</SelectItem>
                <SelectItem value="Enfermero/a">Enfermero/a</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full flex gap-4">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground">SF (mL)</Label>
              <Input type="number" className="h-8 text-xs bg-background" value={saline} onChange={(e) => setSaline(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground">Nueva UFR</Label>
              <Input type="number" className="h-8 text-xs bg-background" value={ufr} onChange={(e) => setUfr(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground">Temp D.</Label>
              <Input type="number" className="h-8 text-xs bg-background" value={temp} onChange={(e) => setTemp(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleRegister} 
                disabled={!type || createMutation.isPending}
                className="h-8 px-4 text-xs"
              >
                Registrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/30 border-border">
        <ScrollArea className="h-[200px]">
          <div className="p-4 space-y-3">
            {interventions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No hay intervenciones registradas en esta sesión.</p>
            ) : (
              interventions.slice().reverse().map((log) => (
                <div key={log.id} className="flex items-start justify-between p-2 rounded bg-background/50 border border-border/50 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{log.interventionType}</span>
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.detail && <p className="text-muted-foreground italic">"{log.detail}"</p>}
                    <div className="flex gap-3 text-[10px] text-muted-foreground uppercase">
                      <span className="flex items-center gap-1"><User size={10} /> {log.performedBy}</span>
                      {log.salineVolumeMl && <span>SF: {log.salineVolumeMl}mL</span>}
                      {log.ufrNewValue && <span>UFR: {log.ufrNewValue}</span>}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive/50 hover:text-destructive"
                    onClick={() => deleteMutation.mutate(log.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
