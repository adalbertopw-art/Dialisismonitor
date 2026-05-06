import { Patient, SessionReading, PreDialysisData, InterventionLog } from "../shared/types";
import { initSimulatorForStorage } from "./simulator";

export class MemStorage {
  public patients: Map<number, Patient>;
  public readings: Map<number, SessionReading[]>;
  public preDialysis: Map<number, PreDialysisData>;
  public interventions: Map<number, InterventionLog[]>;
  private interventionIdCounter: number = 1;

  // Simulator current states
  public patientStates: Map<number, any>;
  public lastAccessed: number = Date.now();

  constructor() {
    this.patients = new Map();
    this.readings = new Map();
    this.preDialysis = new Map();
    this.interventions = new Map();
    this.patientStates = new Map();
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async setPatient(patient: Patient) {
    this.patients.set(patient.id, patient);
  }

  async getReadings(patientId: number): Promise<SessionReading[]> {
    return this.readings.get(patientId) || [];
  }

  async addReading(patientId: number, reading: SessionReading) {
    const current = this.readings.get(patientId) || [];
    const updated = [...current, reading].slice(-120);
    this.readings.set(patientId, updated);
  }

  async updatePatient(id: number, patientUpdates: Partial<Patient>): Promise<Patient | undefined> {
    const existing = this.patients.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patientUpdates };
    this.patients.set(id, updated as Patient);
    return updated as Patient;
  }

  async deletePatient(id: number) {
    this.patients.delete(id);
    this.readings.delete(id);
    this.preDialysis.delete(id);
    this.interventions.delete(id);
    this.patientStates.delete(id);
  }

  async getPreDialysis(patientId: number): Promise<PreDialysisData | undefined> {
    return this.preDialysis.get(patientId);
  }

  async setPreDialysis(patientId: number, data: PreDialysisData) {
    this.preDialysis.set(patientId, data);
  }

  async getInterventions(patientId: number): Promise<InterventionLog[]> {
    return this.interventions.get(patientId) || [];
  }

  async addIntervention(patientId: number, intervention: Omit<InterventionLog, "id">): Promise<InterventionLog> {
    const newIntervention = { ...intervention, id: this.interventionIdCounter++ };
    const current = this.interventions.get(patientId) || [];
    this.interventions.set(patientId, [...current, newIntervention]);
    return newIntervention;
  }

  async deleteIntervention(id: number) {
    for (const [patientId, logs] of this.interventions.entries()) {
      const filtered = logs.filter((log) => log.id !== id);
      if (filtered.length !== logs.length) {
        this.interventions.set(patientId, filtered);
        break;
      }
    }
  }
}

export const sessions = new Map<string, MemStorage>();

// Helper to get or create storage for a session
export function getStorage(sessionId: string): MemStorage {
  if (!sessionId) sessionId = "default";
  let storage = sessions.get(sessionId);
  
  if (!storage) {
    storage = new MemStorage();
    sessions.set(sessionId, storage);
    
    // Asynchronously bootstrap the mock data for new session
    setTimeout(() => {
      initSimulatorForStorage(storage!, sessionId);
    }, 0);
  }
  
  storage.lastAccessed = Date.now();
  return storage;
}

// Keep a default one around for backward compatibility initially if needed
export const storage = getStorage("default");

