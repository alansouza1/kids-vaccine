import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { VaccineService } from '../../../core/services/vaccine.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  protected readonly vaxService = inject(VaccineService);

  @Input() activeTab = 'dashboard';
  @Output() tabChange = new EventEmitter<'dashboard' | 'timeline' | 'campaigns' | 'children'>();
  @Output() addChild = new EventEmitter<void>();
  @Output() resetData = new EventEmitter<void>();
}
