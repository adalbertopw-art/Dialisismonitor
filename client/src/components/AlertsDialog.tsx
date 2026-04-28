import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/types";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AlertsDialog() {
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    refetchInterval: 3000,
  });

  const [showAlerts, setShowAlerts] = useState(false);
  const [alertFilter, setAlertFilter] = useState("alerts");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleShowAlerts = (e: any) => {
      setAlertFilter(e.detail?.filterType || "alerts");
      setShowAlerts(true);
    };
    window.addEventListener('show-dashboard-alerts', handleShowAlerts);
    return () => window.removeEventListener('show-dashboard-alerts', handleShowAlerts);
  }, []);

  const getFilteredPatients = () => {
    if (alertFilter === "all") return patients;
    if (alertFilter === "hid") return patients.filter(p => p.phase === "hid");
    if (alertFilter === "idht") return patients.filter(p => p.currentReading?.idhtEvent === 1);
    if (alertFilter === "highRisk") return patients.filter(p => (p.currentReading?.riskScore || 0) >= 45 || (p.currentReading?.idhtRiskScore || 0) >= 45 || p.currentReading?.riskCategory === "alto" || p.currentReading?.riskCategory === "muy alto");
    // "alerts" default
    return patients.filter(
      (p) =>
        (p.currentReading?.riskScore || 0) >= 65 ||
        (p.currentReading?.idhtRiskScore || 0) >= 65 ||
        p.phase === "hid" ||
        p.currentReading?.idhtEvent === 1 ||
        p.currentReading?.sbp < 100
    );
  };

  const displayedPatients = getFilteredPatients();

  return (
    <Dialog open={showAlerts} onOpenChange={setShowAlerts}>
      <DialogContent className="bg-[#0f1115] border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-500 uppercase tracking-widest font-bold text-sm select-none">
            <AlertTriangle size={18} /> Filtro: {alertFilter === "all" ? "Todos los pacientes" : alertFilter === "hid" ? "HID Activa" : alertFilter === "idht" ? "IDHTN Activa" : alertFilter === "highRisk" ? "Alto Riesgo" : "Alertas"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground select-none">
            Mostrando {displayedPatients.length} paciente(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {displayedPatients.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-xs uppercase font-bold select-none">
              No hay resultados
            </p>
          ) : (
            displayedPatients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all cursor-pointer group"
                onClick={() => {
                  setLocation(`/paciente/${p.id}`);
                  setShowAlerts(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-rose-500 text-lg">
                    {p.bed}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {p.currentReading?.sbp}/{p.currentReading?.dbp} mmHg ·{" "}
                      {p.currentReading?.hr} lpm
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge className="bg-rose-500 text-white border-none text-[8px] h-4 font-bold tracking-widest px-2 mb-1">
                    {p.phase === "hid" ? "HID" : "ALTA"}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-rose-500">
                    {Math.round(p.currentReading?.riskScore || 0)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
