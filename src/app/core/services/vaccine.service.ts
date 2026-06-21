import { Injectable, computed, signal, effect } from '@angular/core';
import { Child, ChildData } from '../models/child.model';
import { VaccinationRecord, VaccinationRecordData } from '../models/vaccination-record.model';
import {
  VaccinePreset, DosePreset, DerivedDoseStatus,
  ChildVaccineGroup, VaccineCampaign, VaccinePresetData, VaccineCampaignData
} from '../models/vaccine.model';

@Injectable({
  providedIn: 'root'
})
export class VaccineService {
  // Static Vaccine Preset Database (based on the Brazilian PNI - Programa Nacional de Imunizações)
  readonly VACCINES: VaccinePresetData[] = [
    {
      id: 'bcg',
      name: 'BCG',
      fullName: 'Vacina Bacilo Calmette-Guérin',
      diseasePrevented: 'Formas graves de tuberculose (miliar e meníngea)',
      description: 'Previne as formas graves de tuberculose. É aquela vacina que deixa a famosa cicatrizzinha no braço direito de quase todo brasileiro.',
      sideEffects: 'Pequena úlcera local (que cicatriza sozinha, não precisa colocar pomada), inchaço leve nas glândulas da axila.',
      doses: [
        { id: 'bcg_du', name: 'Dose Única', ageMonths: 0 }
      ]
    },
    {
      id: 'hepb',
      name: 'Hepatite B',
      fullName: 'Vacina Hepatite B (Recombinante)',
      diseasePrevented: 'Infeção viral do fígado (Hepatite B)',
      description: 'Protege contra a Hepatite B, infecção séria do fígado. Administrada idealmente nas primeiras 12-24 horas após o nascimento.',
      sideEffects: 'Dor local, vermelhidão, febre baixa ou cansaço nas primeiras 24 horas.',
      doses: [
        { id: 'hepb_0', name: 'Dose ao Nascer', ageMonths: 0 }
      ]
    },
    {
      id: 'penta',
      name: 'Pentavalente',
      fullName: 'Vacina Adsorvida Difteria, Tétano, Coqueluche, Hepatite B e Haemophilus Influenzae B',
      diseasePrevented: 'Difteria, Tétano, Coqueluche, Hepatite B e Meningite por Hib',
      description: 'Uma supervacina combinada de cinco componentes essenciais para blindar o bebê nos primeiros meses contra doenças respiratórias e infecciosas graves.',
      sideEffects: 'Febre moderada a alta nas primeiras 48h, irritabilidade extrema, inchaço e vermelhidão no local da injeção (na coxa).',
      doses: [
        { id: 'penta_1', name: '1ª Dose', ageMonths: 2 },
        { id: 'penta_2', name: '2ª Dose', ageMonths: 4 },
        { id: 'penta_3', name: '3ª Dose', ageMonths: 6 }
      ]
    },
    {
      id: 'vip',
      name: 'VIP (Paralisia Infantil)',
      fullName: 'Vacina Poliomielite 1, 2 e 3 (Inativada)',
      diseasePrevented: 'Poliomielite (Paralisia Infantil)',
      description: 'Vacina injetável contendo vírus inativados contra a paralisia infantil. Proporciona imunidade precoce, segura e eficaz.',
      sideEffects: 'Leve dor local ou vermelhidão transitória.',
      doses: [
        { id: 'vip_1', name: '1ª Dose', ageMonths: 2 },
        { id: 'vip_2', name: '2ª Dose', ageMonths: 4 },
        { id: 'vip_3', name: '3ª Dose', ageMonths: 6 }
      ]
    },
    {
      id: 'rotavirus',
      name: 'Rotavírus',
      fullName: 'Vacina Rotavírus Humano G1P[8] (Atenuada)',
      diseasePrevented: 'Diarreia grave e desidratação causadas por rotavírus',
      description: 'Vacina oral (em gotinhas) extremamente importante para evitar gastroenterites graves, vômito e diarreias que podem causar desidratação infantil.',
      sideEffects: 'Cólica leve, irritabilidade temporária, episódios isolados de regurgitação.',
      doses: [
        { id: 'rota_1', name: '1ª Dose', ageMonths: 2 },
        { id: 'rota_2', name: '2ª Dose', ageMonths: 4 }
      ]
    },
    {
      id: 'pneumo10',
      name: 'Pneumocócica 10',
      fullName: 'Vacina Pneumocócica 10-Valente (Conjugada)',
      diseasePrevented: 'Pneumonia, Meningite e Otite bacteriana',
      description: 'Protege contra 10 sorotipos da bactéria Pneumococo, responsável por pneumonias gravíssimas, sinusites dolorosas e quadros de meningite.',
      sideEffects: 'Inapetência temporária, febre baixa, sonolência elevada, sensibilidade local na coxa.',
      doses: [
        { id: 'pneumo_1', name: '1ª Dose', ageMonths: 2 },
        { id: 'pneumo_2', name: '2ª Dose', ageMonths: 4 },
        { id: 'pneumo_ref', name: 'Reforço', ageMonths: 12 }
      ]
    },
    {
      id: 'meningoc',
      name: 'Meningocócica C',
      fullName: 'Vacina Meningocócica C (Conjugada)',
      diseasePrevented: 'Meningite Meningocócica do sorogrupo C',
      description: 'Garante imunidade robusta contra a meningite bacteriana tipo C, uma infecção fulminante e extremamente grave no sistema nervoso.',
      sideEffects: 'Vermelhidão e endurecimento local na coxa, choro passageiro, dor ao movimentar a perninha.',
      doses: [
        { id: 'meningo_1', name: '1ª Dose', ageMonths: 3 },
        { id: 'meningo_2', name: '2ª Dose', ageMonths: 5 },
        { id: 'meningo_ref', name: 'Reforço', ageMonths: 12 }
      ]
    },
    {
      id: 'febre_amarela',
      name: 'Febre Amarela',
      fullName: 'Vacina Febre Amarela (Atenuada)',
      diseasePrevented: 'Febre Amarela',
      description: 'Indicada no calendário nacional. Essencial para áreas com circulação de mosquitos estritamente silvestres e áreas urbanas próximas.',
      sideEffects: 'Dor de cabeça leve, febre baixa após 4 a 7 dias da aplicação devido à resposta viral atenuada.',
      doses: [
        { id: 'fa_1', name: '1ª Dose', ageMonths: 9 },
        { id: 'fa_ref', name: 'Reforço', ageMonths: 48 } // 4 anos
      ]
    },
    {
      id: 'triplice_viral',
      name: 'Tríplice Viral (SCR)',
      fullName: 'Vacina Sarampo, Caxumba e Rubéola',
      diseasePrevented: 'Sarampo, Caxumba e Rubéola',
      description: 'A famosa vacina SCR. Protege contra vírus altamente transmissíveis e perigosos na infância. Essencial para a volta às aulas.',
      sideEffects: 'Coriza leve, febre suave que pode ocorrer entre 5 e 12 dias pós-vacina, manchas vermelhas tênues na pele de curta duração.',
      doses: [
        { id: 'scr_1', name: '1ª Dose', ageMonths: 12 },
        { id: 'scr_2', name: '2ª Dose', ageMonths: 15 }
      ]
    },
    {
      id: 'hepatite_a',
      name: 'Hepatite A',
      fullName: 'Vacina Hepatite A (Inativada)',
      diseasePrevented: 'Hepatite A',
      description: 'Previne a hepatite por transmissão alimentar ou de saneamento precário, essencial na fase inicial de exploração escolar.',
      sideEffects: 'Sintomas gástricos leves e passageiros, dor ou calor local no braço.',
      doses: [
        { id: 'hepa_du', name: 'Dose Única', ageMonths: 15 }
      ]
    },
    {
      id: 'dtp',
      name: 'DTP (Tríplice Bacteriana)',
      fullName: 'Vacina Adsorvida Difteria, Tétano e Pertussis',
      diseasePrevented: 'Difteria, Tétano e Coqueluche',
      description: 'Reforço celular essencial para manter os anticorpos elevados conquistados pela vacina Pentavalente original na fase de bebê.',
      sideEffects: 'Inchaço acentuado, coceira ou endurecimento na região da nádega/ombro, dor local que cede com compressa fria.',
      doses: [
        { id: 'dtp_ref1', name: '1º Reforço', ageMonths: 15 },
        { id: 'dtp_ref2', name: '2º Reforço', ageMonths: 48 } // 4 anos
      ]
    },
    {
      id: 'vop',
      name: 'VOP (Sabin Gotinha)',
      fullName: 'Vacina Poliomielite Oral 1 e 3 (Atenuada)',
      diseasePrevented: 'Paralisia Infantil (Poliomielite)',
      description: 'Dose de reforço em gotas conhecida pelo personagem "Zé Gotinha". Proporciona imunidade de rebanho fundamental.',
      sideEffects: 'Geralmente assintomática.',
      doses: [
        { id: 'vop_ref1', name: '1º Reforço', ageMonths: 15 },
        { id: 'vop_ref2', name: '2º Reforço', ageMonths: 48 } // 4 anos
      ]
    },
    {
      id: 'varicela',
      name: 'Varicela (Catapora)',
      fullName: 'Vacina Varicela (Atenuada)',
      diseasePrevented: 'Varicela (Catapora)',
      description: 'Previne as erupções na pele, febre e coceira intensa causadas pela Catapora, bem como infecções bacterianas das feridinhas resultantes.',
      sideEffects: 'Pequenas pápulas (bolinhas) vermelhas no corpo que somem sem deixar sequelas, febre baixa.',
      doses: [
        { id: 'vari_1', name: '1ª Dose', ageMonths: 15 },
        { id: 'vari_2', name: '2ª Dose', ageMonths: 48 } // 4 anos
      ]
    }
  ];

