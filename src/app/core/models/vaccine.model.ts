export class DosePreset {
  id: string;
  name: string;
  ageMonths: number;
  gracePeriodMonths: number;

  constructor(data: DosePresetData) {
    this.id = data.id;
    this.name = data.name;
    this.ageMonths = data.ageMonths;
    this.gracePeriodMonths = data.gracePeriodMonths ?? 1;
  }

  get key(): string {
    return this.id;
  }
}

export class VaccinePreset {
  id: string;
  name: string;
  fullName: string;
  description: string;
  diseasePrevented: string;
  sideEffects?: string;
  doses: DosePreset[];

  constructor(data: VaccinePresetData) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.description = data.description;
    this.diseasePrevented = data.diseasePrevented;
    this.sideEffects = data.sideEffects;
    this.doses = data.doses.map(d => new DosePreset(d));
  }

  get totalDoses(): number {
    return this.doses.length;
  }

  getDose(doseId: string): DosePreset | undefined {
    return this.doses.find(d => d.id === doseId);
  }
}

export class DerivedDoseStatus {
  doseId!: string;
  doseName!: string;
  ageMonths!: number;
  scheduledDate!: Date;
  status!: 'applied' | 'pending' | 'overdue';
  appliedDate?: string;
  appliedPlace?: string;
  lotNumber?: string;
  vacinatorName?: string;

  constructor(data: DerivedDoseStatusData) {
    Object.assign(this, data);
  }

  get isOverdue(): boolean {
    return this.status === 'overdue';
  }

  get isApplied(): boolean {
    return this.status === 'applied';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get formattedScheduledDate(): string {
    return this.scheduledDate.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  get cssStatusClass(): string {
    switch (this.status) {
      case 'applied': return 'text-brand-green';
      case 'overdue': return 'text-rose-500';
      case 'pending': return 'text-brand-orange';
    }
  }

  get label(): string {
    switch (this.status) {
      case 'applied': return 'Aplicada';
      case 'overdue': return 'Atrasada';
      case 'pending': return 'Agendada';
    }
  }
}

export class ChildVaccineGroup {
  vaccine!: VaccinePreset;
  doses!: DerivedDoseStatus[];
  isFullyApplied!: boolean;
  hasOverdue!: boolean;

  constructor(data: ChildVaccineGroupData) {
    this.vaccine = data.vaccine;
    this.doses = data.doses;
    this.isFullyApplied = data.isFullyApplied;
    this.hasOverdue = data.hasOverdue;
  }

  get appliedDoses(): number {
    return this.doses.filter(d => d.isApplied).length;
  }

  get overdueDoses(): number {
    return this.doses.filter(d => d.isOverdue).length;
  }

  get pendingDoses(): number {
    return this.doses.filter(d => d.isPending).length;
  }

  get vaccineKey(): string {
    return this.vaccine.id;
  }
}

export class VaccineCampaign {
  id!: string;
  title!: string;
  description!: string;
  targetAgeText!: string;
  minAgeMonths!: number;
  maxAgeMonths!: number;
  startDate!: string;
  endDate!: string;
  bannerImage?: string;

  constructor(data: VaccineCampaignData) {
    Object.assign(this, data);
  }

  isAgeInRange(ageMonths: number): boolean {
    return ageMonths >= this.minAgeMonths && ageMonths <= this.maxAgeMonths;
  }

  get formattedEndDate(): string {
    const [y, m, d] = this.endDate.split('-');
    return `${d}/${m}/${y}`;
  }
}

export interface DosePresetData {
  id: string;
  name: string;
  ageMonths: number;
  gracePeriodMonths?: number;
}

export interface VaccinePresetData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  diseasePrevented: string;
  sideEffects?: string;
  doses: DosePresetData[];
}

export interface DerivedDoseStatusData {
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

export interface ChildVaccineGroupData {
  vaccine: VaccinePreset;
  doses: DerivedDoseStatus[];
  isFullyApplied: boolean;
  hasOverdue: boolean;
}

export interface VaccineCampaignData {
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
