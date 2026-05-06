import { Express } from "express";
import { getStorage } from "./storage";

export function registerRoutes(app: Express) {
  // Middleware to inject storage into request
  app.use((req, res, next) => {
    const sessionId = (req.headers["x-session-id"] as string) || "default";
    (req as any).storage = getStorage(sessionId);
    next();
  });
  app.get("/api/patients", async (req, res) => {
    const patients = await (req as any).storage.getPatients();
    const results = await Promise.all(patients.map(async (p: any) => {
      const readings = await (req as any).storage.getReadings(p.id);
      const state = (req as any).storage.patientStates.get(p.id);
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

  app.post("/api/patients", async (req, res) => {
    const patients = await (req as any).storage.getPatients();
    const newId = patients.length > 0 ? Math.max(...patients.map((p: any) => p.id)) + 1 : 1;
    
    // Construct patient object based on Patient interface
    const newPatient: any = {
      id: newId,
      name: req.body.name || `Paciente Ext ${newId}`,
      age: parseInt(req.body.age) || 65,
      sex: req.body.sex || "M",
      bed: req.body.bed || `EXT-${newId}`,
      dryWeight: parseFloat(req.body.dryWeight) || 70,
      albumin: parseFloat(req.body.albumin) || 3.8,
      hemoglobin: parseFloat(req.body.hemoglobin) || 11,
      diabetic: parseInt(req.body.diabetic) || 1,
      cardiopathy: parseInt(req.body.cardiopathy) || 0,
      etiology: req.body.etiology || "N/A",
      vascularAccessType: req.body.vascularAccessType || "N/A",
      vascularAccessLocation: req.body.vascularAccessLocation || "N/A",
      ejectionFraction: parseFloat(req.body.ejectionFraction) || 50,
      transplantList: parseInt(req.body.transplantList) || 0,
      autonomicDysfunction: parseInt(req.body.autonomicDysfunction) || 0,
      targetUfVolume: parseFloat(req.body.targetUfVolume) || 2.5,
      sessionDuration: parseFloat(req.body.sessionDuration) || 4,
      bloodFlowRate: parseFloat(req.body.bloodFlowRate) || 300,
      dialysateTemp: parseFloat(req.body.dialysateTemp) || 36.5,
      dialysisVintage: parseInt(req.body.dialysisVintage) || 0,
      sodiumDialysate: parseFloat(req.body.sodiumDialysate) || 138,
      dialyzer: req.body.dialyzer || "Polyflux 170H",
      historicalLabs: [{
        date: new Date().toISOString().split('T')[0],
        albumin: parseFloat(req.body.albumin) || 3.8,
        hemoglobin: parseFloat(req.body.hemoglobin) || 11,
        spKtv: parseFloat(req.body.spKtv) || 1.4,
        phosphorus: parseFloat(req.body.phosphorus) || 4.5,
        calcium: parseFloat(req.body.calcium) || 9.2,
        pth: parseFloat(req.body.pth) || 300,
        potassium: parseFloat(req.body.potassium) || 4.5,
        bnp: parseFloat(req.body.bnp) || 120,
        tnt: parseFloat(req.body.tnt) || 12,
        pcr: parseFloat(req.body.pcr) || 0.5,
        ferritin: parseFloat(req.body.ferritin) || 400,
        tsat: parseFloat(req.body.tsat) || 30,
        bunPre: parseFloat(req.body.bunPre) || 60,
        bunPost: parseFloat(req.body.bunPost) || 15
      }],
      minuteElapsed: 0,
      sessionProgress: 0,
      phase: "stable",
      hidEpisodes: 0,
      idhtEpisodes: 0
    };
    
    await (req as any).storage.setPatient(newPatient);
    
    // Add initial reading
    await (req as any).storage.addReading(newId, {
      id: 1,
      patientId: newId,
      sessionId: "init-" + newId,
      timestamp: new Date().toISOString(),
      minuteOfSession: 0,
      sbp: 140,
      dbp: 85,
      hr: 75,
      ufRemoved: 0,
      hidEvent: 0,
      idhtEvent: 0,
      riskScore: 0,
      riskCategory: "Normal",
      idhtRiskScore: 0
    });
    
    // Initialize simulator state for the new patient
    (req as any).storage.patientStates.set(newPatient.id, {
      minuteElapsed: 0,
      ufRemoved: 0,
      phase: "stable",
      phaseMinute: 0,
      idhtPhase: "none",
      hidEpisodes: 0,
      idhtEpisodes: 0,
      preSbp: 140
    });
    
    res.json(newPatient);
  });

  app.put("/api/patients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await (req as any).storage.updatePatient(id, req.body);
    if (!updated) return res.status(404).send("Patient not found");
    res.json(updated);
  });

  app.delete("/api/patients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await (req as any).storage.deletePatient(id);
    res.sendStatus(200);
  });

  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    // Simple mock password for the congress
    if (password === "nefro2026" || password === "admin123") {
      res.json({ success: true, token: "admin_token_mock" });
    } else {
      res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const p = await (req as any).storage.getPatient(id);
    if (!p) return res.status(404).send("Patient not found");
    const readings = await (req as any).storage.getReadings(id);
    const state = (req as any).storage.patientStates.get(id);
    const lastReading = readings[readings.length - 1];
    
    const patientWithState = {
      ...p,
      currentReading: lastReading,
      sessionProgress: lastReading ? (lastReading.minuteOfSession / (p.sessionDuration * 60)) * 100 : 0,
      minuteElapsed: state?.minuteElapsed ?? 0,
      phase: state?.phase ?? "stable",
      hidEpisodes: state?.hidEpisodes ?? 0,
      idhtEpisodes: state?.idhtEpisodes ?? 0
    };
    
    res.json({ patient: patientWithState, readings });
  });

  app.get("/api/stats", async (req, res) => {
    const patients = await (req as any).storage.getPatients();
    const activePatients = await Promise.all(patients.map(async (p: any) => {
      const readings = await (req as any).storage.getReadings(p.id);
      const state = (req as any).storage.patientStates.get(p.id);
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
    const data = await (req as any).storage.getPreDialysis(id);
    res.json(data || null);
  });

  app.post("/api/patients/:id/pre-dialysis", async (req, res) => {
    const id = parseInt(req.params.id);
    // Parse numeric fields for proper types
    const data = { 
      ...req.body, 
      patientId: id, 
      timestamp: new Date().toISOString(),
      sbpPreDialysis: parseFloat(req.body.sbpPreDialysis) || 0,
      dbpPreDialysis: parseFloat(req.body.dbpPreDialysis) || 0,
      hrPreDialysis: parseFloat(req.body.hrPreDialysis) || 0,
    };
    await (req as any).storage.setPreDialysis(id, data);

    const patientData = await (req as any).storage.getPatient(id);
    if (patientData && data.interdialyticWeightGain) {
      const idwgFloat = parseFloat(data.interdialyticWeightGain);
      if (!isNaN(idwgFloat) && idwgFloat > 0) {
        patientData.targetUfVolume = idwgFloat;
        await (req as any).storage.setPatient(patientData);
      }
    }

    // Update initial reading and state to reflect the pre-dialysis vitals
    const state = (req as any).storage.patientStates.get(id);
    if (state && state.minuteElapsed === 0) {
      state.preSbp = data.sbpPreDialysis;
      
      const readings = await (req as any).storage.getReadings(id);
      if (readings.length > 0) {
        const latestReading = readings[readings.length - 1];
        if (latestReading.minuteOfSession === 0) {
          latestReading.sbp = data.sbpPreDialysis;
          latestReading.dbp = data.dbpPreDialysis;
          latestReading.hr = data.hrPreDialysis;
        }
      }
    }

    res.json(data);
  });

  app.get("/api/patients/:id/interventions", async (req, res) => {
    const id = parseInt(req.params.id);
    const logs = await (req as any).storage.getInterventions(id);
    res.json(logs);
  });

  app.post("/api/patients/:id/interventions", async (req, res) => {
    const id = parseInt(req.params.id);
    const intervention = await (req as any).storage.addIntervention(id, req.body);
    res.json(intervention);
  });

  app.delete("/api/interventions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await (req as any).storage.deleteIntervention(id);
    res.sendStatus(200);
  });

  app.get("/api/patients/:id/session-report", async (req, res) => {
    const id = parseInt(req.params.id);
    const patient = await (req as any).storage.getPatient(id);
    const readings = await (req as any).storage.getReadings(id);
    const preDialysis = await (req as any).storage.getPreDialysis(id);
    const interventions = await (req as any).storage.getInterventions(id);
    res.json({ patient, readings, preDialysis, interventions });
  });
}