  // Application State Signals
  children = signal<Child[]>([]);
  activeChildId = signal<string | null>(null);
  records = signal<VaccinationRecord[]>([]);
  campaigns = signal<VaccineCampaign[]>([]);

  // Derived computed state
  activeChild = computed(() => {
    const id = this.activeChildId();
    if (!id) return null;
    return this.children().find(c => c.id === id) || null;
  });

  // Calculate vaccine status groups for ACTIVE child dynamically
  activeChildVaccines = computed<ChildVaccineGroup[]>(() => {
    const child = this.activeChild();
    if (!child) return [];

    const birth = new Date(child.birthDate + 'T12:00:00'); // Safe timezone parsing
    const now = new Date();
    const recordsMap = new Map<string, VaccinationRecord>();
    
    // Map records for quick lookup
    this.records().forEach(r => {
      if (r.childId === child.id) {
        recordsMap.set(`${r.vaccineId}_${r.doseId}`, r);
      }
    });

    return this.VACCINES.map(vaccine => {
      const vaccinePreset = new VaccinePreset(vaccine);
      const derivedDoses: DerivedDoseStatus[] = vaccine.doses.map(dose => {
        const scheduledDate = new Date(birth);
        scheduledDate.setMonth(scheduledDate.getMonth() + dose.ageMonths);

        const recKey = `${vaccine.id}_${dose.id}`;
        const record = recordsMap.get(recKey);

        let status: 'applied' | 'pending' | 'overdue' = 'pending';
        
        if (record && record.appliedDate) {
          status = 'applied';
        } else {
          const gracePeriod = dose.gracePeriodMonths || 1;
          const limitDate = new Date(scheduledDate);
          limitDate.setMonth(limitDate.getMonth() + gracePeriod);
          if (now > limitDate) {
            status = 'overdue';
          }
        }

        return new DerivedDoseStatus({
          doseId: dose.id,
          doseName: dose.name,
          ageMonths: dose.ageMonths,
          scheduledDate,
          status,
          appliedDate: record?.appliedDate,
          appliedPlace: record?.appliedPlace,
          lotNumber: record?.lotNumber,
          vacinatorName: record?.vacinatorName
        });
      });

      const isFullyApplied = derivedDoses.every(d => d.status === 'applied');
      const hasOverdue = derivedDoses.some(d => d.status === 'overdue');

      return new ChildVaccineGroup({
        vaccine: vaccinePreset,
        doses: derivedDoses,
        isFullyApplied,
        hasOverdue
      });
    });
  });

