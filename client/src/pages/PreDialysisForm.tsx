import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, ChevronLeft, Info, ClipboardList, Heart } from "lucide-react";

export default function PreDialysisForm() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<any>({
    weightPreDialysis: "",
    sbpPreDialysis: "",
    dbpPreDialysis: "",
    hrPreDialysis: "",
    interdialyticWeightGain: "",
    symptomDizziness: 0,
    symptomNausea: 0,
    symptomHeadache: 0,
    symptomChestPain: 0,
    symptomCramps: 0,
    tookAntihypertensive: 0,
    antihypertensiveType: "IECA",
    notes: ""
  });

  const { data: initialData } = useQuery({
    queryKey: [`/api/patients/${id}/pre-dialysis`],
  });

  const { data: patientResponse } = useQuery({
    queryKey: [`/api/patients/${id}`],
  });
  
  const patient = (patientResponse as any)?.patient;

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/patients/${id}/pre-dialysis`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${id}/pre-dialysis`] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${id}`] });
      toast({ title: "Guardado", description: "Datos pre-diálisis registrados correctamente." });
      setLocation(`/paciente/${id}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setLocation(`/paciente/${id}`)} className="h-10 w-10 p-0 rounded-full">
          <ChevronLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold">Valoración Pre-diálisis</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 border-border">
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Info size={16} className="text-primary" /> Constantes Vitales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">Peso Pre (kg)</Label>
                  <Input 
                    id="weight" type="number" step="0.1" 
                    value={formData.weightPreDialysis} 
                    onChange={(e) => {
                      const weightPre = parseFloat(e.target.value);
                      updateField("weightPreDialysis", e.target.value);
                      if (patient && !isNaN(weightPre)) {
                        const idwg = (weightPre - patient.dryWeight).toFixed(1);
                        if (parseFloat(idwg) > 0) {
                          updateField("interdialyticWeightGain", idwg);
                        }
                      }
                    }} 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gipd" className="text-xs">GIPD (kg)</Label>
                  <Input 
                    id="gipd" type="number" step="0.1" 
                    value={formData.interdialyticWeightGain} 
                    onChange={(e) => updateField("interdialyticWeightGain", e.target.value)}
                    className="bg-background border-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono">PA Sist. (mmHg)</Label>
                  <Input type="number" value={formData.sbpPreDialysis} onChange={(e) => updateField("sbpPreDialysis", e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono">PA Diast. (mmHg)</Label>
                  <Input type="number" value={formData.dbpPreDialysis} onChange={(e) => updateField("dbpPreDialysis", e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono">FC (bpm)</Label>
                  <Input type="number" value={formData.hrPreDialysis} onChange={(e) => updateField("hrPreDialysis", e.target.value)} className="bg-background" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border">
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <ClipboardList size={16} className="text-primary" /> Sintomatología
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center space-x-2">
                <Checkbox id="dizzy" checked={formData.symptomDizziness === 1} onCheckedChange={(v) => updateField("symptomDizziness", v ? 1 : 0)} />
                <Label htmlFor="dizzy" className="text-sm">Vértigo / Mareo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="nausea" checked={formData.symptomNausea === 1} onCheckedChange={(v) => updateField("symptomNausea", v ? 1 : 0)} />
                <Label htmlFor="nausea" className="text-sm">Náuseas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="headache" checked={formData.symptomHeadache === 1} onCheckedChange={(v) => updateField("symptomHeadache", v ? 1 : 0)} />
                <Label htmlFor="headache" className="text-sm">Cefalea</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="chest" checked={formData.symptomChestPain === 1} onCheckedChange={(v) => updateField("symptomChestPain", v ? 1 : 0)} />
                <Label htmlFor="chest" className="text-sm">Dolor Torácico</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Checkbox id="cramps" checked={formData.symptomCramps === 1} onCheckedChange={(v) => updateField("symptomCramps", v ? 1 : 0)} />
                <Label htmlFor="cramps" className="text-sm">Calambres</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border">
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Heart size={16} className="text-primary" /> Medicación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">¿Tomó antihipertensivo hoy?</Label>
                <Switch 
                  checked={formData.tookAntihypertensive === 1} 
                  onCheckedChange={(v) => updateField("tookAntihypertensive", v ? 1 : 0)} 
                />
              </div>
              
              {formData.tookAntihypertensive === 1 && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-xs">Tipo de antihipertensivo</Label>
                  <Select value={formData.antihypertensiveType} onValueChange={(v) => updateField("antihypertensiveType", v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IECA">IECA</SelectItem>
                      <SelectItem value="ARA2">ARA2</SelectItem>
                      <SelectItem value="BCC">BCC (Calcioantagonista)</SelectItem>
                      <SelectItem value="BB">Betabloqueante</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border">
            <CardHeader className="py-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea 
                placeholder="Notas adicionales..." 
                className="min-h-[120px] bg-background" 
                value={formData.notes} 
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setLocation(`/paciente/${id}`)}>Cancelar</Button>
          <Button type="submit" size="lg" className="px-8 shadow-xl shadow-primary/20" disabled={mutation.isPending}>
            <Save className="mr-2" /> Guardar Valoración
          </Button>
        </div>
      </form>
    </div>
  );
}
