import { storage } from "./storage";
import { Patient, SessionReading } from "../shared/types";

const PATIENT_PROFILES = [
  // 1. High Risk IDH: High UFR, elderly, diabetic, cardiopathy, low albumin
  { name: "García, Juan A.",     age: 72, sex: "M", bed: "C-01", diabetic: 1, cardiopathy: 1, dryWeight: 65.0, dialysisVintage: 48, albumin: 2.9, hemoglobin: 9.5,  sessionDuration: 3.5, targetUfVolume: 3.5, bloodFlowRate: 300, dialysateTemp: 36.5, sodiumDialysate: 136 },
  
  // 2. High Risk IDHTN: High sodium dialysate, high vintage, stable UFR
  { name: "Martínez, Rosa E.",   age: 55, sex: "F", bed: "C-02", diabetic: 0, cardiopathy: 0, dryWeight: 58.0, dialysisVintage: 84, albumin: 4.0, hemoglobin: 11.2, sessionDuration: 4,   targetUfVolume: 2.0, bloodFlowRate: 280, dialysateTemp: 36.0, sodiumDialysate: 142 },

  // 3. Stable, low risk: low UFR, young
  { name: "López, Carlos H.",    age: 45, sex: "M", bed: "C-03", diabetic: 0, cardiopathy: 0, dryWeight: 74.0, dialysisVintage: 12, albumin: 4.2, hemoglobin: 11.8, sessionDuration: 4.0, targetUfVolume: 2.0, bloodFlowRate: 320, dialysateTemp: 36.5, sodiumDialysate: 138 },

  // 4. Overhydrated / High UFR: very high UF target
  { name: "Rodríguez, Ana P.",   age: 63, sex: "F", bed: "C-04", diabetic: 1, cardiopathy: 0, dryWeight: 62.0, dialysisVintage: 24, albumin: 3.4, hemoglobin: 10.5, sessionDuration: 3.5, targetUfVolume: 3.8, bloodFlowRate: 300, dialysateTemp: 36.5, sodiumDialysate: 138 },

  // 5. Moderate risk: older, cardiopathy, moderate UFR
  { name: "Hernández, Luis M.",  age: 68, sex: "M", bed: "C-05", diabetic: 1, cardiopathy: 1, dryWeight: 80.0, dialysisVintage: 60, albumin: 3.2, hemoglobin: 9.8,  sessionDuration: 4,   targetUfVolume: 3.8, bloodFlowRate: 350, dialysateTemp: 36.0, sodiumDialysate: 137 },
  
  // 6. IDHTN risk:
  { name: "González, María C.",  age: 58, sex: "F", bed: "C-06", diabetic: 1, cardiopathy: 0, dryWeight: 63.0, dialysisVintage: 72, albumin: 3.6, hemoglobin: 10.8, sessionDuration: 4,   targetUfVolume: 2.2, bloodFlowRate: 290, dialysateTemp: 36.5, sodiumDialysate: 141 },
  
  // 7. High Risk IDH: Very elderly, low albumin
  { name: "Pérez, Roberto J.",   age: 82, sex: "M", bed: "C-07", diabetic: 0, cardiopathy: 1, dryWeight: 70.5, dialysisVintage: 45, albumin: 2.7, hemoglobin: 8.5,  sessionDuration: 4.0, targetUfVolume: 3.5, bloodFlowRate: 280, dialysateTemp: 37.0, sodiumDialysate: 138 },

  // 8. Low risk: 
  { name: "Sánchez, Patricia L.",age: 49, sex: "F", bed: "C-08", diabetic: 0, cardiopathy: 0, dryWeight: 55.0, dialysisVintage: 18, albumin: 3.9, hemoglobin: 11.0, sessionDuration: 4.0, targetUfVolume: 1.8, bloodFlowRate: 270, dialysateTemp: 35.5, sodiumDialysate: 139 },
  
  // 9. Moderate Risk:
  { name: "Ramírez, Diego F.",   age: 61, sex: "M", bed: "C-09", diabetic: 1, cardiopathy: 0, dryWeight: 76.0, dialysisVintage: 30, albumin: 3.4, hemoglobin: 10.0, sessionDuration: 4,   targetUfVolume: 3.5, bloodFlowRate: 310, dialysateTemp: 36.5, sodiumDialysate: 138 },
  
  // 10. High Risk IDH:
  { name: "Torres, Carmen B.",   age: 77, sex: "F", bed: "C-10", diabetic: 1, cardiopathy: 1, dryWeight: 59.5, dialysisVintage: 54, albumin: 3.0, hemoglobin: 9.5,  sessionDuration: 3.5, targetUfVolume: 3.2, bloodFlowRate: 290, dialysateTemp: 36.5, sodiumDialysate: 137 },

  // 11. Low Risk:
  { name: "Vargas, Héctor A.",   age: 54, sex: "M", bed: "C-11", diabetic: 0, cardiopathy: 0, dryWeight: 83.0, dialysisVintage: 9,  albumin: 4.1, hemoglobin: 12.0, sessionDuration: 4.0, targetUfVolume: 2.0, bloodFlowRate: 350, dialysateTemp: 36.0, sodiumDialysate: 140 },
  
  // 12. Moderate Risk:
  { name: "Morales, Estela F.",  age: 66, sex: "F", bed: "C-12", diabetic: 1, cardiopathy: 0, dryWeight: 61.0, dialysisVintage: 42, albumin: 3.3, hemoglobin: 9.9,  sessionDuration: 4,   targetUfVolume: 2.8, bloodFlowRate: 280, dialysateTemp: 36.5, sodiumDialysate: 138 },

  // 13. Low risk:
  { name: "Jiménez, Omar E.",    age: 45, sex: "M", bed: "C-13", diabetic: 0, cardiopathy: 0, dryWeight: 71.0, dialysisVintage: 6,  albumin: 4.2, hemoglobin: 12.5, sessionDuration: 3.5, targetUfVolume: 1.5, bloodFlowRate: 320, dialysateTemp: 36.0, sodiumDialysate: 140 },
  
  // 14. High Risk IDH:
  { name: "Castillo, Norma I.",  age: 74, sex: "F", bed: "C-14", diabetic: 1, cardiopathy: 1, dryWeight: 56.5, dialysisVintage: 96, albumin: 2.8, hemoglobin: 8.4,  sessionDuration: 3.5, targetUfVolume: 3.0, bloodFlowRate: 260, dialysateTemp: 37.0, sodiumDialysate: 136 },
  
  // 15. Low risk:
  { name: "Mendoza, Fabio R.",   age: 38, sex: "M", bed: "C-15", diabetic: 0, cardiopathy: 0, dryWeight: 78.0, dialysisVintage: 3,  albumin: 4.3, hemoglobin: 13.0, sessionDuration: 4.0, targetUfVolume: 1.5, bloodFlowRate: 380, dialysateTemp: 36.0, sodiumDialysate: 140 },
];