  // Aggregated indicators for the selected child
  activeChildStats = computed(() => {
    const vaccineGroups = this.activeChildVaccines();
    if (vaccineGroups.length === 0) {
      return { totalDoses: 0, appliedDoses: 0, pendingDoses: 0, overdueDoses: 0, progress: 0 };
    }

    let totalDoses = 0;
    let appliedDoses = 0;
    let pendingDoses = 0;
    let overdueDoses = 0;

    vaccineGroups.forEach(group => {
      group.doses.forEach(dose => {
        totalDoses++;
        if (dose.status === 'applied') {
          appliedDoses++;
        } else if (dose.status === 'overdue') {
          overdueDoses++;
        } else {
          pendingDoses++;
        }
      });
    });

    const progress = totalDoses > 0 ? Math.round((appliedDoses / totalDoses) * 100) : 0;

    return {
      totalDoses,
      appliedDoses,
      pendingDoses,
      overdueDoses,
      progress
    };
  });

  // Check which active campaigns match the child's age
  activeChildCampaigns = computed(() => {
    const child = this.activeChild();
    if (!child) return [];

    const ageInMonths = child.getAgeInMonths();
    return this.campaigns().filter(campaign => {
      return campaign.isAgeInRange(ageInMonths);
    });
  });

  constructor() {
    this.loadFromStorage();

    // Automatically synchronize state changes with localStorage
    effect(() => {
      localStorage.setItem('vax_children', JSON.stringify(this.children()));
    });
    effect(() => {
      localStorage.setItem('vax_records', JSON.stringify(this.records()));
    });
    effect(() => {
      localStorage.setItem('vax_campaigns', JSON.stringify(this.campaigns()));
    });
    effect(() => {
      const id = this.activeChildId();
      if (id) {
        localStorage.setItem('vax_active_id', id);
      } else {
        localStorage.removeItem('vax_active_id');
      }
    });
  }

