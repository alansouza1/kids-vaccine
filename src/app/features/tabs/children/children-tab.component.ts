import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { VaccineService } from '../../../core/services/vaccine.service';
import { Child } from '../../../core/models/child.model';
import { ChildCardComponent } from '../../../shared/components/child-card/child-card.component';

@Component({
  selector: 'app-children-tab',
  standalone: true,
  imports: [CommonModule, IonIcon, ChildCardComponent],
  templateUrl: './children-tab.component.html'
})
export class ChildrenTabComponent {
  protected readonly vaxService = inject(VaccineService);

  @Output() addChild = new EventEmitter<void>();
  @Output() editChild = new EventEmitter<Child>();
  @Output() deleteChild = new EventEmitter<string>();
  @Output() selectChild = new EventEmitter<string>();
}
