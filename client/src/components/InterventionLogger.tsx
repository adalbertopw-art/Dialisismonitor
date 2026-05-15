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
import { Trash2, PlusCircle, User, Clock, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InterventionLogger({ patientId }: { patientId: number }) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [saline, setSaline] = useState("");
  const [ufr, setUfr] = useState("");
  const [temp, setTemp] = useState("");
  const [performedBy, setPerformedBy] = useState("Enfermero/a");

  const { data: interventions = [] } = useQuery<InterventionLog[]>({
    queryKey: [`/api/patients/${patientId}/interventions`],
  });

  const resetForm = () => {
    setEditingId(null);
    setType("");
    setDetail("");
    setSaline("");
    setUfr("");
    setTemp("");
  };

  const createMutation = useMutation({
    mutationFn: (newIntervention: any) => apiRequest("POST", `/api/patients/${patientId}/interventions`, newIntervention),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/interventions`] });
      resetForm();
      toast({ title: "Intervención registrada", description: "Se ha guardado correctamente el registro." });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) => apiRequest("PATCH", `/api/interventions/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/interventions`] });
      resetForm();
      toast({ title: "Intervención actualizada", description: "Se han guardado los cambios." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/interventions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/interventions`] });
      toast({ title: "Intervención eliminada", description: "El registro ha sido eliminado." });
    }
  });

  const handleRegister = () => {
    if (!type) return;
    
    const payload = {
      interventionType: type,
      detail,
      salineVolumeMl: saline ? parseInt(saline) : undefined,
      ufrNewValue: ufr ? parseFloat(ufr) : undefined,
      dialysateTempNew: temp ? parseFloat(temp) : undefined,
      performedBy,
      timestamp: new Date().toISOString(),
      minuteOfSession: 0, // In a real app we'd get this from the state
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditClick = (log: InterventionLog) => {
    setEditingId(log.id);
    setType(log.interventionType);
    setDetail(log.detail || "");
    setSaline(log.salineVolumeMl ? String(log.salineVolumeMl) : "");
    setUfr(log.ufrNewValue ? String(log.ufrNewValue) : "");
    setTemp(log.dialysateTempNew ? String(log.dialysateTempNew) : "");
    setPerformedBy(log.performedBy || "Enfermero/a");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PlusCircle size={16} /> {editingId ? "Editar Intervención" : "Registrar Intervención"}
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
            <div className="flex items-end gap-2">
              {editingId && (
                <Button 
                  variant="outline"
                  onClick={resetForm} 
                  className="h-8 px-3 text-xs"
                >
                  Cancelar
                </Button>
              )}
              <Button 
                onClick={handleRegister} 
                disabled={!type || createMutation.isPending || updateMutation.isPending}
                className="h-8 px-4 text-xs"
              >
                {editingId ? "Actualizar" : "Registrar"}
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
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={() => handleEditClick(log)}
                      title="Editar intervención"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive/50 hover:text-destructive"
                      onClick={() => deleteMutation.mutate(log.id)}
                      title="Eliminar intervención"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
