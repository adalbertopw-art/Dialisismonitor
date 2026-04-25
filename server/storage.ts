import { Patient, SessionReading, PreDialysisData, InterventionLog } from "../shared/types";

export class MemStorage {
  private patients: Map<number, Patient>;
  private readings: Map<number, SessionReading[]>;
  private preDialysis: Map<number, PreDialysisData>;
  private interventions: Map<number, InterventionLog[]>;
  private interventionIdCounter: number = 1;

  // Simulator current states
  public patientStates: Map<number, any>;

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

export const storage = new MemStorage();
