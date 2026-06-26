import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  resource,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  required,
  schema,
} from '@angular/forms/signals';
import { AuthService } from '@app/core/services/auth.service';
import { StructureWithRole } from '@app/core/types/structure.type';
import { User } from '@core/types/user.type';
import { UsersService } from '@services/users.service';
import { debounceTimeSignal } from '@utils/signals.utils';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { lastValueFrom, map } from 'rxjs';
import {
  StructureDetailsComponent,
  StructureDetailsModel,
} from './structure-details/structure-details.component';

interface ChiefOption {
  name: string;
  code: number;
}

export interface CreateStructureModel {
  details: StructureDetailsModel;
  color: string;
  chiefs: ChiefOption[];
  responsible: ChiefOption | null;
}

const createStructureSchema = schema<CreateStructureModel>(path => {
  required(path.details.name);
  required(path.color);
});

@Component({
  selector: 'app-create-structure',
  imports: [
    InputText,
    DialogModule,
    Button,
    FloatLabel,
    MultiSelect,
    StructureDetailsComponent,
    FormField,
    FormRoot,
  ],
  templateUrl: './create-structure.component.html',
  styleUrl: './create-structure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateStructureComponent implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly usersService = inject(UsersService);

  private readonly selectedStructureId =
    inject(AuthService).selectedStructure()?.id;

  validateLabel = signal('Créer');

  structure = input<StructureWithRole>();

  private readonly model = signal<CreateStructureModel>({
    details: { name: '', description: '', image: '' },
    color: '#000000',
    chiefs: [],
    responsible: null,
  });

  myForm = form(this.model, createStructureSchema);

  chiefsControl = computed(() => this.myForm.chiefs().value());

  private readonly clearResponsibleWhenNoChiefs = effect(() => {
    if (this.myForm.chiefs().value().length === 0) {
      this.myForm.responsible().value.set(null);
    }
  });

  ngOnInit(): void {
    const structure = this.structure();
    if (structure) {
      this.validateLabel.set('Modifier');
      this.model.set({
        details: {
          name: structure.name || '',
          description: structure.description || '',
          image: structure.image || '',
        },
        color: structure.color || '#000000',
        chiefs:
          (structure.members as User[]).map(c => ({
            code: c.id,
            name: `${c.firstName} ${c.lastName}`,
          })) || [],
        responsible: null,
      });
    }
  }

  closeConfirm() {
    let value = this.myForm().value();

    this.ref.close({
      ...value,
      chiefs: value.chiefs.map(chief => chief.code),
      responsible: value.responsible?.code || undefined,
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
          .getPaginatedUsersFromStructure(this.selectedStructureId!, {
            ...params,
            page: 1,
            size: 100,
          })
          .pipe(
            map(data =>
              data.data.map(user => ({
                name: `${user.firstName} ${user.lastName}`,
                code: user.id,
              }))
            )
          )
      ),
    defaultValue: [],
  });
}