function ufRate(patient: Patient) {
  return (patient.targetUfVolume * 1000) / (patient.sessionDuration * patient.dryWeight);
}

function calculateRiskScore(sbp: number, hr: number, patient: Patient, ufr: number, phase: string, preSbp: number): number {
  let score = 0;
  
  // EVIDENCIA CLÍNICA (Algoritmos predictivos IDH basados en Kim et al. y Yang 2024)
  
  // 1. Dinámica Hemodinámica (Delta SBP y nivel absoluto)
  // Yang 2024: La caída relativa > 20 mmHg desde el ingreso es un fuerte predictor antes del evento.
  const deltaSbp = preSbp - sbp;
  if (sbp < 95) score += 40;
  else if (sbp < 105) score += 25;
  else if (sbp < 115) score += 15;
  
  if (deltaSbp > 30) score += 20;
  else if (deltaSbp > 20) score += 12;
  
  // Kim 2021: Taquicardia compensatoria (HR > 90) suele preceder o acompañar los descensos de PA
  if (hr > 95) score += 10;
  else if (hr > 85) score += 5;

  // 2. Parámetros de Prescripción y Dialítico
  // KDOQI 2015 / Kim 2021: Tasa de UF > 13 ml/h/kg dispara exponencialmente el riesgo
  if (ufr > 13) score += 22;
  else if (ufr > 10) score += 14;
  else if (ufr > 8) score += 6;

  // 3. Comorbilidades y Variables Demográficas (Kim 2021)
  if (patient.diabetic) score += 12;
  // Disfunción diastólica / cardiopatía limita compensación
  if (patient.cardiopathy) score += 10;
  
  // Yang 2024: Hipoalbuminemia y el relleno capilar retrasado (Plasma Refill Rate bajo)
  if (patient.albumin < 3.0) score += 15;
  else if (patient.albumin < 3.5) score += 8;
  
  if (patient.age > 75) score += 8;
  else if (patient.age > 65) score += 4;

  // 4. Estados del simulador para reflejar la ventana clínica (ground truth del simulador)
  if (phase === "dropping") score += 15;
  if (phase === "hid") score += 35;
  if (phase === "recovering") score += 5;

  return Math.min(99, score); // Limitamos a 99%
}

