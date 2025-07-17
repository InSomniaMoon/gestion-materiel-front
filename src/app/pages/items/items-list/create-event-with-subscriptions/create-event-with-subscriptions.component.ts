import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { Unit } from '@app/core/types/unit.type';
import { MessageService, ResponsiveOverlayOptions } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-create-event-with-subscriptions',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    FloatLabel,
    DatePicker,
    Button,
    InputText,
    Select,
  ],
  templateUrl: './create-event-with-subscriptions.component.html',
  styleUrl: './create-event-with-subscriptions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventWithSubscriptionsComponent implements OnInit {
  private readonly dialogRef = inject(DialogService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject(DynamicDialogRef);
  private readonly toast = inject(MessageService);

  readonly units = this.authService.userUnits;

  minDate = signal(new Date());
  responsiveOptions: ResponsiveOverlayOptions[] = [
    {
      breakpoint: '768px',
    },
  ];

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.minDate.set(this.date(value.start_date!));
      });
  }

  ngOnInit(): void {
    let curDate = new Date();
    curDate.setMinutes(0, 0, 0);
    // format :2024-11-13 16:01

    this.form.patchValue({
      start_date: this.formatDate(curDate),
      end_date: this.formatDate(curDate),
      unit: this.units()[0] ?? null,
    });
  }
  form = this.fb.group(
    {
      name: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      start_date: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      end_date: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      unit: this.fb.control<Unit | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [
        form => {
          if (form.get('start_date')?.value > form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          if (form.get('start_date')?.value === form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          return null;
        },
      ],
    }
  );

  close() {
    this.ref.close();
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;
  }

  resetEndDate() {
    this.form.patchValue({
      end_date: this.form.get('start_date')?.value,
    });
  }

  private date(str: string): Date {
    return new Date(str);
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
