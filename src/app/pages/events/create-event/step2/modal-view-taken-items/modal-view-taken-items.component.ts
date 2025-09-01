import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Item } from '@core/types/item.type';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-view-taken-items',
  imports: [DialogModule, Button],
  template: ` <div class="content">
      @for (group of groupedItems(); track group.category) {
        <h3>{{ group.category }}</h3>
        <ul>
          @for (item of group.items; track item.id) {
            <li>
              <span>{{ item.name }}</span>
            </li>
          }
        </ul>
      }
    </div>

    <p-footer>
      <p-button label="Fermer" (onClick)="close()" />
    </p-footer>`,
  styleUrl: './modal-view-taken-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalViewTakenItemsComponent {
  private ref = inject(DynamicDialogRef);

  items = input.required<Item[]>();

  groupedItems = computed(() => {
    const grouped: { [key: string]: Item[] } = {};
    this.items().forEach(item => {
      const categoryName = item.category?.name || 'Sans catégorie';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));
  });

  protected close() {
    this.ref.close();
  }
}
