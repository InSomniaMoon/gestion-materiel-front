import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  OnInit,
  output,
  resource,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnitsService } from '@app/core/services/units.service';
import { AuthService } from '@services/auth.service';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-step1',
  imports: [
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Select,
    DatePicker,
    FormsModule,
  ],
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step1Component implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly unitsService = inject(UnitsService);

  private groupUnits = resource({
    loader: () => lastValueFrom(this.unitsService.getUnits()),
    defaultValue: [],
  });

  units = computed(() =>
    this.authService.isAdmin()
      ? this.groupUnits.value()
      : this.authService.userUnits()
  );

  nextStep = output();
  protected readonly dateFormat = 'dd/mm/yy';
  formGroup = input.required<FormGroup>();
  selectedUnitId!: Signal<number | null>;
  selectedUnit = computed(() =>
    this.units().find(unit => unit.id === this.selectedUnitId())
  );

  doubleDates = computed(() => {
    const start = this.formGroup().get('start_date')?.value;
    const end = this.formGroup().get('end_date')?.value;
    return start && end ? [start, end] : [];
  });

  datesSelected(dates: Date[]) {
    const [start, end] = dates;

    this.formGroup().patchValue({
      start_date: start,
      end_date: end,
    });
  }

  injectionContext = inject(Injector);

  ngOnInit() {
    runInInjectionContext(this.injectionContext, () => {
      this.selectedUnitId = toSignal(
        this.formGroup().get('unit')!.valueChanges,
        { initialValue: this.formGroup().get('unit')!.value }
      );
    });
    this.formGroup()
      .get('end_date')
      ?.valueChanges.subscribe((date: Date) => {
        if (date) {
          date = new Date(date);
          date.setHours(23);
          date.setMinutes(59);
          date.setSeconds(59);
          this.formGroup().patchValue(
            {
              end_date: date,
            },
            { emitEvent: false }
          );
        }
      });
    this.formGroup()
      .get('start_date')
      ?.valueChanges.subscribe(() => {
        this.formGroup().patchValue({
          end_date: null,
        });
      });

    if (this.formGroup().touched) {
      return;
    }
    if (!this.formGroup().get('start_date')?.value) {
      this.formGroup().patchValue({
        unit: this.units()[0] ?? null,
      });
    }
  }
}
