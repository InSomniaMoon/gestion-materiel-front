import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Badge } from 'primeng/badge';

@Component({
  selector: 'app-item-badge',
  imports: [Badge],
  templateUrl: './item-badge.component.html',
  styleUrl: './item-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemBadgeComponent {
  readonly state = input.required<string>();

  color = computed<
    | 'info'
    | 'success'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
    | null
    | undefined
  >(() => {
    switch (this.state()) {
      case 'OK':
        return 'success';
      case 'NOK':
        return 'warn';
      case 'KO':
        return 'danger';
      default:
        return 'secondary';
    }
  });
}
