import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Item } from '@core/types/item.type';
import { environment } from '@env/environment';
import { Badge } from 'primeng/badge';
@Component({
  selector: 'app-list-item',
  imports: [Badge],
  template: `
    <div class="flex">
      <p-badge
        size="small"
        value=" "
        [severity]="
          item().state === 'OK'
            ? 'success'
            : item().state === 'NOK'
              ? 'warn'
              : item().state === 'KO'
                ? 'danger'
                : 'info'
        " />
      @if (item().image) {
        <img
          [src]="imageBaseUrl + item().image"
          alt="{{ item().name }}"
          class="item-image" />
      }
      <div class="item-details">
        <span class="item-category">
          {{ item().category?.name }}
        </span>
        <span class="item-name">
          {{ item().name }}
        </span>
      </div>
    </div>
  `,
  styleUrl: './list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  readonly imageBaseUrl = `${environment.api_url}/storage`;
  item = input.required<Item>();
}
