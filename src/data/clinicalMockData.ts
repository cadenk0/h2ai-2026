// Mock clinical dataset for clinician dashboard

export interface PatientDemographics {
  age: number;
  gender: "Male" | "Female" | "Other";
  heightCm: number;
  weightKg: number;
  bmi: number;
  obesityClass: "Normal" | "Overweight" | "Obese I" | "Obese II" | "Obese III";
}

export interface SensorReading {
  timestamp: string;
  segment: "thigh_R" | "thigh_L" | "leg_R" | "leg_L" | "arm_R" | "arm_L" | "back" | "trunk";
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  quatW: number;
  quatX: number;
  quatY: number;
  quatZ: number;
}

export interface BiomechanicalParams {
  date: string;
  week: number;
  jointAngleDeg: number;
  strideTimeSec: number;
  stepLengthCm: number;
  cadenceStepsPerMin: number;
  swingPhasePct: number;
  stancePhasePct: number;
  // Extended fields for analysis engine
  motionSmoothness: number;      // Jerk (m/s³)
  energyExpenditure: number;     // kJ
  angularVelocity: number;       // °/s
  feedbackError: number;         // %
}

export interface FeedbackMetric {
  date: string;
  week: number;
  deviationLevel: "low" | "moderate" | "high";
  performanceLabel: "excellent" | "good" | "fair" | "poor";
  correctiveAction: string;
  sensorPosition: string;
}

export const mockDemographics: PatientDemographics = {
  age: 67,
  gender: "Male",
  heightCm: 175,
  weightKg: 88,
  bmi: 28.7,
  obesityClass: "Overweight",
};

const segments: SensorReading["segment"][] = ["thigh_R", "thigh_L", "leg_R", "leg_L", "arm_R", "arm_L", "back", "trunk"];

export const mockSensorReadings: SensorReading[] = segments.flatMap((segment, si) =>
  Array.from({ length: 5 }, (_, i) => ({
    timestamp: `2026-04-${String(8 + i).padStart(2, "0")}T10:${String(si * 7).padStart(2, "0")}:00`,
    segment,
    accelX: +(Math.random() * 2 - 1).toFixed(3),
    accelY: +(9.8 + Math.random() * 0.5 - 0.25).toFixed(3),
    accelZ: +(Math.random() * 2 - 1).toFixed(3),
    gyroX: +(Math.random() * 60 - 30).toFixed(2),
    gyroY: +(Math.random() * 60 - 30).toFixed(2),
    gyroZ: +(Math.random() * 60 - 30).toFixed(2),
    quatW: +(0.9 + Math.random() * 0.1).toFixed(4),
    quatX: +(Math.random() * 0.3).toFixed(4),
    quatY: +(Math.random() * 0.3).toFixed(4),
    quatZ: +(Math.random() * 0.3).toFixed(4),
  }))
);

// Week 1: baseline rehabilitation (higher jerk, lower efficiency)
// Week 2: showing improvement trends (or worsening for some to trigger rules)
export const mockBiomechanics: BiomechanicalParams[] = Array.from({ length: 14 }, (_, i) => {
  const week = Math.floor(i / 7) + 1;
  return {
    date: `2026-04-${String(i + 1).padStart(2, "0")}`,
    week,
    jointAngleDeg: +(85 + i * 1.5 + Math.random() * 5).toFixed(1),
    strideTimeSec: +(1.4 - i * 0.02 + Math.random() * 0.1).toFixed(2),
    stepLengthCm: +(45 + i * 1.2 + Math.random() * 3).toFixed(1),
    cadenceStepsPerMin: +(80 + i * 1.5 + Math.random() * 5).toFixed(0) as unknown as number,
    swingPhasePct: +(36 + i * 0.3 + Math.random() * 2).toFixed(1),
    stancePhasePct: +(64 - i * 0.3 - Math.random() * 2).toFixed(1),
    // Week 1 has higher jerk (worse), week 2 shows slight increase to trigger rule
    motionSmoothness: +(week === 1
      ? 0.015 + Math.random() * 0.005
      : 0.022 + Math.random() * 0.008
    ).toFixed(5) as unknown as number,
    // Energy slightly drops in week 2
    energyExpenditure: +(week === 1
      ? 1.2 + Math.random() * 0.3
      : 1.05 + Math.random() * 0.25
    ).toFixed(3) as unknown as number,
    // Angular velocity drops in week 2
    angularVelocity: +(week === 1
      ? 45 + Math.random() * 10
      : 42 + Math.random() * 8
    ).toFixed(2) as unknown as number,
    // Feedback error rises in week 2
    feedbackError: +(week === 1
      ? 3.5 + Math.random() * 1.5
      : 4.8 + Math.random() * 2.0
    ).toFixed(2) as unknown as number,
  };
});

const correctiveActions = [
  "Increase knee flexion during swing phase",
  "Reduce lateral trunk sway",
  "Improve heel strike timing",
  "Extend hip during stance phase",
  "Maintain upright posture through gait cycle",
  "Slow cadence and focus on step symmetry",
  "Strengthen ankle dorsiflexion",
];

const sensorPositions = ["Right Thigh", "Left Thigh", "Right Leg", "Left Leg", "Lower Back", "Trunk"];

export const mockFeedback: FeedbackMetric[] = Array.from({ length: 14 }, (_, i) => {
  const deviation = i < 4 ? "high" : i < 9 ? "moderate" : "low";
  const performance = i < 3 ? "poor" : i < 6 ? "fair" : i < 11 ? "good" : "excellent";
  return {
    date: `2026-04-${String(i + 1).padStart(2, "0")}`,
    week: Math.floor(i / 7) + 1,
    deviationLevel: deviation,
    performanceLabel: performance,
    correctiveAction: correctiveActions[i % correctiveActions.length],
    sensorPosition: sensorPositions[i % sensorPositions.length],
  };
});
