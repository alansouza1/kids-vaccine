import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonIcon, IonContent, IonFooter, IonTabBar, IonTabButton, IonLabel, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  shieldHalf, grid, book, megaphone, people, refresh, add, addCircleOutline,
  checkmark, warning, alertCircle, time, checkmarkCircle,
  alertCircleOutline, calendar, person, peopleOutline,
  search, informationCircle, shield, arrowUndo, bandage,
  trash, create, close
} from 'ionicons/icons';
import { VaccineService } from '../core/services/vaccine.service';
import { Child } from '../core/models/child.model';
import { VaccinePreset, DerivedDoseStatus, ChildVaccineGroup } from '../core/models/vaccine.model';
import { DashboardTabComponent } from './tabs/dashboard/dashboard-tab.component';
import { TimelineTabComponent } from './tabs/timeline/timeline-tab.component';
import { CampaignsTabComponent } from './tabs/campaigns/campaigns-tab.component';
import { ChildrenTabComponent } from './tabs/children/children-tab.component';
import { ChildCardComponent } from '../shared/components/child-card/child-card.component';

@Component({
  selector: 'app-vaccine-app',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, IonIcon, IonContent, IonFooter,
    IonTabBar, IonTabButton, IonLabel, IonModal,
    DashboardTabComponent, TimelineTabComponent, CampaignsTabComponent,
    ChildrenTabComponent, ChildCardComponent
  ],
  templateUrl: './vaccine-app.html'
})
export class VaccineApp {
  protected readonly vaxService = inject(VaccineService);

  activeTab = signal<'dashboard' | 'timeline' | 'campaigns' | 'children'>('dashboard');
  timelineSearchQuery = signal<string>('');
  timelineFilter = signal<'all' | 'applied' | 'pending' | 'overdue'>('all');
  selectedVaccineForDetail = signal<VaccinePreset | null>(null);
  vaccineToLog = signal<{ vaccine: VaccinePreset; dose: DerivedDoseStatus } | null>(null);
  editingChild = signal<Child | null>(null);
  showChildModal = signal<boolean>(false);

  readonly avatarOptions = ['👶🏼', '👶🏾', '👶🏻', '👧🏻', '👧🏼', '👧🏽', '👦🏽', '👦🏻', '👦🏾', '🦁', '🐻', '🦖', '🦄', '🐳'];

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

  filteredVaccineGroups = computed<ChildVaccineGroup[]>(() => {
    const query = this.timelineSearchQuery().toLowerCase().trim();
    const filter = this.timelineFilter();
    const groups = this.vaxService.activeChildVaccines();

    return groups.filter(g => {
      const matchesText = g.vaccine.name.toLowerCase().includes(query) ||
        g.vaccine.fullName.toLowerCase().includes(query) ||
        g.vaccine.diseasePrevented.toLowerCase().includes(query);
      if (!matchesText) return false;
      if (filter === 'all') return true;
      if (filter === 'applied') return g.doses.some(d => d.isApplied);
      if (filter === 'overdue') return g.hasOverdue;
      if (filter === 'pending') return g.doses.some(d => d.isPending);
      return true;
    }).map(g => {
      if (filter === 'all') return g;
      const filtered = g.doses.filter(d => {
        if (filter === 'applied') return d.isApplied;
        if (filter === 'overdue') return d.isOverdue;
        if (filter === 'pending') return d.isPending;
        return true;
      });
      return new ChildVaccineGroup({
        vaccine: g.vaccine,
        doses: filtered,
        isFullyApplied: filtered.every(d => d.isApplied),
        hasOverdue: filtered.some(d => d.isOverdue)
      });
    });
  });

