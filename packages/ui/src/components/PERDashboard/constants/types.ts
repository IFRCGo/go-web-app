// src/components/PERDashboard/constants/types.ts

/**
 * Interface for COLORS constant.
 */
export interface Colors {
  selfAssessment: string;
  simulation: string;
  operational: string;
  postOperational: string;
}

/**
 * Interface for each region in REGIONS constant.
 */
export interface Region {
  label: string;
  fillColor: string;
}

/**
 * Interface for each assessment type in assessmentTypes constant.
 */
export interface AssessmentType {
  label: string;
  color: string;
}

/**
 * Interface for each phase color in PHASE_COLORS constant.
 */
export interface PhaseColor {
  phase: string;
  label: string;
  phaseNumber: number;
  color: string;
}
