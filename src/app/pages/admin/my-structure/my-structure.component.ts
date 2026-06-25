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

import { AuthService } from '@app/core/services/auth.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
@Component({
  selector: 'app-my-structure',
  imports: [ChildrenStructuresListComponent],
  template: `<h1>{{ structure()?.nomStructure }}</h1>
    <h2>{{ structure()?.name }}</h2>

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
}