  overdueDosesForActiveChild = computed<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }[]>(() => {
    const list: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];
    this.vaxService.activeChildVaccines().forEach(group => {
      group.doses.forEach(dose => {
        if (dose.isOverdue) list.push({ vaccine: group.vaccine, dose });
      });
    });
    return list;
  });

  upcomingDosesForActiveChild = computed<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }[]>(() => {
    const list: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];
    this.vaxService.activeChildVaccines().forEach(group => {
      group.doses.forEach(dose => {
        if (dose.isPending) list.push({ vaccine: group.vaccine, dose });
      });
    });
    return list.sort((a, b) => a.dose.scheduledDate.getTime() - b.dose.scheduledDate.getTime()).slice(0, 5);
  });

  constructor() {
    addIcons({
      'shield-half': shieldHalf, 'grid': grid, 'book': book, 'megaphone': megaphone,
      'people': people, 'refresh': refresh, 'add': add, 'add-circle-outline': addCircleOutline,
      'checkmark': checkmark, 'warning': warning, 'alert-circle': alertCircle, 'time': time,
      'checkmark-circle': checkmarkCircle, 'alert-circle-outline': alertCircleOutline,
      'calendar': calendar, 'person': person, 'people-outline': peopleOutline,
      'search': search, 'information-circle': informationCircle, 'shield': shield,
      'arrow-undo': arrowUndo, 'bandage': bandage, 'trash': trash, 'create': create, 'close': close
    });
    if (this.vaxService.children().length === 0) {
      this.vaxService.seedData();
    }
  }

  setTab(tab: 'dashboard' | 'timeline' | 'campaigns' | 'children') {
    this.activeTab.set(tab);
  }

  selectChild(id: string) {
    this.vaxService.selectChild(id);
    this.timelineSearchQuery.set('');
    this.timelineFilter.set('all');
  }

  openAddChildModal() {
    this.editingChild.set(null);
    this.childForm.reset({ id: '', name: '', birthDate: '', gender: 'M', avatar: '👶🏼', bloodType: '', weight: null, height: null });
    this.showChildModal.set(true);
  }

  openEditChildModal(child: Child) {
    this.editingChild.set(child);
    this.childForm.setValue({
      id: child.id, name: child.name, birthDate: child.birthDate,
      gender: child.gender, avatar: child.avatar,
      bloodType: child.bloodType || '', weight: child.weight || null, height: child.height || null
    });
    this.showChildModal.set(true);
  }

  saveChild() {
    if (this.childForm.invalid) { this.childForm.markAllAsTouched(); return; }
    const value = this.childForm.value;
    const isEditing = !!value.id;
    const child = new Child({
      id: isEditing ? (value.id as string) : `child_${Date.now()}`,
      name: value.name as string,
      birthDate: value.birthDate as string,
      gender: value.gender as 'M' | 'F',
      avatar: value.avatar as string,
      bloodType: value.bloodType || undefined,
      weight: value.weight ? Number(value.weight) : undefined,
      height: value.height ? Number(value.height) : undefined
    });
    if (isEditing) { this.vaxService.updateChild(child); }
    else { this.vaxService.addChild(child); }
    this.showChildModal.set(false);
  }

  deleteChild(childId: string) {
    if (confirm('Remover esta criança e todo o histórico? Esta ação não pode ser desfeita.')) {
      this.vaxService.deleteChild(childId);
    }
  }

  openLogDoseModal(vaccine: VaccinePreset, dose: DerivedDoseStatus) {
    const today = new Date().toISOString().split('T')[0];
    this.vaccineToLog.set({ vaccine, dose });
    this.vaxLogForm.setValue({
      appliedDate: dose.appliedDate || today,
      appliedPlace: dose.appliedPlace || 'UBS Central',
      lotNumber: dose.lotNumber || 'LT-' + Math.floor(Math.random() * 900000 + 100000) + 'X',
      vacinatorName: dose.vacinatorName || 'Enf. Responsável'
    });
  }

  saveDoseLog() {
    if (this.vaxLogForm.invalid || !this.vaccineToLog()) { this.vaxLogForm.markAllAsTouched(); return; }
    const value = this.vaxLogForm.value;
    const data = this.vaccineToLog()!;
    const childId = this.vaxService.activeChildId();
    if (childId) {
      this.vaxService.applyVaccineDose({
        childId, vaccineId: data.vaccine.id, doseId: data.dose.doseId,
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
    if (childId && confirm('Remover o registro desta vacina?')) {
      this.vaxService.undoVaccineDose(childId, vaccineId, doseId);
    }
  }

  resetDatabase() {
    if (confirm('Redefinir para dados padrão do desafio?')) {
      this.vaxService.seedData();
      this.setTab('dashboard');
    }
  }

  formatDoseDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatRawDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
