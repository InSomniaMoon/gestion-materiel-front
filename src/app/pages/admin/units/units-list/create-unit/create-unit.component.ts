import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { ColorPicker } from 'primeng/colorpicker';
import { MultiSelect } from 'primeng/multiselect';
import { from, lastValueFrom, map, of } from 'rxjs';
import { UsersService } from '@app/core/services/users.service';
import { debounceTimeSignal } from '@app/core/utils/signals.utils';
import { Select } from 'primeng/select';
import { JsonPipe } from '@angular/common';
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

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    color: ['#000000', [Validators.required]],
    chiefs: this.fb.nonNullable.control<{ value: string; code: string }[]>([]),
    responsible: this.fb.nonNullable.control<{ value: string; code: string }>({
      value: '',
      code: '',
    }),
  });

  get chiefsControl() {
    return this.form.get('chiefs')?.value ?? [];
  }

  ngOnInit(): void {
    const data = this.dialog$.getInstance(this.ref).data;
    console.log(data);

    if (data) {
      this.form.patchValue({
        name: data.name || '',
        color: data.color || '#000000',
        chiefs: data.chiefs || [],
        responsible: data.responsible
          ? { value: data.responsible.name, code: data.responsible.id }
          : { value: '', code: '' },
      });
    }
  }

  closeConfirm() {
    const value = this.form.getRawValue();
    const chiefs = value.chiefs.map((chief) => chief.code);
    const resp = value.responsible.code;
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
    request: () => ({ q: this.debouncedChiefsFilter() }),
    loader: ({ request }) =>
      lastValueFrom(
        this.usersService
          .getPaginatedUsers({ ...request, page: 1, size: 100 })
          .pipe(
            map((data) =>
              data.data.map((user) => ({
                name: user.name,
                code: user.id,
              }))
            )
          )
      ), // Replace with actual service call to fetch chiefs
    defaultValue: [],
  });
}
