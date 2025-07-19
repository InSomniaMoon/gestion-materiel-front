import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-step3',
  imports: [Button],
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step3Component {
  nextStep = output();
  previousStep = output();

  formGroup = input.required<FormControl>();
}
