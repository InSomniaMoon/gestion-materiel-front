import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-step2',
  imports: [Button, ReactiveFormsModule],
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step2Component {
  nextStep = output();
  previousStep = output();

  formGroup = input.required<FormControl>();
}
