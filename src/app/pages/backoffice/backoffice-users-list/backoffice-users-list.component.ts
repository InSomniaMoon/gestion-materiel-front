import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TablePageEvent } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { BackofficeService } from '../services/backoffice.service';
import { CreateUserModalComponent } from './create-user-modal/create-user-modal.component';

import { User } from '@core/types/user.type';
import { TippyDirective } from '@ngneat/helipopper';
import { buildDialogOptions } from '@utils/constants';
import { MessageService } from 'primeng/api';
import { AppAdminUserEditGroupsComponent } from './backoffice-user-edit-groups/backoffice-user-edit-groups.component';

@Component({
  selector: 'app-backoffice-users-list',
  imports: [
    TableModule,
    FormsModule,
    IconFieldModule,
    InputTextModule,
    InputIcon,
    Button,
    TippyDirective,
  ],

  template: `
    <p-table
      [value]="users()"
      [paginator]="true"
      [rows]="size()"
      [rowsPerPageOptions]="[10, 25, 50]"
      [sortField]="orderBy()"
      [sortOrder]="sortOrder()"
      (onPage)="pageChange($event)">
      <ng-template #caption>
        <div class="caption">
          <p-iconfield iconPosition="left">
            <p-inputicon>
              <i class="pi pi-search"></i>
            </p-inputicon>
            <input
              pInputText
              type="text"
              (ngModelChange)="q.set($event)"
              ngModel
              placeholder="Rechercher un utilisateur" />
          </p-iconfield>

          <p-button
            label="Ajouter"
            icon="pi pi-plus"
            (onClick)="openAddUserDialog()" />
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th>Nom</th>
          <th>Mail</th>
          <th>Role</th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-user>
        <tr>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td class="actions">
            <p-button
              icon="pi pi-users"
              text
              rounded
              aria-label="Editer les groupes de l'utilisateur"
              tp="Editer les groupes de l'utilisateur"
              (onClick)="openEditGroupsDialog(user)" />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styleUrl: './backoffice-users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminUsersListComponent {
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  page = signal(0);
  size = signal(25);
  orderBy = signal('name');
  sortBy = signal('asc');
  sortOrder = computed(() => (this.sortBy() === 'asc' ? 1 : -1));
  q = signal('');

  usersQuery = injectQuery(() => ({
    queryKey: [
      'users',
      {
        page: this.page(),
        q: this.q(),
        size: this.size(),
        orderBy: this.orderBy(),
        sortBy: this.sortBy(),
      },
    ],
    queryFn: () =>
      lastValueFrom(
        this.backofficeService.getUsers({
          orderBy: this.orderBy(),
          page: this.page() + 1,
          q: this.q(),
          size: this.size(),
          sortBy: this.sortBy(),
        })
      ),
  }));

  users = computed(() => this.usersQuery.data()?.data || []);

  pageChange(event: TablePageEvent) {
    console.log(event);
    this.size.set(event.rows);

    this.page.set(Math.floor(event.first / event.rows) + 1);
  }

  openAddUserDialog() {
    this.dialogService
      .open(
        CreateUserModalComponent,
        buildDialogOptions({
          header: 'Ajouter un utilisateur',
          width: '50%',
          height: '80%',
        })
      )
      .onClose.subscribe(value => {
        if (!value) return;
        this.usersQuery.refetch();
      });
  }

  openEditGroupsDialog(user: User) {
    this.dialogService
      .open(
        AppAdminUserEditGroupsComponent,
        buildDialogOptions({
          header: `Editer les groupes de ${user.firstname} ${user.lastname}`,
          width: '50%',
          height: '80%',
          data: { userId: user.id },
        })
      )
      .onClose.subscribe(value => {
        if (!value) return;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: "Groupes de l'utilisateur mis à jour avec succès",
        });
        this.usersQuery.refetch();
      });
  }
}
