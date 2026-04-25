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
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/types";
import { AlertsDialog } from "@/components/AlertsDialog";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

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

        <nav className="flex-1 p-2 space-y-1">
          <Link 
            href="/"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-bold text-sm",
              location === "/" ? "bg-[#0ea5e9] text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-white"
            )}
          >
            <LayoutDashboard size={18} />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </nav>

        {/* Stats and Info - ESTADO DEL PISO */}
        {!collapsed && stats && (
          <div className="p-4 pt-1 space-y-4 border-t border-sidebar-border/50">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 mt-4">Estado del piso</h3>
            <div className="grid grid-cols-2 gap-2 p-1">
              <FloorStatCard label="Pacientes" value={stats.active} total={15} filterType="all" />
              <FloorStatCard label="Alertas" value={stats.alerts} isAlert filterType="alerts" />
              <FloorStatCard label="HID activa" value={stats.hidActive} isAlert filterType="hid" />
              <FloorStatCard label="Alto riesgo" value={stats.highRisk} isAlert filterType="highRisk" />
            </div>
          </div>
        )}

        <footer className="p-4 text-[10px] text-muted-foreground space-y-2 border-t border-sidebar-border/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p>Simulación activa · 15 camas</p>
          </div>
          <p className="opacity-60 text-[9px]">Kim 2021 · Yang 2024 · Marcos 2024 · KDOQI 2015</p>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-[#0a0a0a] relative">
        {children}
      </main>

      {/* Global Dialogs */}
      <AlertsDialog />
    </div>
  );
}

function FloorStatCard({ label, value, isAlert, filterType }: any) {
  return (
    <div 
      className="bg-[#111] border border-white/5 rounded-md p-2 flex flex-col gap-1 cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
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
