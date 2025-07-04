import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOptionService } from '@app/core/services/item-option.service';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { lastValueFrom } from 'rxjs';
import { OpenedIssuesComponent } from './opened-issues/opened-issues.component';
import { OptionsTableComponent } from './options-table/options-table.component';

@Component({
  selector: 'app-item-details',
  imports: [
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputSwitchModule,
    ToggleButtonModule,
    FormsModule,
    RouterLink,
    OptionsTableComponent,
    OpenedIssuesComponent,
  ],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsComponent implements OnInit {
  private readonly routeSnapshot = inject(ActivatedRoute).snapshot;
  private readonly itemService = inject(ItemsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly titleService = inject(Title);
  private readonly auth$ = inject(AuthService);
  private readonly itemOptionService = inject(ItemOptionService);
  private readonly message = inject(MessageService);

  constructor() {}

  item = signal<Item | null>(null);

  userAdmin = this.auth$.isAdmin;
  itemId = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.itemId.set(this.routeSnapshot.params['itemId']);

    // get itemid from route
    this.itemService
      .getItem(this.itemId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (item) => {
          this.item.set(item);
          this.titleService.setTitle(item.name);
        },
        error: (error) => {
          this.message.add({
            severity: 'error',
            summary: 'Erreur',
            detail:
              "Une erreur est survenue lors de la récupération de l'objet",
          });
        },
      });
  }

  updateItem() {
    const item = JSON.parse(JSON.stringify(this.item()!));
    item.usable = !item.usable;

    this.itemService
      .updateItem(item)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (item) => {
          this.item.set(item);
          this.message.add({
            severity: 'success',
            summary: 'Objet mis à jour',
            detail: `${item.name} a été mis à jour avec succès`,
          });
        },
      });
  }

  optionsQuery = injectQuery(() => ({
    // enabled: this.userAdmin(),
    queryKey: ['options', this.itemId],
    enabled: this.itemId() !== undefined,
    queryFn: () =>
      lastValueFrom(
        this.itemOptionService.getItemOptions(this.itemId()!, {
          withIssues: this.userAdmin(),
        })
      ),
  }));
}
