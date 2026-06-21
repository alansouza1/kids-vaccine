import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ChildVaccineGroup, VaccinePreset, DerivedDoseStatus } from '../../../core/models/vaccine.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-vaccine-card',
  standalone: true,
  imports: [CommonModule, IonIcon, StatusBadgeComponent],
  templateUrl: './vaccine-card.component.html',
  styles: [`:host { display: block; height: 100%; }`]
})
export class VaccineCardComponent {
  @Input() group!: ChildVaccineGroup;
  @Input() showInfoButton = true;
  @Output() applyDose = new EventEmitter<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }>();
  @Output() undoDose = new EventEmitter<{ vaccineId: string; doseId: string }>();
  @Output() showDetail = new EventEmitter<VaccinePreset>();
}
