import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-step1',
  imports: [Button, ReactiveFormsModule, FloatLabel, InputText],
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step1Component {
  nextStep = output();

  formGroup = input.required<FormGroup>();
}
