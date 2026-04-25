export interface HistoricalLab {
  date: string;
  hemoglobin: number;
  albumin: number;
  phosphorus: number;
  calcium: number;
  pth: number;
  potassium: number;
  spKtv: number;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  notes?: string;
}

export interface Patient {
  id: number;
  bed: string;
  name: string;
  age: number;
  sex: string;
  dialysisVintage: number;
  dryWeight: number;
  albumin: number;
  hemoglobin: number;
  diabetic: number;
  cardiopathy: number;
  targetUfVolume: number;
  sessionDuration: number;
  bloodFlowRate: number;
  dialysateTemp: number;
  sodiumDialysate: number;
  minuteElapsed: number;
  sessionProgress: number;
  phase: string;
  hidEpisodes: number;
  idhtEpisodes: number;
  currentReading?: PatientReading;
  historicalLabs?: HistoricalLab[];
  medications?: Medication[];
}

export interface PatientReading {
  id: number;
  patientId: number;
  sessionId: string;
  timestamp: string;
  minuteOfSession: number;
  sbp: number;
  dbp: number;
  hr: number;
  ufRemoved: number;
  hidEvent: number;
  idhtEvent: number;
  riskScore: number;
  riskCategory: string;
  idhtRiskScore: number;
  phase?: string;
}

export interface InterventionLog {
  id: number;
  patientId: number;
  interventionType: string;
  detail?: string;
  salineVolumeMl?: number;
  ufrNewValue?: number;
  dialysateTempNew?: number;
  performedBy: string;
  timestamp: string;
  minuteOfSession: number;
}

export type SessionReading = PatientReading;

export interface PreDialysisData {
  id: number;
  patientId: number;
  weightPreDialysis: number;
  sbpPreDialysis: number;
  dbpPreDialysis: number;
  hrPreDialysis: number;
  interdialyticWeightGain: number;
  symptomDizziness: number;
  symptomNausea: number;
  symptomHeadache: number;
  symptomChestPain: number;
  symptomCramps: number;
  tookAntihypertensive: number;
  antihypertensiveType: string;
  notes: string;
  timestamp: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  hidActive: number;
  idhtActive: number;
  highRisk: number;
  alerts: number;
}
