import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Child } from '../../../core/models/child.model';

@Component({
  selector: 'app-child-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './child-card.component.html'
})
export class ChildCardComponent {
  @Input() child!: Child;
  @Input() isActive = false;
  @Input() compact = false;
  @Input() showActions = false;
  @Output() select = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Child>();
  @Output() delete = new EventEmitter<string>();
}
