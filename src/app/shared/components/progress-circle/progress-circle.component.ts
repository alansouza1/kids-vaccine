import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  template: `
    <div class="relative flex items-center justify-center" [style.width.px]="size" [style.height.px]="size">
      <svg class="w-full h-full transform -rotate-90" [attr.viewBox]="'0 0 36 36'">
        <path class="text-brand-dark/5" stroke-width="4" stroke="currentColor" fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path class="text-brand-green transition-all duration-500 ease-out"
          [attr.stroke-dasharray]="progress + ', 100'"
          stroke-width="4" stroke-linecap="round" stroke="currentColor" fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
      <span class="absolute text-xs font-black text-brand-dark">{{ progress }}%</span>
    </div>
  `
})
export class ProgressCircleComponent {
  @Input() progress = 0;
  @Input() size = 56;
}
