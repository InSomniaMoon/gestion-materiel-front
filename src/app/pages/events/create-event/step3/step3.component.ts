import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-step3',
  imports: [Button, FloatLabel, Textarea, ReactiveFormsModule],
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step3Component {
  nextStep = output();
  previousStep = output();

  formGroup = input.required<FormControl>();
}