  // Helper: Calculate child age in months based on YYYY-MM-DD birthdate
  calculateAgeInMonths(birthDateStr: string): number {
    const birth = new Date(birthDateStr + 'T12:00:00');
    const now = new Date();
    
    const years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    // adjust if day in month hasn't occurred yet
    if (now.getDate() < birth.getDate()) {
      months--;
    }
    
    return (years * 12) + months;
  }

  // Helper: Friendly age string (e.g. "2 meses", "1 ano e 3 meses")
  formatFriendlyAge(birthDateStr: string): string {
    const monthsTotal = this.calculateAgeInMonths(birthDateStr);
    if (monthsTotal < 0) return 'Ainda não nascido';
    if (monthsTotal === 0) {
      // Return days instead
      const birth = new Date(birthDateStr + 'T12:00:00');
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
    if (monthsTotal < 12) {
      return `${monthsTotal} ${monthsTotal === 1 ? 'mês' : 'meses'}`;
    }
    const years = Math.floor(monthsTotal / 12);
    const months = monthsTotal % 12;
    if (months === 0) {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  // Seed relative birthdates which will always feel perfectly aged (Scenario 1, 2, 4)
  private getRelativeBirthDateString(offsetMonths: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - offsetMonths);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Load state or seed default mock figures for a rich interactive experience right out of the box
  private loadFromStorage() {
    const localChildren = localStorage.getItem('vax_children');
    const localRecords = localStorage.getItem('vax_records');
    const localCampaigns = localStorage.getItem('vax_campaigns');
    const localActive = localStorage.getItem('vax_active_id');

    if (localChildren && localRecords && localCampaigns) {
      const parsedChildren: any[] = JSON.parse(localChildren);
      this.children.set(parsedChildren.map((c: any) => new Child(c)));
      this.records.set(JSON.parse(localRecords).map((r: any) => new VaccinationRecord(r)));
      this.campaigns.set(JSON.parse(localCampaigns).map((c: any) => new VaccineCampaign(c)));
      const activeId = localActive || (parsedChildren[0]?.id || null);
      this.activeChildId.set(activeId);
    } else {
      this.seedData();
    }
  }

  // Master seeder for assessing scenarios perfectly.
  seedData() {
    // 1. Children seed with dynamic relative birthdates to preserve status (overdue, pending) regardless of actual current run year
    const babyArthurBirth = this.getRelativeBirthDateString(3); // 3 months old (has due 2m and outstanding 3m)
    const babySofiaBirth = this.getRelativeBirthDateString(14);   // 14 months old (MMR at 12m is overdue)
    const kidGabrielBirth = this.getRelativeBirthDateString(54);  // 4.5 years old (DTP, Varicela, VOP at 4 years might need attention)

    const initialChildren: ChildData[] = [
      {
        id: 'child_arthur',
        name: 'Arthur Mendes',
        birthDate: babyArthurBirth,
        gender: 'M',
        avatar: '👶🏼',
        bloodType: 'A+',
        weight: 6.2,
        height: 61
      },
      {
        id: 'child_sofia',
        name: 'Sofia Mendes',
        birthDate: babySofiaBirth,
        gender: 'F',
        avatar: '👧🏻',
        bloodType: 'O-',
        weight: 10.5,
        height: 78
      },
      {
        id: 'child_gabriel',
        name: 'Gabriel Mendes',
        birthDate: kidGabrielBirth,
        gender: 'M',
        avatar: '👦🏽',
        bloodType: 'AB+',
        weight: 16.8,
        height: 104
      }
    ];

    // 2. Default vaccination records applied
    // Arthur (3 months old) has applied: BCG (0m), Hepatitis B (0m), and Pneumocócica 1ª dose (2m).
    // Pentavalente 1st dose (2m) and VIP 1st dose (2m) are overdue/pending!
    const initialRecords: VaccinationRecordData[] = [
      {
        id: 'record_arthur_bcg_du',
        childId: 'child_arthur',
        vaccineId: 'bcg',
        doseId: 'bcg_du',
        appliedDate: babyArthurBirth,
        appliedPlace: 'Maternidade Santa Joana',
        lotNumber: 'BCG987-AX',
        vacinatorName: 'Enf. Clarice Antunes'
      },
      {
        id: 'record_arthur_hepb_0',
        childId: 'child_arthur',
        vaccineId: 'hepb',
        doseId: 'hepb_0',
        appliedDate: babyArthurBirth,
        appliedPlace: 'Maternidade Santa Joana',
        lotNumber: 'HEP901-B',
        vacinatorName: 'Enf. Clarice Antunes'
      },
      {
        id: 'record_arthur_pneumo_1',
        childId: 'child_arthur',
        vaccineId: 'pneumo10',
        doseId: 'pneumo_1',
        appliedDate: this.calculateDoseExactDate(babyArthurBirth, 2),
        appliedPlace: 'UBS Central de Pinheiros',
        lotNumber: 'PN1022-P',
        vacinatorName: 'Dr. Roberto Cruz'
      },

      // Sofia (14 months old) has applied almost everything from months 0, 2, 3, 4, 5, 6, 9.
      // But she missed her 12 months Pneumo booster and her 12 months Tríplice Viral (MMR), making them OVERDUE!
      {
        id: 'record_sofia_bcg_du',
        childId: 'child_sofia',
        vaccineId: 'bcg',
        doseId: 'bcg_du',
        appliedDate: babySofiaBirth,
        appliedPlace: 'Hosp. Albert Einstein',
        lotNumber: 'BCG543-ZZ',
        vacinatorName: 'Enf. Joana Santos'
      },
      {
        id: 'record_sofia_hepb_0',
        childId: 'child_sofia',
        vaccineId: 'hepb',
        doseId: 'hepb_0',
        appliedDate: babySofiaBirth,
        appliedPlace: 'Hosp. Albert Einstein',
        lotNumber: 'HEP102-Y',
        vacinatorName: 'Enf. Joana Santos'
      }
    ];

    // Bulk add routine early vaccinations Sofia completed successfully
    const completedSofiaAges = [2, 3, 4, 5, 6, 9];
    this.VACCINES.forEach(v => {
      v.doses.forEach(d => {
        if (completedSofiaAges.includes(d.ageMonths)) {
          initialRecords.push({
            id: `record_sofia_${v.id}_${d.id}`,
            childId: 'child_sofia',
            vaccineId: v.id,
            doseId: d.id,
            appliedDate: this.calculateDoseExactDate(babySofiaBirth, d.ageMonths),
            appliedPlace: 'Posto Integrado de Saúde Saúde-Sul',
            lotNumber: 'LOT-9988-X',
            vacinatorName: 'Enf. Maria Aparecida'
          });
        }
      });
    });

    // Gabriel (4.5 years old / 54 months old) has applied everything except 4 years old boosters.
    // DTP booster, Varicela 2nd dose, VOP booster, and Febre Amarela booster at 48 months are pending attention or overdue!
    this.VACCINES.forEach(v => {
      v.doses.forEach(d => {
        if (d.ageMonths <= 15) {
          initialRecords.push({
            id: `record_gabriel_${v.id}_${d.id}`,
            childId: 'child_gabriel',
            vaccineId: v.id,
            doseId: d.id,
            appliedDate: this.calculateDoseExactDate(kidGabrielBirth, d.ageMonths),
            appliedPlace: 'UBS Vila Madalena',
            lotNumber: 'CAB-1122-V',
            vacinatorName: 'Enf. Sérgio Castro'
          });
        }
      });
    });

    // 3. Campaigns List (Scenario 3)
    const initialCampaigns: VaccineCampaignData[] = [
      {
        id: 'camp_influenza',
        title: 'Campanha de Vacinação Contra a Gripe 2026',
        description: 'Chegou a hora de proteger nossos pequeninos! A gripe (Influenza) pode evoluir para quadros graves em crianças pequenas. Vacina altamente segura e atualizada com as cepas do ano.',
        targetAgeText: 'Crianças de 6 meses até 5 anos, 11 meses e 29 dias.',
        minAgeMonths: 6,
        maxAgeMonths: 72,
        startDate: '2026-05-01',
        endDate: '2026-07-31',
        bannerImage: 'https://picsum.photos/seed/influenza_campaign/800/400'
      },
      {
        id: 'camp_polio',
        title: 'Campanha Nacional Gotinha de Gotinha',
        description: 'Não deixe a paralisia infantil voltar! Traga seu filho para tomar a dose de reforço da vacina Poliomielite Oral (a gotinha).',
        targetAgeText: 'Crianças com idade entre 1 e 4 anos completos.',
        minAgeMonths: 12,
        maxAgeMonths: 59,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        bannerImage: 'https://picsum.photos/seed/polio_gotinha/800/400'
      },
      {
        id: 'camp_multivac_teen',
        title: 'Operação Caderneta Limpa: Multivacinação',
        description: 'Mutirão em todo o Brasil para atualizar doses em atraso da Pentavalente, Tríplice Viral, HPV, Meningocócica e Febre Amarela. Vá até a UBS mais próxima!',
        targetAgeText: 'Crianças e adolescentes de 0 a 15 anos.',
        minAgeMonths: 0,
        maxAgeMonths: 180,
        startDate: '2026-06-15',
        endDate: '2026-07-15',
        bannerImage: 'https://picsum.photos/seed/multivacination/800/400'
      }
    ];

    this.children.set(initialChildren.map(c => new Child(c)));
    this.records.set(initialRecords.map(r => new VaccinationRecord(r)));
    this.campaigns.set(initialCampaigns.map(c => new VaccineCampaign(c)));
    this.activeChildId.set('child_arthur');
  }

  // Utility to generate dynamic dose dates relative to birth
  private calculateDoseExactDate(birthDateStr: string, ageMonths: number): string {
    const d = new Date(birthDateStr + 'T12:00:00');
    d.setMonth(d.getMonth() + ageMonths);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Service Actions

  // Change currently managed Child
  selectChild(id: string) {
    if (this.children().some(c => c.id === id)) {
      this.activeChildId.set(id);
    }
  }

  // Create a new child
  addChild(child: Child): void {
    const updated = [...this.children(), child];
    this.children.set(updated);
    this.activeChildId.set(child.id); // auto-select new child
  }

  // Update details of an existing child
  updateChild(child: Child): void {
    const updated = this.children().map(c => c.id === child.id ? child : c);
    this.children.set(updated);
  }

  // Delete child and their records
  deleteChild(childId: string): void {
    const filteredChildren = this.children().filter(c => c.id !== childId);
    this.children.set(filteredChildren);
    
    // Clean records
    const filteredRecords = this.records().filter(r => r.childId !== childId);
    this.records.set(filteredRecords);

    // Auto-select another or null
    if (this.activeChildId() === childId) {
      if (filteredChildren.length > 0) {
        this.activeChildId.set(filteredChildren[0].id);
      } else {
        this.activeChildId.set(null);
      }
    }
  }

  // Apply a vaccine dose
  applyVaccineDose(record: Omit<VaccinationRecord, 'id'>): void {
    const newRecord = VaccinationRecord.fromData(record);

    const exists = this.records().some(r => r.id === newRecord.id);
    let updated: VaccinationRecord[];
    if (exists) {
      updated = this.records().map(r => r.id === newRecord.id ? newRecord : r);
    } else {
      updated = [...this.records(), newRecord];
    }
    this.records.set(updated);
  }

  // Remove a vaccine dose (mark as pending / unapplied)
  undoVaccineDose(childId: string, vaccineId: string, doseId: string): void {
    const recordId = `record_${childId}_${vaccineId}_${doseId}`;
    const updated = this.records().filter(r => r.id !== recordId);
    this.records.set(updated);
  }
}
