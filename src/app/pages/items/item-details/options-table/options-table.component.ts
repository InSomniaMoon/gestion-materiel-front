import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CreateUpdateItemOptionComponent } from '@app/components/create-update-item-option/create-update-item-option.component';
import { SimpleModalComponent } from '@app/components/simple-modal/simple-modal.component';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOptionService } from '@app/core/services/item-option.service';
import { Item } from '@app/core/types/item.type';
import { ItemOption } from '@app/core/types/itemOption.type';
import { options } from '@fullcalendar/core/preact.js';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-options-table',
  standalone: true,
  imports: [CommonModule, TagModule, TableModule, ButtonModule, CardModule],
  template: `<div class="title">
      <h2>Options</h2>
      @if (userAdmin()) {
        <p-button
          outlined
          label="Ajouter"
          icon="pi pi-plus"
          iconPos="right"
          (onClick)="openAddOptionDialog()"
        />
      }
    </div>
    <section class="options">
      @for (option of options(); track $index) {
        <p-card [header]="option.name" [subheader]="option.description">
          <p-tag
            [icon]="option.usable ? 'pi pi-check' : 'pi pi-times'"
            [severity]="option.usable ? 'success' : 'danger'"
          />
          <ng-template pTemplate="footer">
            @if (userAdmin()) {
              <p-button
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                (onClick)="openEditOptionDialog(option)"
              ></p-button>
              <p-button
                type="button"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                (onClick)="deleteOption(option)"
              ></p-button>
            }
          </ng-template>
        </p-card>
      }
    </section>
    <!-- <p-table [value]="options()" [tableStyle]="{ width: '100%' }">
      <ng-template pTemplate="header">
        <tr>
          <th>Nom</th>
          <th>Description</th>
          <th>Utilisable</th>
          @if (userAdmin()) {
            <th></th>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-product>
        <tr>
          <td>{{ product.name }}</td>
          <td>{{ product.description }}</td>

          <td>
            <p-tag
              [icon]="product.usable ? 'pi pi-check' : 'pi pi-times'"
              [severity]="product.usable ? 'success' : 'danger'"
            />
          </td>
          @if (userAdmin()) {
            <td style="display: flex; gap: 0.5rem">
              <p-button
                type="button"
                icon="pi pi-pencil"
                rounded
                severity="secondary"
                size="small"
                (onClick)="openEditOptionDialog(product)"
              ></p-button>
              <p-button
                type="button"
                icon="pi pi-trash"
                rounded
                size="small"
                severity="danger"
                (onClick)="deleteOption(product)"
              ></p-button>
            </td>
          }
        </tr>
      </ng-template>
    </p-table>
    --> `,
  styleUrl: './options-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsTableComponent {
  private readonly dialogService = inject(DialogService);
  private readonly itemOptionService = inject(ItemOptionService);
  userAdmin = inject(AuthService).isAdmin;

  item = input<Item | null>(null);
  itemId = input.required<number>();
  options = input<ItemOption[]>([]);
  optionsChange = output<void>();

  deleteOption(option: ItemOption) {
    this.dialogService
      .open(SimpleModalComponent, {
        header: `Supprimer l'option ${option.name}`,
        width: 'auto',
        height: 'auto',
        data: {
          message: `Voulez-vous vraiment supprimer l'option ${option.name} ?`,
          confirm: true,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      })
      .onClose.subscribe((confirm) => {
        if (!confirm) {
          return;
        }

        this.itemOptionService
          .deleteItemOption(this.item()!.id, option.id)
          .subscribe({
            next: () => {
              this.optionsChange.emit();
            },
          });
      });
  }

  openAddOptionDialog(): void {
    const dialog = this.dialogService.open(CreateUpdateItemOptionComponent, {
      header: 'Ajouter une option',
      width: 'auto',
    });
    dialog.onClose.subscribe((option: ItemOption) => {
      if (!option) {
        return;
      }

      this.itemOptionService.addItemOption(this.item()!.id, option).subscribe({
        next: (item) => {},
      });
    });
  }
  openEditOptionDialog(option: ItemOption): void {
    this.dialogService
      .open(CreateUpdateItemOptionComponent, {
        header: 'Modifier ' + option.name,
        width: 'auto',
        data: option,
      })
      .onClose.subscribe((opt: ItemOption) => {
        if (!option) {
          return;
        }

        option = { ...option, ...opt };
        this.itemOptionService
          .updateItemOption(this.item()!.id, option)
          .subscribe({
            next: (_) => {
              this.optionsChange.emit();
            },
          });
      });
  }
}
