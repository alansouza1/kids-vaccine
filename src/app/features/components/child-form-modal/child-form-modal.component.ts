import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonIcon, IonModal } from '@ionic/angular/standalone';
import { VaccineService } from '../../../core/services/vaccine.service';
import { Child } from '../../../core/models/child.model';

@Component({
  selector: 'app-child-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonIcon, IonModal],
  templateUrl: './child-form-modal.component.html'
})
export class ChildFormModalComponent implements OnChanges {
  private readonly vaxService = inject(VaccineService);

  @Input() isOpen = false;
  @Input() editingChild: Child | null = null;
  @Output() dismiss = new EventEmitter<void>();

  readonly avatarOptions = ['👶🏼', '👶🏾', '👶🏻', '👧🏻', '👧🏼', '👧🏽', '👦🏽', '👦🏻', '👦🏾', '🦁', '🐻', '🦖', '🦄', '🐳'];

  childForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl<'M' | 'F'>('M', [Validators.required]),
    avatar: new FormControl('👶🏼', [Validators.required]),
    bloodType: new FormControl(''),
    weight: new FormControl<number | null>(null, [Validators.min(0.1)]),
    height: new FormControl<number | null>(null, [Validators.min(10)])
  });

  ngOnChanges() {
    if (this.editingChild) {
      const c = this.editingChild;
      this.childForm.setValue({
        id: c.id, name: c.name, birthDate: c.birthDate,
        gender: c.gender, avatar: c.avatar,
        bloodType: c.bloodType || '', weight: c.weight || null, height: c.height || null
      });
    } else {
      this.childForm.reset({ id: '', name: '', birthDate: '', gender: 'M', avatar: '👶🏼', bloodType: '', weight: null, height: null });
    }
  }

  submit() {
    if (this.childForm.invalid) { this.childForm.markAllAsTouched(); return; }
    const value = this.childForm.value;
    const isEditing = !!value.id;
    const child = new Child({
      id: isEditing ? (value.id as string) : `child_${Date.now()}`,
      name: value.name as string,
      birthDate: value.birthDate as string,
      gender: value.gender as 'M' | 'F',
      avatar: value.avatar as string,
      bloodType: value.bloodType || undefined,
      weight: value.weight ? Number(value.weight) : undefined,
      height: value.height ? Number(value.height) : undefined
    });
    if (isEditing) { this.vaxService.updateChild(child); }
    else { this.vaxService.addChild(child); }
    this.dismiss.emit();
  }
}
