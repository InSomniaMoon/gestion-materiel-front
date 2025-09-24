import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ItemIssuesService } from '@app/core/services/item-issues.service';
import { Item } from '@core/types/item.type';
import { AuthService } from '@services/auth.service';
import { ItemsService } from '@services/items.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { lastValueFrom } from 'rxjs';
import { OpenedIssuesComponent } from './opened-issues/opened-issues.component';

@Component({
  selector: 'app-item-details',
  imports: [
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToggleButtonModule,
    FormsModule,
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
  private readonly itemIssuesService = inject(ItemIssuesService);
  private readonly message = inject(MessageService);

  item = signal<Item | null>(null);

  userAdmin = this.auth$.isAdmin;
  itemId = input.required<number>();

  ngOnInit(): void {
    // get itemid from route
    this.itemService
      .getItem(this.itemId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: item => {
          this.item.set(item);
          this.titleService.setTitle(item.name);
        },
        error: error => {
          console.error(error);
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

    this.itemService.updateItem(item).subscribe({
      next: item => {
        this.item.set(item);
        this.message.add({
          severity: 'success',
          summary: 'Objet mis à jour',
          detail: `${item.name} a été mis à jour avec succès`,
        });
      },
    });
  }

  issuesQuery = injectQuery(() => ({
    queryKey: ['issues', this.itemId()],
    enabled: this.itemId() !== undefined && this.userAdmin(),
    queryFn: () =>
      lastValueFrom(this.itemIssuesService.getItemIssues(this.itemId()!)),
  }));
}
