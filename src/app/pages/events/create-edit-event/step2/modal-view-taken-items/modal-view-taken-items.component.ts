import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  output,
} from '@angular/core';
import { ItemBadgeComponent } from '@app/item-badge/item-badge.component';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ItemSelection } from '../../create-edit-event.component';

@Component({
  selector: 'app-modal-view-taken-items',
  imports: [DialogModule, Button, ItemBadgeComponent],
  template: ` <div class="content">
      @for (structure of structuredItems(); track structure.category) {
        <h3>{{ structure.category }}</h3>
        <ul>
          @for (item of structure.items; track item.item) {
            <li>
              <p-button
                outlined
                severity="danger"
                size="small"
                icon="pi pi-trash"
                (onClick)="removeItem(item)" />
              <app-item-badge [state]="item.item.state!" />
              <span>
                {{ item.item.name }}
                @if (!item.item.category?.identified) {
                  (x{{ item.quantity }})
                }
              </span>
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
  private readonly ref = inject(DynamicDialogRef);

  items = model.required<ItemSelection[]>();
  itemChange = output<ItemSelection>();

  structuredItems = computed(() => {
    const structured: { [key: string]: ItemSelection[] } = {};
    this.items().forEach(item => {
      const categoryName = item.item.category?.name || 'Sans catégorie';
      if (!structured[categoryName]) {
        structured[categoryName] = [];
      }
      structured[categoryName].push({
        item: item.item,
        quantity: item.quantity,
      });
    });
    return Object.entries(structured).map(([category, items]) => ({
      category,
      items,
    }));
  });

  protected close() {
    this.ref.close();
  }

  protected removeItem(item: ItemSelection) {
    this.itemChange.emit(item);
    this.items.set(this.items().filter(i => i.item.id !== item.item.id));
  }
}
