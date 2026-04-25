import { Badge } from "@/components/ui/badge";

export default function UFAlert({ 
  ufRemoved, 
  targetUfVolume, 
  minuteElapsed, 
  sessionDuration 
}: { 
  ufRemoved: number; 
  targetUfVolume: number; 
  minuteElapsed: number; 
  sessionDuration: number;
}) {
  const sessionFractionElapsed = minuteElapsed / (sessionDuration * 60);
  const expectedUF = targetUfVolume * sessionFractionElapsed;
  const ufDeficit = expectedUF - ufRemoved;
  const ufInsuficiente = ufDeficit > 0.3;

  if (!ufInsuficiente) return null;

  return (
    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/50 ml-2 animate-pulse">
      UF insuf.
    </Badge>
  );
}
