import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionService } from '@app/core/services/subscription.service';
import { MessageService, ResponsiveOverlayOptions } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { fromEvent, map, startWith } from 'rxjs';

@Component({
  selector: 'app-add-subscription',
  imports: [
    DialogModule,
    ButtonModule,
    DatePicker,
    ReactiveFormsModule,
    InputTextModule,
  ],
  templateUrl: './add-subscription.component.html',
  styleUrl: './add-subscription.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSubscriptionComponent implements OnInit {
  fb = inject(FormBuilder);
  private readonly ref = inject(DynamicDialogRef);
  private readonly dialogRef = inject(DialogService);
  private readonly toast = inject(MessageService);

  private readonly subscriptionService = inject(SubscriptionService);
  private data = this.dialogRef.getInstance(this.ref).data;

  // check if screen is a mobile device from event
  isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth <= 768),
      startWith(window.innerWidth <= 768),
    ),
  );
  minDate = signal(new Date());
  subscriptionChange = output<void>();

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
    },
    {
      validators: [
        (form) => {
          if (form.get('start_date')?.value > form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          if (form.get('start_date')?.value === form.get('end_date')?.value) {
            return { invalidDate: true };
          }
          return null;
        },
      ],
    },
  );

  responsiveOptions: ResponsiveOverlayOptions[] = [
    {
      breakpoint: '768px',
    },
  ];

  constructor() {
    this.form.valueChanges.subscribe((value) => {
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
    });
  }

  close() {
    this.ref.close();
  }

  date(str: string): Date {
    return new Date(str);
  }

  submit() {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.value;
    this.subscriptionService
      .addSubscription(this.data.item, {
        name: value.name!,
        start_date: new Date(value.start_date!),
        end_date: new Date(value.end_date!),
        item_id: this.data.item.id,
        status: 'active',
        id: 0,
        user_id: 0,
      })
      .subscribe({
        next: () => {
          this.ref.close(true);
        },
        error: (error) => {
          console.warn(error.error);
          this.toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error.message ?? 'Une erreur est survenue',
          });
        },
      });
  }

  resetEndDate() {
    this.form.patchValue({
      end_date: this.form.get('start_date')?.value,
    });
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
