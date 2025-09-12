import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@core/types/user.type';
import { UsersService } from '@services/users.service';
import { debounceTimeSignal } from '@utils/signals.utils';
import { Button } from 'primeng/button';
import { ColorPicker } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { lastValueFrom, map } from 'rxjs';
@Component({
  selector: 'app-create-unit',
  imports: [
    InputText,
    DialogModule,
    ColorPicker,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    MultiSelect,
    Select,
  ],
  templateUrl: './create-unit.component.html',
  styleUrl: './create-unit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUnitComponent implements OnInit {
  private ref = inject(DynamicDialogRef);
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  private dialog$ = inject(DialogService);

  validateLabel = signal('Créer');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    color: ['#000000', [Validators.required]],
    chiefs: this.fb.nonNullable.control<{ name: string; code: number }[]>([]),
    responsible: this.fb.control<{ name: string; code: number } | null>(null),
  });

  get chiefsControl() {
    return this.form.get('chiefs')?.value ?? [];
  }

  ngOnInit(): void {
    const data = this.dialog$.getInstance(this.ref).data;

    // syncro input et colorpicker
    this.form.get('color')!.valueChanges.subscribe({
      next: value => {
        this.form.get('color')!.setValue(value, {
          onlySelf: true,
          emitEvent: false,
          emitModelToViewChange: true,
        });
      },
      error: error => {},
    });

    if (data) {
      this.validateLabel.set('Modifier');
      this.form.patchValue({
        name: data.name || '',
        color: data.color || '#000000',
        chiefs:
          (data.chiefs as User[]).map(c => ({
            code: c.id,
            name: c.name,
          })) || [],
        responsible: data.responsible
          ? { name: data.responsible.name, code: data.responsible.id }
          : null,
      });
    }

    this.form.get('chiefs')?.valueChanges.subscribe(value => {
      if (value.length == 0) {
        this.form.get('responsible')!.setValue(null);
      }
    });
  }

  closeConfirm() {
    const value = this.form.getRawValue();
    const chiefs = value.chiefs.map(chief => chief.code);
    const resp = value.responsible?.code;
    this.ref.close({
      ...value,
      chiefs: chiefs,
      responsible: resp ? resp : undefined,
    });
  }

  closeCancel() {
    this.ref.close(false);
  }

  chiefsFilter = signal('');
  debouncedChiefsFilter = debounceTimeSignal(this.chiefsFilter);

  chiefs = resource({
    params: () => ({ q: this.debouncedChiefsFilter() }),
    loader: ({ params }) =>
      lastValueFrom(
        this.usersService
          .getPaginatedUsers({ ...params, page: 1, size: 100 })
          .pipe(
            map(data =>
              data.data.map(user => ({
                name: user.name,
                code: user.id,
              }))
            )
          )
      ),
    defaultValue: [],
  });
}
