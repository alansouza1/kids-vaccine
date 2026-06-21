import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonContent, IonFooter, IonTabBar, IonTabButton, IonLabel } from '@ionic/angular/standalone';
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
import { ProgressCircleComponent } from '../shared/components/progress-circle/progress-circle.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { VaccineDetailModalComponent } from './components/vaccine-detail-modal/vaccine-detail-modal.component';
import { VaccineLogModalComponent } from './components/vaccine-log-modal/vaccine-log-modal.component';
import { ChildFormModalComponent } from './components/child-form-modal/child-form-modal.component';

@Component({
  selector: 'app-vaccine-app',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, IonIcon, IonContent, IonFooter,
    IonTabBar, IonTabButton, IonLabel,
    DashboardTabComponent, TimelineTabComponent, CampaignsTabComponent,
    ChildrenTabComponent, ChildCardComponent, ProgressCircleComponent,
    AppHeaderComponent, VaccineDetailModalComponent, VaccineLogModalComponent,
    ChildFormModalComponent
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
    this.showChildModal.set(true);
  }

  openEditChildModal(child: Child) {
    this.editingChild.set(child);
    this.showChildModal.set(true);
  }

  openLogDoseModal(vaccine: VaccinePreset, dose: DerivedDoseStatus) {
    this.vaccineToLog.set({ vaccine, dose });
  }

  undoDose(vaccineId: string, doseId: string) {
    const childId = this.vaxService.activeChildId();
    if (childId && confirm('Remover o registro desta vacina?')) {
      this.vaxService.undoVaccineDose(childId, vaccineId, doseId);
    }
  }

  deleteChild(childId: string) {
    if (confirm('Remover esta criança e todo o histórico? Esta ação não pode ser desfeita.')) {
      this.vaxService.deleteChild(childId);
    }
  }

  resetDatabase() {
    if (confirm('Redefinir para dados padrão do desafio?')) {
      this.vaxService.seedData();
      this.setTab('dashboard');
    }
  }
}
