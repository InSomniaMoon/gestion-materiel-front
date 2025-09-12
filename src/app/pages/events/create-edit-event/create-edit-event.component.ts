import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ActualEvent } from '@app/core/types/event.type';
import { Item } from '@app/core/types/item.type';
import { Unit } from '@core/types/unit.type';
import { EventsService } from '@services/events.service';
import { StepperModule } from 'primeng/stepper';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';

@Component({
  selector: 'app-create-update-event',
  imports: [
    StepperModule,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
  ],
  templateUrl: './create-edit-event.component.html',
  styleUrl: './create-edit-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditEventComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  event = input<ActualEvent | null>(null);
  form = this.fb.nonNullable.group({
    informations: this.fb.nonNullable.group(
      {
        name: ['', [Validators.required]],
        unit: this.fb.nonNullable.control<Unit | null>(null, [
          Validators.required,
        ]),
        start_date: this.fb.nonNullable.control<Date | null>(null, [
          Validators.required,
        ]),
        end_date: this.fb.nonNullable.control<Date | null>(null, [
          Validators.required,
        ]),
      },
      {
        validators: [
          form => {
            if (form.get('start_date')?.value >= form.get('end_date')?.value) {
              return { invalidDate: true };
            }
            return null;
          },
        ],
      }
    ),
    materials: this.fb.nonNullable.control<Item[]>([], {
      validators: [
        // Validators.required,
        // form => (form.value.length === 0 ? { empty: true } : null),
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

  ngOnInit(): void {
    if (!this.event()) return;

    this.form.setValue({
      informations: {
        name: this.event()!.name,
        unit: this.event()!.unit,
        start_date: new Date(this.event()!.start_date),
        end_date: new Date(this.event()!.end_date),
      },
      materials: this.event()!.event_subscriptions,
      comment: this.event()!.comment ?? '',
    });
  }

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

    if (this.event()) {
      this.eventService.updateEvent(this.event()!.id, data).subscribe({
        next: () => {
          this.router.navigate(['/events', this.event()!.id]);
        },
      });
    } else {
      this.eventService.createEvent(data).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error('Error creating event:', err);
        },
      });
    }
  }
}
