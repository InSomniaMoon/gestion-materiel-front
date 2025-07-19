import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { ResponsiveOverlayOptions } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-step1',
  imports: [
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Select,
    DatePicker,
  ],
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step1Component implements OnInit {
  private readonly authService = inject(AuthService);
  readonly units = this.authService.userUnits;
  private readonly destroyRef = inject(DestroyRef);

  nextStep = output();

  formGroup = input.required<FormGroup>();

  minDate = signal(new Date());
  responsiveOptions: ResponsiveOverlayOptions[] = [
    {
      breakpoint: '768px',
    },
  ];

  ngOnInit() {
    this.formGroup()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.minDate.set(this.date(value.start_date!));
      });
    if (this.formGroup().touched) {
      return;
    }
    let curDate = new Date();
    curDate.setMinutes(0, 0, 0);
    // format :2024-11-13 16:01

    this.formGroup().patchValue({
      start_date: this.formatDate(curDate),
      end_date: this.formatDate(curDate),
      unit: this.units()[0] ?? null,
    });
  }

  resetEndDate() {
    this.formGroup().patchValue({
      end_date: this.formGroup().get('start_date')?.value,
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
