import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  linkedSignal,
  OnInit,
  output,
  resource,
  runInInjectionContext,
  signal,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StructuresService } from '@app/core/services/structures.service';
import { Structure } from '@app/core/types/structure.type';
import { AuthService } from '@services/auth.service';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { lastValueFrom, map } from 'rxjs';

const PREDEFINED_DDURATIONS = [
  { label: '8h', value: '08:00' },
  { label: '8h30', value: '08:30' },
  { label: '9h', value: '09:00' },
  { label: '9h30', value: '09:30' },
  { label: '10h', value: '10:00' },
  { label: '10h30', value: '10:30' },
  { label: '11h', value: '11:00' },
  { label: '11h30', value: '11:30' },
  { label: '12h', value: '12:00' },
  { label: '12h30', value: '12:30' },
  { label: '13h', value: '13:00' },
  { label: '13h30', value: '13:30' },
  { label: '14h', value: '14:00' },
  { label: '14h30', value: '14:30' },
  { label: '15h', value: '15:00' },
  { label: '15h30', value: '15:30' },
  { label: '16h', value: '16:00' },
  { label: '16h30', value: '16:30' },
  { label: '17h', value: '17:00' },
  { label: '17h30', value: '17:30' },
  { label: '18h', value: '18:00' },
  { label: '18h30', value: '18:30' },
];

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
  private readonly structuresService = inject(StructuresService);
  readonly predefinedDurations = PREDEFINED_DDURATIONS;

  private readonly structureChildren = resource({
    loader: () =>
      lastValueFrom(
        this.structuresService
          .getStructures()
          .pipe(map(structures => structures.children as Structure[]))
      ),
    defaultValue: [],
  });

  // TODO replace by structures
  structures = computed<Structure[]>(() =>
    this.authService.isAdmin()
      ? this.structureChildren.value()
      : ([this.authService.selectedStructure() ?? null].filter(
          s => s !== null
        ) as Structure[])
  );

  nextStep = output();
  protected readonly dateFormat = 'dd/mm/yy';
  formGroup = input.required<FormGroup>();
  selectedStructureId!: Signal<number | null>;
  selectedStructure = computed(() =>
    this.structures().find(
      structure => structure.id === this.selectedStructureId()
    )
  );

  private startDateAsSignal!: Signal<Date | null>;

  private endDateAsSignal!: Signal<Date | null>;

  doubleDates = linkedSignal(() => {
    return this.startDateAsSignal() && this.endDateAsSignal()
      ? [this.startDateAsSignal(), this.endDateAsSignal()]
      : [];
  });

  get startDateFormControl() {
    return this.formGroup().get('start_date')!;
  }

  get endDateFormControl() {
    return this.formGroup().get('end_date')!;
  }

  constructor() {
    effect(() => {
      const startDate = this.startDateAsSignal();
      const [hours, minutes] = this.startTime()
        .split(':')
        .map(string => Number.parseInt(string));
      startDate?.setHours(hours);
      startDate?.setMinutes(minutes);
      this.startDateFormControl.patchValue(startDate);
    });

    effect(() => {
      const endDate = this.endDateAsSignal();
      const [hours, minutes] = this.endTime()
        .split(':')
        .map(string => Number.parseInt(string));
      endDate?.setHours(hours);
      endDate?.setMinutes(minutes);
      this.endDateFormControl.patchValue(endDate);
    });
  }

  datesSelected(dates: Date[]) {
    const [start, end] = dates;

    this.formGroup().patchValue({
      start_date: start,
      end_date: end,
    });

    this.doubleDates.set(dates);
  }

  injectionContext = inject(Injector);

  ngOnInit() {
    runInInjectionContext(this.injectionContext, () => {
      this.selectedStructureId = toSignal(
        this.formGroup().get('structure')!.valueChanges,
        { initialValue: this.formGroup().get('structure')!.value }
      );

      this.startDateAsSignal = toSignal(
        this.formGroup().get('start_date')!.valueChanges,
        { initialValue: this.formGroup().get('start_date')!.value }
      );
      this.endDateAsSignal = toSignal(
        this.formGroup().get('end_date')!.valueChanges,
        { initialValue: this.formGroup().get('end_date')!.value }
      );
    });
    this.formGroup()
      .get('end_date')
      ?.valueChanges.subscribe((date: Date) => {
        if (date) {
          date = new Date(date);
          date.setSeconds(0);
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
        // move the end date if it's before the start date at the same distance as before
        const startDate = this.startDateAsSignal();
        const endDate = this.endDateAsSignal();
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (end < start) {
            const diff = start.getTime() - end.getTime();
            const newEnd = new Date(start.getTime() + diff);
            this.formGroup().patchValue({
              end_date: newEnd,
            });
          }
        }
      });

    if (this.formGroup().touched) {
      return;
    }
    let startHours = this.startDateAsSignal()?.getHours() ?? 9;
    let startMinutes = this.startDateAsSignal()?.getMinutes() ?? 0;
    let endHours = this.endDateAsSignal()?.getHours() ?? 18;
    let endMinutes = this.endDateAsSignal()?.getMinutes() ?? 0;
    this.startTime.set(
      `${startHours > 10 ? startHours : '0' + startHours}:${startMinutes > 10 ? startMinutes : '0' + startMinutes}`
    );
    this.endTime.set(
      `${endHours > 10 ? endHours : '0' + endHours}:${endMinutes > 10 ? endMinutes : '0' + endMinutes}`
    );
    if (!this.formGroup().get('start_date')?.value) {
      this.formGroup().patchValue({
        structure: this.structures()[0] ?? null,
      });
    }
  }

  startTime = signal('08:00');

  endTime = signal('18:00');
}
