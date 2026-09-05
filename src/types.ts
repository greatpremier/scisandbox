export type DisciplineType = "chemistry" | "physics" | "biology";

export type ChemistryExperimentId = "titration" | "reaction_kinetics";
export type PhysicsExperimentId = "projectile" | "optics_prism";
export type BiologyExperimentId = "enzyme_kinetics" | "bacterial_growth";

export type ExperimentId = ChemistryExperimentId | PhysicsExperimentId | BiologyExperimentId;

export interface ExperimentEquation {
  name: string;
  latex: string;
  description: string;
}

export interface ExperimentPreset {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ExperimentParameterDef {
  id: string;
  label: string;
  unit?: string;
  type: "slider" | "select" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
  options?: { label: string; value: any }[];
}

export interface ExperimentMeta {
  id: ExperimentId;
  discipline: DisciplineType;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  learningObjectives: string[];
  principles: string[];
  presets: ExperimentPreset[];
  parameters?: ExperimentParameterDef[];
  equations?: ExperimentEquation[];
}

// Data point recorded in time
export interface SimulationDataPoint {
  time?: number; // in seconds
  [key: string]: any;
}

export interface MeasurementSummary {
  primaryLabel: string;
  primaryValue: string;
  primaryUnit: string;
  secondaryLabel: string;
  secondaryValue: string;
  secondaryUnit: string;
  statusText: string;
  statusType: "normal" | "warning" | "success" | "active";
}

export interface LabTrial {
  id: string;
  trialNumber: number;
  timestamp: string;
  experimentId: ExperimentId;
  experimentTitle: string;
  parameters: Record<string, any>;
  summaryMetrics: Record<string, string | number>;
  dataPointsCount: number;
  data: SimulationDataPoint[];
  notes?: string;
}

// AI Lab assistant message
export interface LabAIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
