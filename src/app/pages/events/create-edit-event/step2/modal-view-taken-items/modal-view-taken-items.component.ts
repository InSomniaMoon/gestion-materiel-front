import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ItemSelection } from '../../create-edit-event.component';

@Component({
  selector: 'app-modal-view-taken-items',
  imports: [DialogModule, Button],
  template: ` <div class="content">
      @for (structure of structuredItems(); track structure.category) {
        <h3>{{ structure.category }}</h3>
        <ul>
          @for (item of structure.items; track item.item) {
            <li>
              <span
                >{{ item.item.name }}
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
  private ref = inject(DynamicDialogRef);

  items = input.required<ItemSelection[]>();

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
}
