import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-step4',
  imports: [Button],
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step4Component {
  nextStep = output();
  previousStep = output();

  formValue = input.required<any>();
}
