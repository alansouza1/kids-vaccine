import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon, IonModal } from '@ionic/angular/standalone';
import { VaccinePreset } from '../../../core/models/vaccine.model';

@Component({
  selector: 'app-vaccine-detail-modal',
  standalone: true,
  imports: [IonIcon, IonModal],
  templateUrl: './vaccine-detail-modal.component.html'
})
export class VaccineDetailModalComponent {
  @Input() vaccine: VaccinePreset | null = null;
  @Output() dismiss = new EventEmitter<void>();
}
