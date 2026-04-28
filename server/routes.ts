import { Express } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  app.get("/api/patients", async (_req, res) => {
    const patients = await storage.getPatients();
    const results = await Promise.all(patients.map(async (p) => {
      const readings = await storage.getReadings(p.id);
      const state = storage.patientStates.get(p.id);
      const lastReading = readings[readings.length - 1];
      return {
        ...p,
        currentReading: lastReading,
        sessionProgress: lastReading ? (lastReading.minuteOfSession / (p.sessionDuration * 60)) * 100 : 0,
        minuteElapsed: state.minuteElapsed,
        phase: state.phase,
        hidEpisodes: state.hidEpisodes,
        idhtEpisodes: state.idhtEpisodes
      };
    }));
    res.json(results);
  });

  app.get("/api/patients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const p = await storage.getPatient(id);
    if (!p) return res.status(404).send("Patient not found");
    const readings = await storage.getReadings(id);
    const state = storage.patientStates.get(id);
    const lastReading = readings[readings.length - 1];
    
    const patientWithState = {
      ...p,
      currentReading: lastReading,
      sessionProgress: lastReading ? (lastReading.minuteOfSession / (p.sessionDuration * 60)) * 100 : 0,
      minuteElapsed: state.minuteElapsed,
      phase: state.phase,
      hidEpisodes: state.hidEpisodes,
      idhtEpisodes: state.idhtEpisodes
    };
    
    res.json({ patient: patientWithState, readings });
  });

  app.get("/api/stats", async (_req, res) => {
    const patients = await storage.getPatients();
    const activePatients = await Promise.all(patients.map(async (p) => {
      const readings = await storage.getReadings(p.id);
      const state = storage.patientStates.get(p.id);
      return { p, lastReading: readings[readings.length - 1], state };
    }));

    const stats = {
      total: patients.length,
      active: patients.length,
      hidActive: activePatients.filter(a => a.state.phase === "hid").length,
      idhtActive: activePatients.filter(a => a.state.idhtPhase === "idht").length,
      highRisk: activePatients.filter(a => a.lastReading && (a.lastReading.riskScore >= 45 || a.lastReading.idhtRiskScore >= 45)).length,
      alerts: activePatients.filter(a => a.lastReading && (a.lastReading.riskScore >= 65 || a.lastReading.idhtRiskScore >= 65 || a.state.phase === "hid" || a.lastReading.idhtEvent === 1)).length
    };
    res.json(stats);
  });

  app.get("/api/patients/:id/pre-dialysis", async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await storage.getPreDialysis(id);
    res.json(data || null);
  });

  app.post("/api/patients/:id/pre-dialysis", async (req, res) => {
    const id = parseInt(req.params.id);
    const data = { ...req.body, patientId: id, timestamp: new Date().toISOString() };
    await storage.setPreDialysis(id, data);
    res.json(data);
  });

  app.get("/api/patients/:id/interventions", async (req, res) => {
    const id = parseInt(req.params.id);
    const logs = await storage.getInterventions(id);
    res.json(logs);
  });

  app.post("/api/patients/:id/interventions", async (req, res) => {
    const id = parseInt(req.params.id);
    const intervention = await storage.addIntervention(id, req.body);
    res.json(intervention);
  });

  app.delete("/api/interventions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteIntervention(id);
    res.sendStatus(200);
  });

  app.get("/api/patients/:id/session-report", async (req, res) => {
    const id = parseInt(req.params.id);
    const patient = await storage.getPatient(id);
    const readings = await storage.getReadings(id);
    const preDialysis = await storage.getPreDialysis(id);
    const interventions = await storage.getInterventions(id);
    res.json({ patient, readings, preDialysis, interventions });
  });
}
