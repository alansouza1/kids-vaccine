export interface Child {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  avatar: string; // Tailored color + emoji/icon name
  bloodType?: string;
  weight?: number; // in kg
  height?: number; // in cm
}

export interface DosePreset {
  id: string; // e.g. 'bcg_single', 'penta_1', 'penta_2'
  name: string; // e.g. 'Dose Única', '1ª Dose', 'Reforço'
  ageMonths: number; // Age in months when this dose is recommended
  gracePeriodMonths?: number; // Optional margin before considered overdue, defaults to 1 month
}

export interface VaccinePreset {
  id: string; // e.g. 'bcg', 'penta'
  name: string; // e.g. 'BCG', 'Pentavalente'
  fullName: string; // e.g. 'Vacina Bacilo Calmette-Guérin', 'DTPa + HepB + Hib'
  description: string; // What it prevents, details
  diseasePrevented: string; // e.g. 'Tuberculose', 'Difteria, Tétano, Coqueluche, Hepatite B, Hib'
  sideEffects?: string; // Standard side effects
  doses: DosePreset[];
}

export interface VaccinationRecord {
  id: string; // childId_vaccineId_doseId
  childId: string;
  vaccineId: string;
  doseId: string;
  appliedDate?: string; // YYYY-MM-DD if applied
  appliedPlace?: string; // e.g., 'UBS Centro'
  lotNumber?: string;
  vacinatorName?: string;
}

export interface DerivedDoseStatus {
  doseId: string;
  doseName: string;
  ageMonths: number;
  scheduledDate: Date;
  status: 'applied' | 'pending' | 'overdue';
  appliedDate?: string;
  appliedPlace?: string;
  lotNumber?: string;
  vacinatorName?: string;
}

export interface ChildVaccineGroup {
  vaccine: VaccinePreset;
  doses: DerivedDoseStatus[];
  isFullyApplied: boolean;
  hasOverdue: boolean;
}

export interface VaccineCampaign {
  id: string;
  title: string;
  description: string;
  targetAgeText: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  startDate: string;
  endDate: string;
  bannerImage?: string;
}