function riskCategory(score: number): "bajo" | "moderado" | "alto" | "muy alto" {
  if (score >= 70) return "muy alto";
  if (score >= 50) return "alto";
  if (score >= 30) return "moderado";
  return "bajo";
}

function calculateIdhtRiskScore(sbp: number, hr: number, patient: Patient, preSbp: number, idhtPhase: string): number {
  let score = 0;
  
  // EVIDENCIA CLÍNICA: Hipertensión Intradiálisis (IDHTN)
  // Innes et al. / Chou et al. (Factores de riesgo para IDHTN)
  
  const sbpRise = sbp - preSbp;
  
  // Incremento paradójico de la TAS
  if (sbpRise > 20) score += 35;
  else if (sbpRise > 10) score += 20;
  else if (sbpRise > 5) score += 8;
  
  // Sobrecarga de volumen crónico y concentración de Na
  if (patient.sodiumDialysate >= 140) score += 25;
  else if (patient.sodiumDialysate >= 138) score += 12;
  
  // Antigüedad en hemodiálisis (Rigidez arterial, disfunción endotelial)
  if (patient.dialysisVintage > 72) score += 18;
  else if (patient.dialysisVintage > 48) score += 10;
  
  // TAS pre-diálisis elevada como base
  if (preSbp > 160) score += 15;
  else if (preSbp > 150) score += 8;
  
  // Edad avanzada
  if (patient.age > 65) score += 5;
  
  // Retroalimentación del simulador
  if (idhtPhase === "rising") score += 20;
  if (idhtPhase === "idht") score += 40;
  
  return Math.min(99, score);
}

const noise = () => Math.round((Math.random() - 0.5) * 6);

