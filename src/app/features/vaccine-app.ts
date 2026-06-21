import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  shieldHalf, grid, book, megaphone, people, refresh, add, addCircleOutline,
  checkmark, warning, alertCircle, time, checkmarkCircle, 
  alertCircleOutline, calendar, person, peopleOutline, 
  search, informationCircle, shield, arrowUndo, bandage, 
  trash, create, close 
} from 'ionicons/icons';
import { VaccineService } from '../core/services/vaccine.service';
import { Child, VaccinePreset, DerivedDoseStatus, ChildVaccineGroup } from '../core/models/vaccine.model';

@Component({
  selector: 'app-vaccine-app',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, IonIcon],
  templateUrl: './vaccine-app.html',
  styleUrls: []
})
export class VaccineApp implements OnInit {
  protected readonly vaxService = inject(VaccineService);

  constructor() {
    addIcons({
      'shield-half': shieldHalf,
      'grid': grid,
      'book': book,
      'megaphone': megaphone,
      'people': people,
      'refresh': refresh,
      'add': add,
      'add-circle-outline': addCircleOutline,
      'checkmark': checkmark,
      'warning': warning,
      'alert-circle': alertCircle,
      'time': time,
      'checkmark-circle': checkmarkCircle,
      'alert-circle-outline': alertCircleOutline,
      'calendar': calendar,
      'person': person,
      'people-outline': peopleOutline,
      'search': search,
      'information-circle': informationCircle,
      'shield': shield,
      'arrow-undo': arrowUndo,
      'bandage': bandage,
      'trash': trash,
      'create': create,
      'close': close
    });
  }

  // Active Tab state
  activeTab = signal<'dashboard' | 'timeline' | 'campaigns' | 'children'>('dashboard');

  // Search and filter states for the Timeline
  timelineSearchQuery = signal<string>('');
  timelineFilter = signal<'all' | 'applied' | 'pending' | 'overdue'>('all');

  // Detail Modal overlay state
  selectedVaccineForDetail = signal<VaccinePreset | null>(null);

  // Vaccine Application Modal overlay state
  vaccineToLog = signal<{ vaccine: VaccinePreset; dose: DerivedDoseStatus } | null>(null);

  // Child Editor/Creation Sheet overlay state
  editingChild = signal<Child | null>(null);
  showChildModal = signal<boolean>(false);

  // Avatar choices for kids
  readonly avatarOptions = ['👶🏼', '👶🏾', '👶🏻', '👧🏻', '👧🏼', '👧🏽', '👦🏽', '👦🏻', '👦🏾', '🦁', '🐻', '🦖', '🦄', '🐳'];

