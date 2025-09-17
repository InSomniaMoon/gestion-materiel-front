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
import { StructuresService } from '@app/core/services/structures.service';
import { Structure } from '@app/core/types/structure.type';
import { AuthService } from '@services/auth.service';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { lastValueFrom, map } from 'rxjs';

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
      this.selectedStructureId = toSignal(
        this.formGroup().get('structure')!.valueChanges,
        { initialValue: this.formGroup().get('structure')!.value }
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
        structure: this.structures()[0] ?? null,
      });
    }
  }
}
