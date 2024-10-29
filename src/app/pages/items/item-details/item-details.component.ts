import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateUpdateItemOptionComponent } from '@app/components/create-update-item-option/create-update-item-option.component';
import { SimpleModalComponent } from '@app/components/simple-modal/simple-modal.component';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOptionService } from '@app/core/services/item-option.service';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';
import { ItemOption } from '@app/core/types/itemOption.type';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [
    JsonPipe,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ButtonModule,
    DynamicDialogModule,
    InputSwitchModule,
    ToggleButtonModule,
    FormsModule,
    RouterLink,
  ],
  providers: [DialogService],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsComponent implements OnInit {
  private readonly routeSnapshot = inject(ActivatedRoute).snapshot;
  private readonly itemService = inject(ItemsService);
  private readonly itemOptionService = inject(ItemOptionService);
  // title service to change the title of the page
  private readonly titleService = inject(Title);
  private readonly auth$ = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  item = signal<Item | null>(null);
  options = signal<ItemOption[]>([]);

  userAdmin = this.auth$.isAdmin;
  private itemId!: number;

  ngOnInit(): void {
    this.itemId = this.routeSnapshot.params['id'];

    this.getOptions();
    // get itemid from route
    this.itemService.getItem(this.itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.titleService.setTitle(item.name);
      },
    });
  }

  getOptions(): void {
    this.itemOptionService.getItemOptions(this.itemId).subscribe({
      next: (options) => {
        console.log(options);

        this.options.set(options);
      },
    });
  }

  openAddOptionDialog(): void {
    const dialog = this.dialogService.open(CreateUpdateItemOptionComponent, {
      header: 'Ajouter une option',
      width: '70%',
    });
    dialog.onClose.subscribe((option: ItemOption) => {
      if (!option) {
        return;
      }
      this.itemOptionService.addItemOption(this.item()!.id, option).subscribe({
        next: (item) => {
          this.options.update((options) => [...options, item]);
        },
      });
    });
  }

  openEditOptionDialog(option: ItemOption): void {
    const dialog = this.dialogService.open(CreateUpdateItemOptionComponent, {
      header: 'Modifier une option',
      width: '70%',
      data: option,
    });
    dialog.onClose.subscribe((option: ItemOption) => {
      this.getOptions();
    });
  }

  updateItem() {
    const item = JSON.parse(JSON.stringify(this.item()!));
    item.usable = !item.usable;

    this.itemService.updateItem(item).subscribe({
      next: (item) => {
        this.item.set(item);
      },
    });
  }

  deleteOption(option: ItemOption) {
    this.dialogService
      .open(SimpleModalComponent, {
        header: `Supprimer l'option ${option.name}`,
        width: '70%',
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
              this.getOptions();
            },
          });
      });
  }
}