  // Reactive Forms setups
  childForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl<'M' | 'F'>('M', [Validators.required]),
    avatar: new FormControl('👶🏼', [Validators.required]),
    bloodType: new FormControl(''),
    weight: new FormControl<number | null>(null, [Validators.min(0.1)]),
    height: new FormControl<number | null>(null, [Validators.min(10)])
  });

  vaxLogForm = new FormGroup({
    appliedDate: new FormControl('', [Validators.required]),
    appliedPlace: new FormControl(''),
    lotNumber: new FormControl(''),
    vacinatorName: new FormControl('')
  });

  // Filtered vaccination groups based on timeline user query and filter select
  filteredVaccineGroups = computed<ChildVaccineGroup[]>(() => {
    const query = this.timelineSearchQuery().toLowerCase().trim();
    const filter = this.timelineFilter();
    const groups = this.vaxService.activeChildVaccines();

    return groups.filter(g => {
      // 1. Text Search matching
      const matchesText = g.vaccine.name.toLowerCase().includes(query) || 
                          g.vaccine.fullName.toLowerCase().includes(query) ||
                          g.vaccine.diseasePrevented.toLowerCase().includes(query);

      if (!matchesText) return false;

      // 2. Status Filter matching
      if (filter === 'all') return true;
      if (filter === 'applied') return g.doses.some(d => d.status === 'applied');
      if (filter === 'overdue') return g.hasOverdue;
      if (filter === 'pending') return g.doses.some(d => d.status === 'pending');

      return true;
    }).map(g => {
      // Sub-filter doses if looking for absolute matching
      if (filter === 'all') return g;
      return {
        ...g,
        doses: g.doses.filter(d => {
          if (filter === 'applied') return d.status === 'applied';
          if (filter === 'overdue') return d.status === 'overdue';
          if (filter === 'pending') return d.status === 'pending';
          return true;
        })
      };
    });
  });

  // Dynamic alert for critical doses in arrears
  overdueDosesForActiveChild = computed<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }[]>(() => {
    const list: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];
    this.vaxService.activeChildVaccines().forEach(group => {
      group.doses.forEach(dose => {
        if (dose.status === 'overdue') {
          list.push({ vaccine: group.vaccine, dose });
        }
      });
    });
    return list;
  });

  // Dynamic list of upcoming doses (due in next 2 months or current pending)
  upcomingDosesForActiveChild = computed<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }[]>(() => {
    const list: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];
    this.vaxService.activeChildVaccines().forEach(group => {
      group.doses.forEach(dose => {
        if (dose.status === 'pending') {
          list.push({ vaccine: group.vaccine, dose });
        }
      });
    });
    // Sort by scheduled date
    return list.sort((a, b) => a.dose.scheduledDate.getTime() - b.dose.scheduledDate.getTime()).slice(0, 5);
  });

  ngOnInit() {
    // If we have children, make sure the database is up and loaded or reset
    if (this.vaxService.children().length === 0) {
      this.vaxService.seedData();
    }
  }

  // Active Child handling
  selectChild(id: string) {
    this.vaxService.selectChild(id);
    // Reset filters
    this.timelineSearchQuery.set('');
    this.timelineFilter.set('all');
  }

  // Tab switching animations/handlers
  setTab(tab: 'dashboard' | 'timeline' | 'campaigns' | 'children') {
    this.activeTab.set(tab);
  }

  // Modal Actions: Child Form
  openAddChildModal() {
    this.editingChild.set(null);
    this.childForm.reset({
      id: '',
      name: '',
      birthDate: '',
      gender: 'M',
      avatar: '👶🏼',
      bloodType: '',
      weight: null,
      height: null
    });
    this.showChildModal.set(true);
  }

  openEditChildModal(child: Child) {
    this.editingChild.set(child);
    this.childForm.setValue({
      id: child.id,
      name: child.name,
      birthDate: child.birthDate,
      gender: child.gender,
      avatar: child.avatar,
      bloodType: child.bloodType || '',
      weight: child.weight || null,
      height: child.height || null
    });
    this.showChildModal.set(true);
  }

  saveChild() {
    if (this.childForm.invalid) {
      this.childForm.markAllAsTouched();
      return;
    }

    const value = this.childForm.value;
    const isEditing = !!value.id;

    const childData: Child = {
      id: isEditing ? (value.id as string) : `child_${Date.now()}`,
      name: value.name as string,
      birthDate: value.birthDate as string,
      gender: value.gender as 'M' | 'F',
      avatar: value.avatar as string,
      bloodType: value.bloodType || undefined,
      weight: value.weight ? Number(value.weight) : undefined,
      height: value.height ? Number(value.height) : undefined
    };

    if (isEditing) {
      this.vaxService.updateChild(childData);
    } else {
      this.vaxService.addChild(childData);
    }

    this.showChildModal.set(false);
  }

  deleteChild(childId: string) {
    if (confirm('Tem certeza de que deseja remover esta criança e todo o seu histórico de vacinação? Esta ação não pode ser desfeita.')) {
      this.vaxService.deleteChild(childId);
    }
  }

  // Modal Actions: Dose Apply Log Sheet
  openLogDoseModal(vaccine: VaccinePreset, dose: DerivedDoseStatus) {
    const todayStr = new Date().toISOString().split('T')[0];
    this.vaccineToLog.set({ vaccine, dose });
    
    // Autofill with today and previous credentials if existing
    this.vaxLogForm.setValue({
      appliedDate: dose.appliedDate || todayStr,
      appliedPlace: dose.appliedPlace || 'UBS Central',
      lotNumber: dose.lotNumber || 'LT-' + Math.floor(Math.random() * 900000 + 100000) + 'X',
      vacinatorName: dose.vacinatorName || 'Enf. Responsável'
    });
  }

  saveDoseLog() {
    if (this.vaxLogForm.invalid || !this.vaccineToLog()) {
      this.vaxLogForm.markAllAsTouched();
      return;
    }

    const value = this.vaxLogForm.value;
    const data = this.vaccineToLog()!;
    const activeChildId = this.vaxService.activeChildId();

    if (activeChildId) {
      this.vaxService.applyVaccineDose({
        childId: activeChildId,
        vaccineId: data.vaccine.id,
        doseId: data.dose.doseId,
        appliedDate: value.appliedDate as string,
        appliedPlace: value.appliedPlace || undefined,
        lotNumber: value.lotNumber || undefined,
        vacinatorName: value.vacinatorName || undefined
      });
    }

    this.vaccineToLog.set(null);
  }

  undoDose(vaccineId: string, doseId: string) {
    const childId = this.vaxService.activeChildId();
    if (childId && confirm('Deseja realmente remover o registro desta vacina? O status voltará a ser pendente.')) {
      this.vaxService.undoVaccineDose(childId, vaccineId, doseId);
    }
  }

  // Quick reset helper for reviewers
  resetDatabase() {
    if (confirm('Deseja redefinir os dados para os perfis padrão do desafio Cyrrus (Sofia, Arthur e Gabriel)?')) {
      this.vaxService.seedData();
      this.setTab('dashboard');
    }
  }

  // Helper date view
  formatDoseDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatRawDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
