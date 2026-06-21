import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (status === 'applied') {
      <span class="text-[9px] font-black bg-emerald-600 text-white uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
        <ion-icon class="text-[10px] leading-none" name="checkmark-circle"></ion-icon>
        {{ label || 'Completo' }}
      </span>
    } @else if (status === 'overdue') {
      <span class="text-[9px] font-black bg-rose-500 text-white uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
        <ion-icon class="text-[10px] leading-none animate-bounce" name="alert-circle"></ion-icon>
        {{ label || 'Atrasada' }}
      </span>
    } @else {
      <span class="text-[9px] font-black bg-brand-orange text-brand-dark uppercase px-1.5 py-0.5 rounded-full">
        {{ label || 'Pendente' }}
      </span>
    }
  `
})
export class StatusBadgeComponent {
  @Input() status!: 'applied' | 'pending' | 'overdue';
  @Input() label?: string;
}
