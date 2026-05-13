import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Database,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/types";
import { AlertsDialog } from "@/components/AlertsDialog";
import { AdminLoginDialog } from "@/components/AdminLoginDialog";
import { useToast } from "@/hooks/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const { toast } = useToast();

  const [theme, setTheme] = useState(() => {
    try {
      const val = localStorage.getItem("hd_theme");
      if (val === "dark" || val === "light") return val;
    } catch {}
    // Default to dark
    return "dark";
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem("hd_admin_mode") === "true";
    } catch {}
    return false;
  });

  const toggleAdmin = () => {
    if (!isAdmin) {
      setLoginOpen(true);
    } else {
      setIsAdmin(false);
      localStorage.setItem("hd_admin_mode", "false");
      window.dispatchEvent(new CustomEvent('admin_mode_changed', { detail: { isAdmin: false } }));
      
      // Apagar autopilot si se hace logout de admin
      setAiAutopilot(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("hd_theme", theme);
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  const [aiAutopilot, setAiAutopilot] = useState(() => {
    try {
      const val = localStorage.getItem("hd_ai_autopilot");
      if (val !== null) return JSON.parse(val);
    } catch {}
    return false;
  });

  useEffect(() => {
    localStorage.setItem("hd_ai_autopilot", JSON.stringify(aiAutopilot));
    // Optional: dispatch an event so other components know if needed
    window.dispatchEvent(new CustomEvent('ai_autopilot_changed', { detail: { active: aiAutopilot } }));
  }, [aiAutopilot]);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 3000
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <Activity className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight">HD Monitor</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Unidad Diálisis</p>
              </div>
            </div>
          )}
          {collapsed && <Activity className="text-primary mx-auto" size={24} />}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-secondary rounded-md ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-4">
          <div className="space-y-1">
            <Link 
              href="/"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-bold text-sm",
                location === "/" ? "bg-[#0ea5e9] text-foreground shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <LayoutDashboard size={18} />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {!collapsed && (
            <div className="mx-2 mt-8 p-3 bg-card border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500">
                  <Database size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Intervención IA</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {aiAutopilot ? "Las recomendaciones se aplican de forma automática." : "El médico debe aprobar manualmente cada recomendación."}
              </p>
              <button 
                onClick={() => {
                  if (!isAdmin) {
                    toast({
                      title: "Acceso Denegado",
                      description: "Se requiere ingresar como Administrador (Nefrólogo) para habilitar el Autopilot.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setAiAutopilot(!aiAutopilot);
                }}
                className={cn(
                  "w-full py-2 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm border flex items-center justify-center gap-2",
                  aiAutopilot 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20" 
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                )}
              >
                {aiAutopilot ? "Autopilot: Activo" : "Requiere Aprobación"}
              </button>
            </div>
          )}

          <div className="px-4 py-2 mt-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "flex items-center gap-3 w-full p-2.5 rounded-lg transition-all text-sm font-medium",
                "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {!collapsed && <span>Tema {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>}
            </button>
            <button
              onClick={toggleAdmin}
              className={cn(
                "flex items-center gap-3 w-full p-2.5 rounded-lg transition-all text-sm font-medium mt-2",
                isAdmin ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Users size={18} />
              {!collapsed && <span>{isAdmin ? "Admin Activo" : "Admin Login"}</span>}
            </button>
          </div>
        </nav>

        {/* Stats and Info - ESTADO DEL PISO */}
        {!collapsed && stats && (
          <div className="p-4 pt-1 space-y-4 border-t border-border">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 mt-4">Estado del piso</h3>
            <div className="grid grid-cols-2 gap-2 p-1">
              <FloorStatCard label="Pacientes" value={stats.active} total={15} filterType="all" />
              <FloorStatCard label="Alertas" value={stats.alerts} isAlert filterType="alerts" />
              <FloorStatCard label="HID activa" value={stats.hidActive} isAlert filterType="hid" />
              <FloorStatCard label="Alto riesgo" value={stats.highRisk} isAlert filterType="highRisk" />
            </div>
          </div>
        )}

        <footer className="p-4 text-[10px] text-muted-foreground space-y-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p>Simulación activa · 15 camas</p>
          </div>
          <p className="opacity-60 text-[9px]">Kim 2021 · Yang 2024 · Marcos 2024 · KDOQI 2015</p>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-background relative">
        {children}
      </main>

      {/* Global Dialogs */}
      <AlertsDialog />
      <AdminLoginDialog 
        open={loginOpen} 
        onOpenChange={setLoginOpen} 
        onSuccess={() => {
          setIsAdmin(true);
          localStorage.setItem("hd_admin_mode", "true");
          window.dispatchEvent(new CustomEvent('admin_mode_changed', { detail: { isAdmin: true } }));
        }} 
      />
    </div>
  );
}

function FloorStatCard({ label, value, isAlert, filterType }: any) {
  return (
    <div 
      className="bg-card border border-border rounded-md p-2 flex flex-col gap-1 cursor-pointer hover:bg-secondary active:scale-95 transition-all"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('show-dashboard-alerts', { detail: { filterType } }));
      }}
    >
      <span className={cn(
        "text-lg font-mono font-bold leading-none",
        isAlert && value > 0 ? "text-rose-500" : "text-foreground"
      )}>{value}</span>
      <span className="text-[9px] uppercase font-bold text-muted-foreground leading-tight tracking-tight">{label}</span>
    </div>
  );
}
