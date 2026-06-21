import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonIcon, IonModal } from '@ionic/angular/standalone';
import { VaccinePreset, DerivedDoseStatus } from '../../../core/models/vaccine.model';
import { VaccineService } from '../../../core/services/vaccine.service';

@Component({
  selector: 'app-vaccine-log-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonIcon, IonModal],
  templateUrl: './vaccine-log-modal.component.html'
})
export class VaccineLogModalComponent implements OnChanges {
  private readonly vaxService = inject(VaccineService);

  @Input() logData: { vaccine: VaccinePreset; dose: DerivedDoseStatus } | null = null;
  @Output() dismiss = new EventEmitter<void>();

  logForm = new FormGroup({
    appliedDate: new FormControl('', [Validators.required]),
    appliedPlace: new FormControl(''),
    lotNumber: new FormControl(''),
    vacinatorName: new FormControl('')
  });

  ngOnChanges() {
    if (this.logData) {
      const d = this.logData.dose;
      const today = new Date().toISOString().split('T')[0];
      this.logForm.setValue({
        appliedDate: d.appliedDate || today,
        appliedPlace: d.appliedPlace || 'UBS Central',
        lotNumber: d.lotNumber || 'LT-' + Math.floor(Math.random() * 900000 + 100000) + 'X',
        vacinatorName: d.vacinatorName || 'Enf. Responsável'
      });
    }
  }

  submit() {
    if (this.logForm.invalid || !this.logData) { this.logForm.markAllAsTouched(); return; }
    const value = this.logForm.value;
    const childId = this.vaxService.activeChildId();
    if (childId) {
      this.vaxService.applyVaccineDose({
        childId,
        vaccineId: this.logData.vaccine.id,
        doseId: this.logData.dose.doseId,
        appliedDate: value.appliedDate as string,
        appliedPlace: value.appliedPlace || undefined,
        lotNumber: value.lotNumber || undefined,
        vacinatorName: value.vacinatorName || undefined
      });
    }
    this.dismiss.emit();
  }
}
