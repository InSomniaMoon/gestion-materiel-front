import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { CreateUpdateItemOptionComponent } from '@app/components/create-update-item-option/create-update-item-option.component';
import { SimpleModalComponent } from '@app/components/simple-modal/simple-modal.component';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOptionService } from '@app/core/services/item-option.service';
import { Item } from '@app/core/types/item.type';
import { ItemOption } from '@app/core/types/itemOption.type';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DeclareOptionIssueComponent } from './declareOptionIssue/declareOptionIssue.component';

@Component({
  selector: 'app-options-table',
  imports: [CommonModule, TagModule, TableModule, ButtonModule, CardModule],
  template: `<div class="title">
      <h2>Options</h2>
      @if (userAdmin()) {
        <p-button
          outlined
          label="Ajouter"
          icon="pi pi-plus"
          iconPos="right"
          (onClick)="openAddOptionDialog()" />
      }
    </div>
    <section class="options">
      @for (option of options(); track $index) {
        <p-card [header]="option.name" [subheader]="option.description">
          <p-tag
            [icon]="option.usable ? 'pi pi-check' : 'pi pi-times'"
            [severity]="option.usable ? 'success' : 'danger'" />
          <p-button
            label="Avarie"
            [outlined]="true"
            icon="pi pi-plus"
            (onClick)="createAvarie(option)" />
          <ng-template pTemplate="footer">
            @if (userAdmin()) {
              <p-button
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                (onClick)="openEditOptionDialog(option)"></p-button>
              <p-button
                type="button"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                (onClick)="deleteOption(option)"></p-button>
            }
          </ng-template>
        </p-card>
      }
    </section> `,
  styleUrl: './options-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsTableComponent {
  private readonly dialogService = inject(DialogService);
  private readonly itemOptionService = inject(ItemOptionService);
  private readonly message = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

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
      .onClose.subscribe(confirm => {
        if (!confirm) {
          return;
        }

        this.itemOptionService
          .deleteItemOption(this.item()!.id, option.id!)
          .subscribe({
            next: () => {
              this.optionsChange.emit();
              this.message.add({
                severity: 'success',
                summary: 'Option supprimée',
                detail: `L'option ${option.name} a bien été supprimée`,
              });
            },
            error: () =>
              this.handleError(
                "Une erreur est survenue dans la suppression de l'option"
              ),
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
        next: () => {
          this.optionsChange.emit();
          this.message.add({
            severity: 'success',
            summary: 'Option Créée',
            detail: `L'option ${option.name} a bien été créée`,
          });
        },
        error: error =>
          this.handleError(
            "Une erreur est survenue dans la création de l'option"
          ),
      });
    });
  }
  openEditOptionDialog(option: ItemOption): void {
    this.dialogService
      .open(CreateUpdateItemOptionComponent, {
        header: 'Modifier ' + option.name,
        width: 'auto',
        data: option,
        appendTo: 'body',
      })
      .onClose.subscribe((opt: ItemOption) => {
        if (!opt) {
          return;
        }

        option = { ...option, ...opt };
        this.itemOptionService
          .updateItemOption(this.item()!.id, option)
          .subscribe({
            next: _ => {
              this.optionsChange.emit();
              this.message.add({
                severity: 'success',
                summary: 'Option Modifiée',
                detail: `L'option ${option.name} a bien été modifiée`,
              });
            },
            error: error =>
              this.handleError(
                "Une erreur est survenue dans la modification de l'option"
              ),
          });
      });
  }

  createAvarie(option: ItemOption) {
    this.dialogService
      .open(DeclareOptionIssueComponent, {
        header: 'Déclarer une avarie sur ' + option.name,
        data: {
          itemId: this.itemId(),
          optionId: option.id,
        },
        dismissableMask: true,
      })
      .onClose.subscribe(success => {
        if (!success) {
          return;
        }
        this.optionsChange.emit();
      });
  }

  private handleError(error: string) {
    this.message.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error,
    });
  }
}
