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
      @for (group of groupedItems(); track group.category) {
        <h3>{{ group.category }}</h3>
        <ul>
          @for (item of group.items; track item.item) {
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

  groupedItems = computed(() => {
    const grouped: { [key: string]: ItemSelection[] } = {};
    this.items().forEach(item => {
      const categoryName = item.item.category?.name || 'Sans catégorie';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push({ item: item.item, quantity: item.quantity });
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
