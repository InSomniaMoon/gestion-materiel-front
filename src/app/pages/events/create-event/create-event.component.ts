import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Unit } from '@core/types/unit.type';
import { EventsService } from '@services/events.service';
import { StepperModule } from 'primeng/stepper';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';

@Component({
  selector: 'app-create-event',
  imports: [
    StepperModule,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  form = this.fb.nonNullable.group({
    informations: this.fb.nonNullable.group(
      {
        name: ['', [Validators.required]],
        unit: this.fb.nonNullable.control<Unit | null>(null, [
          Validators.required,
        ]),
        start_date: [null],
        end_date: [null],
      },
      {
        validators: [
          form => {
            if (form.get('start_date')?.value > form.get('end_date')?.value) {
              return { invalidDate: true };
            }
            if (
              form?.get('start_date')?.value === form?.get('end_date')?.value
            ) {
              return { invalidDate: true };
            }
            return null;
          },
        ],
      }
    ),
    materials: this.fb.nonNullable.control([], {
      validators: [
        Validators.required,
        form => (form.value.length === 0 ? { empty: true } : null),
      ],
    }),
    comment: [''],
  });

  get informationsFormGroup() {
    return this.form.get('informations') as FormGroup;
  }

  get materialsFormControl() {
    return this.form.get('materials') as FormControl;
  }
  get commentFormControl() {
    return this.form.get('comment') as FormControl;
  }

  private readonly eventService = inject(EventsService);

  submitForm() {
    const value = this.form.getRawValue();

    const data = {
      name: value.informations.name,
      unit_id: value.informations.unit!.id,
      start_date: new Date(value.informations.start_date!),
      end_date: new Date(value.informations.end_date!),
      materials: value.materials.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      comment: value.comment,
    };

    this.eventService.createEvent(data).subscribe({
      next: () => {
        console.log('Event created successfully');
        this.router.navigate(['/dashboard']); // Navigate to the events list or another page
        // Optionally, you can reset the form or navigate to another page
      },
      error: err => {
        console.error('Error creating event:', err);
      },
    });
  }
}
