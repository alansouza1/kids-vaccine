import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { VaccineService } from '../../../core/services/vaccine.service';

@Component({
  selector: 'app-campaigns-tab',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './campaigns-tab.component.html'
})
export class CampaignsTabComponent {
  protected readonly vaxService = inject(VaccineService);

  formatRawDate(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
