export class VaccinationRecord {
  id!: string;
  childId!: string;
  vaccineId!: string;
  doseId!: string;
  appliedDate?: string;
  appliedPlace?: string;
  lotNumber?: string;
  vacinatorName?: string;

  constructor(data: VaccinationRecordData) {
    Object.assign(this, data);
  }

  static makeId(childId: string, vaccineId: string, doseId: string): string {
    return `record_${childId}_${vaccineId}_${doseId}`;
  }

  static fromData(data: Omit<VaccinationRecordData, 'id'>): VaccinationRecord {
    return new VaccinationRecord({
      ...data,
      id: VaccinationRecord.makeId(data.childId, data.vaccineId, data.doseId)
    });
  }
}

export interface VaccinationRecordData {
  id: string;
  childId: string;
  vaccineId: string;
  doseId: string;
  appliedDate?: string;
  appliedPlace?: string;
  lotNumber?: string;
  vacinatorName?: string;
}
