import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { VaccineService } from '../../../core/services/vaccine.service';
import { VaccinePreset, DerivedDoseStatus } from '../../../core/models/vaccine.model';
import { ProgressCircleComponent } from '../../../shared/components/progress-circle/progress-circle.component';

@Component({
  selector: 'app-dashboard-tab',
  standalone: true,
  imports: [CommonModule, IonIcon, ProgressCircleComponent],
  templateUrl: './dashboard-tab.component.html'
})
export class DashboardTabComponent {
  protected readonly vaxService = inject(VaccineService);

  @Input() overdueDoses: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];
  @Input() upcomingDoses: { vaccine: VaccinePreset; dose: DerivedDoseStatus }[] = [];

  @Output() openLogDose = new EventEmitter<{ vaccine: VaccinePreset; dose: DerivedDoseStatus }>();
  @Output() goToTab = new EventEmitter<'timeline' | 'campaigns'>();
}