export function initSimulator() {
  function generateMockLabs() {
    const labs = [];
    for (let i = 0; i < 4; i++) {
      labs.push({
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hemoglobin: Number((9.5 + Math.random() * 2).toFixed(1)),
        albumin: Number((3.0 + Math.random() * 1).toFixed(1)),
        phosphorus: Number((4.0 + Math.random() * 2).toFixed(1)),
        calcium: Number((8.5 + Math.random() * 1).toFixed(1)),
        pth: Math.floor(200 + Math.random() * 300),
        potassium: Number((4.5 + Math.random() * 1).toFixed(1)),
        spKtv: Number((1.2 + Math.random() * 0.4).toFixed(2)),
        bnp: Math.floor(100 + Math.random() * 400),
        tnt: Math.floor(10 + Math.random() * 50),
        pcr: Number((0.5 + Math.random() * 3).toFixed(1)),
        ferritin: Math.floor(200 + Math.random() * 600),
        tsat: Math.floor(20 + Math.random() * 30),
        bunPre: Math.floor(50 + Math.random() * 40),
        bunPost: Math.floor(15 + Math.random() * 15),
      });
    }
    return labs;
  }

  function generateMockMedications(diabetic: number, cardiopathy: number) {
    const meds = [
      { name: "Eritropoyetina", dose: "4000 UI", frequency: "Durante hemodiálisis" },
      { name: "Hierro Sacarosa", dose: "100 mg", frequency: "Una vez al mes IV" },
      { name: "Sevelamero", dose: "800 mg", frequency: "Con las comidas" },
      { name: "Complejo B", dose: "1 tableta", frequency: "Diario post diálisis" }
    ];
    if (diabetic) {
      meds.push({ name: "Insulina Glargina", dose: "15 UI", frequency: "Noche" });
    }
    if (cardiopathy) {
      meds.push({ name: "Ácido Acetilsalicílico", dose: "100 mg", frequency: "Diario" });
      meds.push({ name: "Atorvastatina", dose: "20 mg", frequency: "Diario" });
    }
    return meds;
  }

  PATIENT_PROFILES.forEach((profile, index) => {
    const id = index + 1;
    
    // Generate derived clinical properties
    let etiology = "Nefropatía Glomerular";
    if (profile.diabetic) etiology = "Nefropatía Diabética";
    else if (profile.age > 65) etiology = "Nefroangioesclerosis";
    
    // Most patients have an AV Fistula, but older patients or those with high vintage might use catheters
    const isGraftOrCvc = Math.random() > 0.7 || profile.age > 75;
    const vascularAccessType = isGraftOrCvc ? (Math.random() > 0.5 ? "CVC Tunelizado" : "FAV Protésica") : "FAV Autóloga";
    const locations = ["Brazo Izquierdo", "Brazo Derecho", "Yugular Derecha", "Yugular Izquierda"];
    const locIndex = isGraftOrCvc && vascularAccessType === "CVC Tunelizado" ? 2 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 2);
    const vascularAccessLocation = locations[locIndex];

    const ejectionFraction = profile.cardiopathy ? 35 + Math.floor(Math.random() * 20) : 55 + Math.floor(Math.random() * 15);
    const transplantList = profile.age < 65 && !profile.cardiopathy && Math.random() > 0.5 ? 1 : 0;
    const autonomicDysfunction = profile.diabetic && profile.dialysisVintage > 36 && Math.random() > 0.5 ? 1 : 0;

    const patient: Patient = { 
      id, 
      ...profile,
      etiology,
      vascularAccessType,
      vascularAccessLocation,
      ejectionFraction,
      transplantList,
      autonomicDysfunction,
      historicalLabs: generateMockLabs(),
      medications: generateMockMedications(profile.diabetic, profile.cardiopathy)
    } as any;
    storage.setPatient(patient);
    
    // Generate logical pre-dialysis data
    const gipd = 1.5 + Math.random() * 2.5; // Interdialytic weight gain between 1.5 and 4.0 kg
    const sbpPre = 135 + Math.round((Math.random() - 0.5) * 30);
    const dbpPre = 75 + Math.round((Math.random() - 0.5) * 20);
    const hrPre = 70 + Math.round((Math.random() - 0.5) * 20);
    const tookMed = Math.random() > 0.5 ? 1 : 0;
    const medTypes = ["IECA", "ARA2", "BCC", "BB", "Otro"];
    
    storage.setPreDialysis(patient.id, {
      id: patient.id,
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      weightPreDialysis: Number((profile.dryWeight + gipd).toFixed(1)),
      sbpPreDialysis: sbpPre,
      dbpPreDialysis: dbpPre,
      hrPreDialysis: hrPre,
      interdialyticWeightGain: Number(gipd.toFixed(1)),
      symptomDizziness: Math.random() > 0.8 ? 1 : 0,
      symptomNausea: Math.random() > 0.9 ? 1 : 0,
      symptomHeadache: sbpPre > 160 ? 1 : (Math.random() > 0.8 ? 1 : 0),
      symptomChestPain: 0,
      symptomCramps: Math.random() > 0.85 ? 1 : 0,
      tookAntihypertensive: tookMed,
      antihypertensiveType: tookMed ? medTypes[Math.floor(Math.random() * medTypes.length)] : "",
      notes: "Paciente valorado pre-diálisis. " + (sbpPre > 150 ? "PA elevada al ingreso." : "Hemodinámicamente estable.")
    });
    
    // Randomize initial progress to make the unit look active at different stages
    const totalMinutes = patient.sessionDuration * 60;
    const initialMinutes = Math.floor(Math.random() * totalMinutes * 0.82); // 0-82% progress
    
    // Aligining to 15-minute intervals for realism
    const alignedInitialMinutes = Math.floor(initialMinutes / 15) * 15;
    const initialUfRemoved = (patient.targetUfVolume / totalMinutes) * alignedInitialMinutes;

    const state = {
      phase: "stable",
      idhtPhase: "none",
      phaseMinute: 0,
      minuteElapsed: alignedInitialMinutes,
      ufRemoved: initialUfRemoved,
      hidEpisodes: 0,
      idhtEpisodes: 0,
      preSbp: sbpPre
    };

    storage.patientStates.set(id, state);

    // Backfill historical readings at 15-minute intervals
    for (let m = 0; m <= alignedInitialMinutes; m += 15) {
      const baseSbpAdj = 130 + (patient.sex === "F" ? -5 : 0) - (patient.age > 70 ? 5 : 0);
      const sbp = Math.round(baseSbpAdj + noise());
      const dbp = Math.round(baseSbpAdj * 0.55 + noise());
      const hr = Math.round(75 + noise());
      const ufRemoved = (patient.targetUfVolume / totalMinutes) * m;

      const reading: SessionReading = {
        id: Date.now() + patient.id + m,
        patientId: patient.id,
        sessionId: "session-" + new Date().toISOString().split("T")[0],
        timestamp: new Date(Date.now() - (alignedInitialMinutes - m) * 60000).toISOString(),
        minuteOfSession: m,
        sbp,
        dbp,
        hr,
        ufRemoved: Number(ufRemoved.toFixed(3)),
        hidEvent: 0,
        idhtEvent: 0,
        riskScore: calculateRiskScore(sbp, hr, patient, ufRate(patient), "stable", state.preSbp),
        riskCategory: riskCategory(calculateRiskScore(sbp, hr, patient, ufRate(patient), "stable", state.preSbp)),
        idhtRiskScore: calculateIdhtRiskScore(sbp, hr, patient, state.preSbp, "none")
      };
      storage.addReading(patient.id, reading);
    }
    // Simulate interventions for some patients with IDHTN
    if ([2, 6, 8, 11].includes(id)) {
      storage.addIntervention(patient.id, {
        patientId: patient.id,
        interventionType: "Reducir sodio en dializado",
        detail: "Pico de hipertensión intradiálisis detectado. Sodio dializado ajustado a 136.",
        performedBy: "Médico",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        minuteOfSession: alignedInitialMinutes > 30 ? alignedInitialMinutes - 30 : 0
      });
      storage.addIntervention(patient.id, {
        patientId: patient.id,
        interventionType: "Ajustar peso seco",
        detail: "Evaluación de volumen extracelular ante resistencia hipertensiva.",
        performedBy: "Enfermero/a",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        minuteOfSession: alignedInitialMinutes > 15 ? alignedInitialMinutes - 15 : 0
      });
    }
  });

  setInterval(async () => {
    const patients = await storage.getPatients();
    for (const patient of patients) {
      const state = storage.patientStates.get(patient.id);
      
      const totalMinutes = patient.sessionDuration * 60;
      
      // If session is complete, wait a bit then restart
      if (state.minuteElapsed >= totalMinutes) {
        if (state.minuteElapsed > totalMinutes + 30) {
          state.minuteElapsed = 0;
          state.ufRemoved = 0;
          state.phase = "stable";
          state.idhtPhase = "none";
          state.phaseMinute = 0;
          state.hidEpisodes = 0;
          state.idhtEpisodes = 0;
          
          // Re-generate pre-dialysis data for the new session
          const gipd = 1.5 + Math.random() * 2.5;
          const sbpPre = 135 + Math.round((Math.random() - 0.5) * 30);
          state.preSbp = sbpPre;
          
          storage.setPreDialysis(patient.id, {
            id: patient.id,
            patientId: patient.id,
            timestamp: new Date().toISOString(),
            weightPreDialysis: Number((patient.dryWeight + gipd).toFixed(1)),
            sbpPreDialysis: sbpPre,
            dbpPreDialysis: 75 + Math.round((Math.random() - 0.5) * 20),
            hrPreDialysis: 70 + Math.round((Math.random() - 0.5) * 20),
            interdialyticWeightGain: Number(gipd.toFixed(1)),
            symptomDizziness: Math.random() > 0.8 ? 1 : 0,
            symptomNausea: Math.random() > 0.9 ? 1 : 0,
            symptomHeadache: sbpPre > 160 ? 1 : (Math.random() > 0.8 ? 1 : 0),
            symptomChestPain: 0,
            symptomCramps: Math.random() > 0.85 ? 1 : 0,
            tookAntihypertensive: Math.random() > 0.5 ? 1 : 0,
            antihypertensiveType: "IECA",
            notes: "Paciente valorado en inicio de nuevo ciclo."
          });
          
          // Resetting session for demo
          // storage.readings = new Map(); 
        } else {
          state.minuteElapsed += 1;
        }
        continue;
      }

      state.minuteElapsed += 1;
      
      const ufr = ufRate(patient);
      const isUfrHigh = ufr > 10;
      const isUfrVeryHigh = ufr > 13;
      const isElderly = patient.age > 65;
      const isFemale = patient.sex === "F";
      const hasHypoalbuminemia = patient.albumin < 3.5;
      const hasComorbidities = patient.diabetic || patient.cardiopathy;
      
      const sessionProgress = state.minuteElapsed / totalMinutes;

      // IDH typically occurs between 120 and 150 mins (Haddiya et al. 2025)
      const inHighRiskWindow = state.minuteElapsed >= 120 && state.minuteElapsed <= 150;

      // HID transitions probability based on literature predictors
      if (state.phase === "stable") {
         let dropChance = sessionProgress > 0.2 ? 0.001 : 0; 
         
         if (isUfrHigh) dropChance *= 1.5; 
         if (isUfrVeryHigh) dropChance *= 2.0; 
         if (hasComorbidities) dropChance *= 1.5;
         if (hasHypoalbuminemia) dropChance *= 1.5;
         if (isElderly) dropChance *= 1.2;
         if (isFemale) dropChance *= 1.2;
         // High risk window gives a 3x multiplier
         if (inHighRiskWindow) dropChance *= 3.0;
         // Prior IDH during this session also increases risk of another
         if (state.hidEpisodes > 0) dropChance *= 1.5;
         
        if (Math.random() < dropChance) { 
          state.phase = "dropping"; 
          state.phaseMinute = state.minuteElapsed; 
        }
      } else if (state.phase === "dropping" && state.minuteElapsed - state.phaseMinute > 8 + Math.random() * 5) {
        state.phase = "hid"; 
        state.phaseMinute = state.minuteElapsed; 
        state.hidEpisodes++;
      } else if (state.phase === "hid" && state.minuteElapsed - state.phaseMinute > 5 + Math.random() * 10) {
        state.phase = "recovering"; 
        state.phaseMinute = state.minuteElapsed;
      } else if (state.phase === "recovering" && state.minuteElapsed - state.phaseMinute > 15 + Math.random() * 10) {
        state.phase = "stable"; 
        state.phaseMinute = state.minuteElapsed;
      }

      // IDHTN (Hypertension) transitions
      if (state.idhtPhase === "none" && sessionProgress > 0.4) {
        let riseProb = 0.001; 
        if (patient.sodiumDialysate >= 140) riseProb *= 1.5;
        if (patient.dialysisVintage > 60) riseProb *= 1.5;
        if (patient.diabetic) riseProb *= 1.2;
        if (isUfrHigh) riseProb *= 1.5;

        if (Math.random() < riseProb) {
          state.idhtPhase = "rising";
          state.phaseMinute = state.minuteElapsed;
        }
      } else if (state.idhtPhase === "rising" && state.minuteElapsed - state.phaseMinute > 10 + Math.random() * 5) {
        state.idhtPhase = "idht";
        state.phaseMinute = state.minuteElapsed;
        state.idhtEpisodes++;
      } else if (state.idhtPhase === "idht" && state.minuteElapsed - state.phaseMinute > 20 + Math.random() * 10) {
        state.idhtPhase = "none";
      }

      // Calculate state changes even if we don't record the reading every minute
      // for smooth UF removal and internal state
      const ufStepBase = patient.targetUfVolume / (patient.sessionDuration * 60);
      let ufStep = ufStepBase;
      if (state.phase === "dropping") ufStep *= 0.5;
      if (state.phase === "hid") ufStep = 0;
      if (state.phase === "recovering") ufStep *= 0.7;
      state.ufRemoved += ufStep;

      // Only record readings every 15 minutes
      if (state.minuteElapsed % 15 === 0) {
        const baseSbpAdj = 130 + (patient.sex === "F" ? -5 : 0) - (patient.age > 70 ? 5 : 0);
        let sbp, dbp, hr;

        switch (state.phase) {
          case "stable":
            sbp = baseSbpAdj + noise();
            dbp = baseSbpAdj * 0.55 + noise();
            hr = 75 + noise();
            break;
          case "dropping":
            sbp = baseSbpAdj - 15 - Math.random() * 10 + noise();
            dbp = baseSbpAdj * 0.52 - 5 + noise();
            hr = 85 + Math.random() * 10 + noise();
            break;
          case "hid":
            sbp = 80 + Math.round(Math.random() * 10) + noise();
            dbp = 48 + Math.round(Math.random() * 8) + noise();
            hr = 95 + Math.round(Math.random() * 15) + noise();
            break;
          case "recovering":
            sbp = 100 + Math.round(Math.random() * 15) + noise();
            dbp = 60 + Math.round(Math.random() * 8) + noise();
            hr = 82 + Math.round(Math.random() * 8) + noise();
            break;
          default:
            sbp = 120; dbp = 70; hr = 70;
        }

        if (state.idhtPhase === "rising") {
          sbp += 20 + Math.round(Math.random() * 10);
          dbp += 10 + Math.round(Math.random() * 5);
        }
        if (state.idhtPhase === "idht") {
          sbp += 40 + Math.round(Math.random() * 20);
          dbp += 20 + Math.round(Math.random() * 10);
          hr += 10 + Math.round(Math.random() * 8);
        }

        if (patient.cardiopathy) sbp -= 5;
        if (patient.albumin < 3.0) sbp -= 8;

        sbp = Math.round(Math.max(60, sbp));
        dbp = Math.round(Math.max(40, dbp));
        hr = Math.round(Math.max(45, Math.min(140, hr)));

        const risk = calculateRiskScore(sbp, hr, patient, ufr, state.phase, state.preSbp);
        const idhtRisk = calculateIdhtRiskScore(sbp, hr, patient, state.preSbp, state.idhtPhase);

        const reading: SessionReading = {
          id: Date.now() + patient.id,
          patientId: patient.id,
          sessionId: "session-" + new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          minuteOfSession: state.minuteElapsed,
          sbp,
          dbp,
          hr,
          ufRemoved: Number(state.ufRemoved.toFixed(3)),
          hidEvent: state.phase === "hid" ? 1 : 0,
          idhtEvent: state.idhtPhase === "idht" ? 1 : 0,
          riskScore: risk,
          riskCategory: riskCategory(risk),
          idhtRiskScore: idhtRisk
        };

        storage.addReading(patient.id, reading);
      }
    }
  }, 3000);
}
