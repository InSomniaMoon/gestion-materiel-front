import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-create-event',
  imports: [StepperModule, Button],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventComponent {}
