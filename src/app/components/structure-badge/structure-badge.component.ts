import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Structure } from '@app/core/types/structure.type';
import { environment } from '@env/environment';
import { Badge } from 'primeng/badge';

@Component({
  selector: 'app-structure-badge',
  imports: [Badge],
  templateUrl: './structure-badge.component.html',
  styleUrl: './structure-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureBadgeComponent {
  readonly structure = input.required<Structure>();

  readonly imgBaseUrl = environment.api_url;
}
