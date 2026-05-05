import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "65",
    sex: "M",
    dialysisVintage: "12",
    dryWeight: "70",
    albumin: "3.8",
    hemoglobin: "11",
    spKtv: "1.4",
    phosphorus: "4.5",
    calcium: "9.2",
    pth: "300",
    potassium: "4.5",
    bnp: "120",
    tnt: "12",
    pcr: "0.5",
    ferritin: "400",
    tsat: "30",
    bunPre: "60",
    bunPost: "15",
    diabetic: "1",
    cardiopathy: "0",
    etiology: "Hipertensiva",
    vascularAccessType: "Fístula",
    vascularAccessLocation: "Brazo izquierdo",
    ejectionFraction: "55",
    transplantList: "0",
    autonomicDysfunction: "0",
    targetUfVolume: "2.5",
    sessionDuration: "4",
    bloodFlowRate: "300",
    dialysateTemp: "36.5",
    sodiumDialysate: "138",
    dialyzer: "Polyflux 170H"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          age: parseInt(data.age) || 65,
          dialysisVintage: parseInt(data.dialysisVintage) || 0,
          dryWeight: parseFloat(data.dryWeight) || 0,
          albumin: parseFloat(data.albumin) || 0,
          hemoglobin: parseFloat(data.hemoglobin) || 0,
          spKtv: parseFloat(data.spKtv) || 0,
          phosphorus: parseFloat(data.phosphorus) || 0,
          calcium: parseFloat(data.calcium) || 0,
          pth: parseFloat(data.pth) || 0,
          potassium: parseFloat(data.potassium) || 0,
          bnp: parseFloat(data.bnp) || 0,
          tnt: parseFloat(data.tnt) || 0,
          pcr: parseFloat(data.pcr) || 0,
          ferritin: parseFloat(data.ferritin) || 0,
          tsat: parseFloat(data.tsat) || 0,
          bunPre: parseFloat(data.bunPre) || 0,
          bunPost: parseFloat(data.bunPost) || 0,
          diabetic: parseInt(data.diabetic) || 0,
          cardiopathy: parseInt(data.cardiopathy) || 0,
          ejectionFraction: parseFloat(data.ejectionFraction) || 0,
          transplantList: parseInt(data.transplantList) || 0,
          autonomicDysfunction: parseInt(data.autonomicDysfunction) || 0,
          targetUfVolume: parseFloat(data.targetUfVolume) || 0,
          sessionDuration: parseFloat(data.sessionDuration) || 0,
          bloodFlowRate: parseFloat(data.bloodFlowRate) || 0,
          dialysateTemp: parseFloat(data.dialysateTemp) || 0,
          sodiumDialysate: parseFloat(data.sodiumDialysate) || 0
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      toast({ title: "Paciente añadido", description: "Se ha integrado al paciente a la simulación." });
      setFormData({ 
        name: "", 
        age: "65", 
        sex: "M",
        dialysisVintage: "12",
        dryWeight: "70",
        albumin: "3.8",
        hemoglobin: "11",
        spKtv: "1.4",
        phosphorus: "4.5",
        calcium: "9.2",
        pth: "300",
        potassium: "4.5",
        bnp: "120",
        tnt: "12",
        pcr: "0.5",
        ferritin: "400",
        tsat: "30",
        bunPre: "60",
        bunPost: "15",
        diabetic: "1",
        cardiopathy: "0",
        etiology: "Hipertensiva",
        vascularAccessType: "Fístula",
        vascularAccessLocation: "Brazo izquierdo",
        ejectionFraction: "55",
        transplantList: "0",
        autonomicDysfunction: "0",
        targetUfVolume: "2.5", 
        sessionDuration: "4",
        bloodFlowRate: "300",
        dialysateTemp: "36.5",
        sodiumDialysate: "138",
        dialyzer: "Polyflux 170H"
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 border-sky-500/20 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20">
          <UserPlus size={14} /> Añadir Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-card border-border text-foreground overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Paciente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm border-b border-border font-medium text-emerald-400 pb-1">Datos Básicos</h3>
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Nombre</Label>
              <Input 
                id="name" 
                className="bg-muted/50 border-border" 
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={e => setFormData(p => ({...p, name: e.target.value}))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="age" className="text-xs">Edad</Label>
                <Input 
                  id="age" type="number"
                  className="bg-muted/50 border-border" 
                  value={formData.age}
                  onChange={e => setFormData(p => ({...p, age: e.target.value}))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sex" className="text-xs">Sexo</Label>
                <Select value={formData.sex} onValueChange={v => setFormData(p => ({...p, sex: v}))}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dryWeight" className="text-xs">Peso Seco (kg)</Label>
              <Input 
                id="dryWeight" type="number" step="0.1"
                className="bg-muted/50 border-border" 
                value={formData.dryWeight}
                onChange={e => setFormData(p => ({...p, dryWeight: e.target.value}))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="etiology" className="text-xs">Etiología SRC</Label>
              <Input 
                id="etiology" 
                className="bg-muted/50 border-border" 
                value={formData.etiology}
                onChange={e => setFormData(p => ({...p, etiology: e.target.value}))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="diabetic" className="text-xs">Diabético (0/1)</Label>
                <Input 
                  id="diabetic" type="number"
                  className="bg-muted/50 border-border" 
                  value={formData.diabetic}
                  onChange={e => setFormData(p => ({...p, diabetic: e.target.value}))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardiopathy" className="text-xs">Cardiopatía (0/1)</Label>
                <Input 
                  id="cardiopathy" type="number"
                  className="bg-muted/50 border-border" 
                  value={formData.cardiopathy}
                  onChange={e => setFormData(p => ({...p, cardiopathy: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="vascularAccessType" className="text-xs">Acceso Vascular</Label>
              <Select value={formData.vascularAccessType} onValueChange={v => setFormData(p => ({...p, vascularAccessType: v}))}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Catéter">Catéter</SelectItem>
                  <SelectItem value="Fístula">Fístula (FAV)</SelectItem>
                  <SelectItem value="Injerto">Injerto (PTFE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="transplantList" className="text-xs">Lista Trasplante (0/1)</Label>
                <Input 
                  id="transplantList" type="number"
                  className="bg-muted/50 border-border" 
                  value={formData.transplantList}
                  onChange={e => setFormData(p => ({...p, transplantList: e.target.value}))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="autonomicDysfunction" className="text-xs">Disf. Autonómica (0/1)</Label>
                <Input 
                  id="autonomicDysfunction" type="number"
                  className="bg-muted/50 border-border" 
                  value={formData.autonomicDysfunction}
                  onChange={e => setFormData(p => ({...p, autonomicDysfunction: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dialysisVintage" className="text-xs">Vintage HD (meses)</Label>
              <Input 
                id="dialysisVintage" type="number"
                className="bg-muted/50 border-border" 
                value={formData.dialysisVintage}
                onChange={e => setFormData(p => ({...p, dialysisVintage: e.target.value}))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm border-b border-border font-medium text-amber-400 pb-1">Labs y Biomarcadores</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="albumin" className="text-xs">Albúmina (g/dL)</Label>
                <Input id="albumin" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.albumin} onChange={e => setFormData(p => ({...p, albumin: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hemoglobin" className="text-xs">Hb (g/dL)</Label>
                <Input id="hemoglobin" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.hemoglobin} onChange={e => setFormData(p => ({...p, hemoglobin: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="spKtv" className="text-xs">Kt/V (sp)</Label>
                <Input id="spKtv" type="number" step="0.01" className="bg-muted/50 border-border" value={formData.spKtv} onChange={e => setFormData(p => ({...p, spKtv: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phosphorus" className="text-xs">Fósforo (mg/dL)</Label>
                <Input id="phosphorus" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.phosphorus} onChange={e => setFormData(p => ({...p, phosphorus: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="calcium" className="text-xs">Calcio (mg/dL)</Label>
                <Input id="calcium" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.calcium} onChange={e => setFormData(p => ({...p, calcium: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pth" className="text-xs">PTH (pg/mL)</Label>
                <Input id="pth" type="number" step="1" className="bg-muted/50 border-border" value={formData.pth} onChange={e => setFormData(p => ({...p, pth: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bnp" className="text-xs">BNP (pg/mL)</Label>
                <Input id="bnp" type="number" step="1" className="bg-muted/50 border-border" value={formData.bnp} onChange={e => setFormData(p => ({...p, bnp: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tnt" className="text-xs">Trop T (ng/L)</Label>
                <Input id="tnt" type="number" step="1" className="bg-muted/50 border-border" value={formData.tnt} onChange={e => setFormData(p => ({...p, tnt: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
               <div className="space-y-1">
                 <Label htmlFor="ejectionFraction" className="text-xs">FEVI (%)</Label>
                 <Input id="ejectionFraction" type="number" className="bg-muted/50 border-border" value={formData.ejectionFraction} onChange={e => setFormData(p => ({...p, ejectionFraction: e.target.value}))} />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm border-b border-border font-medium text-sky-400 pb-1">Prescripción HD</h3>
            <div className="space-y-1">
              <Label htmlFor="sessionDuration" className="text-xs">Duración Sesión (h)</Label>
              <Input id="sessionDuration" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.sessionDuration} onChange={e => setFormData(p => ({...p, sessionDuration: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="targetUfVolume" className="text-xs">Obj. UF (L)</Label>
              <Input id="targetUfVolume" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.targetUfVolume} onChange={e => setFormData(p => ({...p, targetUfVolume: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bloodFlowRate" className="text-xs">Flujo Sangre (mL/min)</Label>
              <Input id="bloodFlowRate" type="number" className="bg-muted/50 border-border" value={formData.bloodFlowRate} onChange={e => setFormData(p => ({...p, bloodFlowRate: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dialysateTemp" className="text-xs">Temp. Dializ. (°C)</Label>
              <Input id="dialysateTemp" type="number" step="0.1" className="bg-muted/50 border-border" value={formData.dialysateTemp} onChange={e => setFormData(p => ({...p, dialysateTemp: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sodiumDialysate" className="text-xs">Sodio Dializ. (mEq/L)</Label>
              <Input id="sodiumDialysate" type="number" className="bg-muted/50 border-border" value={formData.sodiumDialysate} onChange={e => setFormData(p => ({...p, sodiumDialysate: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dialyzer" className="text-xs">Filtro / Membrana</Label>
              <Input id="dialyzer" className="bg-muted/50 border-border" value={formData.dialyzer} onChange={e => setFormData(p => ({...p, dialyzer: e.target.value}))} />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            onClick={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending || !formData.name}
            className="bg-sky-500 hover:bg-sky-600 text-foreground"
          >
            Añadir a la Simulación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

