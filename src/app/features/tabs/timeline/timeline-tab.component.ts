import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { VaccineService } from '../../../core/services/vaccine.service';
import { VaccinePreset, DerivedDoseStatus, ChildVaccineGroup } from '../../../core/models/vaccine.model';
import { VaccineCardComponent } from '../../../shared/components/vaccine-card/vaccine-card.component';

@Component({
  selector: 'app-timeline-tab',
  standalone: true,
  imports: [CommonModule, IonIcon, ReactiveFormsModule, VaccineCardComponent],
  templateUrl: './timeline-tab.component.html'
})
export class TimelineTabComponent {
  protected readonly vaxService = inject(VaccineService);

  @Input() filteredGroups: ChildVaccineGroup[] = [];
  @Input() searchQuery = '';
  @Input() activeFilter: 'all' | 'applied' | 'pending' | 'overdue' = 'all';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() activeFilterChange = new EventEmitter<'all' | 'applied' | 'pending' | 'overdue'>();
  @Output() applyDose = new EventEmitter<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }>();
  @Output() undoDose = new EventEmitter<{ vaccineId: string; doseId: string }>();
  @Output() showDetail = new EventEmitter<VaccinePreset>();
}
