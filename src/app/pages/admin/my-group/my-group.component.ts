import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { StructuresService } from '@app/core/services/structures.service';
import { StructuresListComponent } from './units-list/structures-list.component';

@Component({
  selector: 'app-my-group',
  imports: [StructuresListComponent],
  templateUrl: './my-group.component.html',
  styleUrl: './my-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyGroupComponent {
  private readonly structuresService = inject(StructuresService);
  structure = rxResource({
    stream: () => this.structuresService.getStructures(),
  });
}
