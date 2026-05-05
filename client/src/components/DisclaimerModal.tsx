import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, ShieldAlert } from "lucide-react";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hd_disclaimer_accepted");
    if (!hasSeenDisclaimer) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("hd_disclaimer_accepted", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing by clicking outside or pressing Escape before accepting
      if (!isOpen && localStorage.getItem("hd_disclaimer_accepted")) {
        setOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] border-amber-500/20" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl mb-2 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
            Aviso Importante
          </DialogTitle>
          <DialogDescription className="space-y-4 text-foreground/80">
            <div className="flex gap-3 items-start border border-border p-4 rounded-md bg-muted/30">
              <BookOpen className="h-5 w-5 mt-0.5 text-sky-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Uso Exclusivo para Simulación Educativa</h4>
                <p className="text-sm">
                  Esta plataforma es una <strong>herramienta de simulación de hemodiálisis con fines estrictamente educativos y de investigación</strong>. 
                  Los datos, decisiones y métricas generadas por la inteligencia artificial son representaciones lógicas no destinadas a reemplazar 
                  el juicio clínico humano.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start border border-border p-4 rounded-md bg-muted/30">
              <ShieldAlert className="h-5 w-5 mt-0.5 text-rose-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Descargo de Responsabilidad Clínica</h4>
                <p className="text-sm">
                  Ningún contenido de esta aplicación constituye consejo médico, diagnóstico o pauta de tratamiento. 
                  El autor y los desarrolladores de este software <strong>no asumen ninguna responsabilidad</strong> por decisiones clínicas, 
                  daños a pacientes o consecuencias derivadas del uso de los algoritmos de esta herramienta en un entorno de atención real.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-secondary text-sm">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Evidencia Científica y Modelos
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los modelos fisiológicos y predictivos implementados (estimación de volumen sanguíneo relativo, perfilado de sodio, tasa de UF, y cinéticas bicompartimentales) 
                están basados en literatura nefrológica revisada por pares (ej. modelos de Daugirdas, algoritmos de bio-retroalimentación de volumen y guías KDOQI/KDIGO). 
                Sin embargo, su integración matemática aquí sigue siendo experimental.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button onClick={handleAccept} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
            He leído y acepto los términos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
