import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { StructuresService } from '@app/core/services/structures.service';
import { ChildrenStructuresListComponent } from './children-structures-list/children-structures-list.component';
import { StructureDetailsComponent } from './structure-details/structure-details.component';

@Component({
  selector: 'app-my-structure',
  imports: [ChildrenStructuresListComponent, StructureDetailsComponent],
  template: `<h1>{{ structure()?.nom_structure }}</h1>
    <h2>{{ structure()?.nom_structure }}</h2>
    @if (structure()) {
      <app-structure-details [structure]="structure()!" />
    }
    <app-units-list [units]="children()" /> `,
  styleUrl: './my-structure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyStructureComponent {
  private readonly structuresService = inject(StructuresService);

  structureResource = rxResource({
    stream: () => this.structuresService.getStructures(),
  });

  structure = linkedSignal(() => this.structureResource.value()?.structure);
  children = computed(() => this.structureResource.value()?.children ?? []);
}
