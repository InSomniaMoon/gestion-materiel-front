import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
} from '@angular/core';
import { StructuresService } from '@app/core/services/structures.service';
import { ChildrenStructuresListComponent } from './children-structures-list/children-structures-list.component';

import { form } from '@angular/forms/signals';
import { AuthService } from '@app/core/services/auth.service';
import { Button } from 'primeng/button';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import {
  StructureDetailsComponent,
  StructureDetailsModel,
} from './children-structures-list/create-structure/structure-details/structure-details.component';
@Component({
  selector: 'app-my-structure',
  imports: [ChildrenStructuresListComponent, StructureDetailsComponent, Button],
  template: `<h1>{{ structure()?.nomStructure }}</h1>
    <h2>{{ structure()?.name }}</h2>
    <div class="flex wrap">
      <app-structure-details [field]="structureForm" />
      <p-button
        label="Sauvegarder"
        (onClick)="saveStructure()"
        [disabled]="!structureForm().touched" />
    </div>

    <app-children-structures-list
      [structures]="children()"
      (structuresChanged)="structureResource.reload()" /> `,
  styleUrl: './my-structure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyStructureComponent {
  private readonly structuresService = inject(StructuresService);
  private readonly authService = inject(AuthService);

  structureResource = resource({
    loader: ({ params }) =>
      lastValueFrom(this.structuresService.getAdminStructures()),
    params: () => ({ structureId: this.authService.selectedStructure() }),
  });

  structure = linkedSignal(() => this.structureResource.value()?.structure);
  children = computed(() => this.structureResource.value()?.children ?? []);

  structureModel = linkedSignal<StructureDetailsModel>(() => {
    const structure = this.structure();
    if (!structure) {
      return { image: '', name: '' };
    }

    console.log(structure);

    return { image: structure.image ?? '', name: structure.name ?? '' };
  });
  structureForm = form<StructureDetailsModel>(this.structureModel);

  saveStructure() {
    this.structuresService
      .updateStructure(this.structure()?.id!, {
        name: this.structureForm().value().name,
        image: this.structureForm().value().image,
      })
      .subscribe({
        next: () => {
          this.structureResource.reload();
          this.structureForm().reset();
        },
      });
  }
}
