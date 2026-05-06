import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { apiRequest } from "@/lib/queryClient";

export function EditPatientDialog({ patient, open, setOpen }: any) {
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (patient) {
      setFormData({
        ...patient,
        targetUfVolume: patient.targetUfVolume || 0,
        age: patient.age || 65,
        dryWeight: patient.dryWeight || 70,
        albumin: patient.albumin || 3.8,
        hemoglobin: patient.hemoglobin || 11,
      });
    }
  }, [patient]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/patients/${patient.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      toast({ title: "Paciente actualizado", description: "Se han guardado los cambios." });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="edit-name" className="text-xs">Nombre</Label>
            <Input 
              id="edit-name" 
              className="bg-muted/50 border-border" 
              value={formData.name || ''}
              onChange={e => setFormData((p: any) => ({...p, name: e.target.value}))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-age" className="text-xs">Edad</Label>
            <Input 
              id="edit-age" type="number"
              className="bg-muted/50 border-border" 
              value={formData.age || ''}
              onChange={e => setFormData((p: any) => ({...p, age: parseInt(e.target.value)}))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-dryWeight" className="text-xs">Peso Seco (kg)</Label>
            <Input 
              id="edit-dryWeight" type="number" step="0.1"
              className="bg-muted/50 border-border" 
              value={formData.dryWeight || ''}
              onChange={e => setFormData((p: any) => ({...p, dryWeight: parseFloat(e.target.value)}))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-targetUfVolume" className="text-xs">Objetivo UF (L)</Label>
            <Input 
              id="edit-targetUfVolume" type="number" step="0.1"
              className="bg-muted/50 border-border" 
              value={formData.targetUfVolume || ''}
              onChange={e => setFormData((p: any) => ({...p, targetUfVolume: parseFloat(e.target.value)}))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-sessionDuration" className="text-xs">Duración (h)</Label>
            <Input 
              id="edit-sessionDuration" type="number" step="0.1"
              className="bg-muted/50 border-border" 
              value={formData.sessionDuration || ''}
              onChange={e => setFormData((p: any) => ({...p, sessionDuration: parseFloat(e.target.value)}))}
            />
          </div>
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <Button 
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="bg-sky-500 hover:bg-sky-600 text-foreground"
          >
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
