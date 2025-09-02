import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupWithPivot } from '@core/types/group.type';
import { environment } from '@env/environment';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TablePageEvent } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { BackofficeService } from '../services/backoffice.service';
import { CreateUpdateGroupComponent } from './backoffice-create-update-group/backoffice-create-update-group.component';

@Component({
  selector: 'app-backoffice-groups-list',
  imports: [
    TableModule,
    FormsModule,
    IconFieldModule,
    InputTextModule,
    InputIcon,
    Button,
  ],
  template: `
    <p-table
      [value]="groups()"
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
            (onClick)="openCreateGroupDialog()" />
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th></th>
          <th>Nom</th>
          <th></th>
        </tr>
      </ng-template>
      <ng-template #body let-group>
        <tr>
          <td class="image">
            @if (group.image) {
              <img [src]="baseUrl + group.image" width="32px" height="32px" />
            }
          </td>
          <td>{{ group.name }}</td>
          <td style="background-color: aliceblue;">
            <p-button
              icon="pi pi-pencil"
              severity="secondary"
              (onClick)="openUpdateGroupDialog(group)" />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,

  styleUrl: './backoffice-groups-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminGroupsListComponent {
  private readonly backofficeService = inject(BackofficeService);
  private readonly dialogService = inject(DialogService);

  baseUrl = environment.api_url + '/storage/';

  page = signal(1);
  size = signal(25);
  orderBy = signal('name');
  sortBy = signal('asc');
  sortOrder = computed(() => (this.sortBy() === 'asc' ? 1 : -1));
  q = signal('');

  groupsQuery = injectQuery(() => ({
    queryKey: [
      'groups',
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
        this.backofficeService.getGroups({
          orderBy: this.orderBy(),
          page: this.page(),
          q: this.q(),
          size: this.size(),
          sortBy: this.sortBy(),
        })
      ),
  }));

  groups = computed(() => this.groupsQuery.data()?.data || []);

  openCreateGroupDialog() {
    this.dialogService
      .open(
        CreateUpdateGroupComponent,
        buildDialogOptions({
          header: 'Créer un groupe',
          width: '70%',
        })
      )
      .onClose.subscribe(created => {
        if (created) {
          this.groupsQuery.refetch();
        }
      });
  }

  openUpdateGroupDialog(group: GroupWithPivot) {
    this.dialogService
      .open(
        CreateUpdateGroupComponent,
        buildDialogOptions({
          header: `Modifier le groupe ${group.name}`,
          width: '70%',
          data: { group },
        })
      )
      .onClose.subscribe(updated => {
        if (updated) {
          this.groupsQuery.refetch();
        }
      });
  }

  pageChange(event: TablePageEvent) {
    console.log(event);
    this.size.set(event.rows);

    this.page.set(Math.floor(event.first / event.rows) + 1);
  }
}
