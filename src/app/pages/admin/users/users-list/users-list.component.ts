import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '@app/components/search-bar/search-bar.component';
import { PaginatorComponent } from '@app/components/ui/paginator/paginator.component';
import { AppTable } from '@app/components/ui/table/table.component';
import { environment } from '@env/environment';
import { UsersService } from '@services/users.service';
import { buildDialogOptions } from '@utils/constants';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';

@Component({
  selector: 'app-users-list',
  imports: [
    AppTable,
    TableModule,
    SearchBarComponent,
    Button,
    FormsModule,
    PaginatorComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly usersService = inject(UsersService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  constructor() {
    effect(() => {
      this.orderBy();
      this.sortBy();
      this.page.set(1);
    });
  }
  options = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
  ];
  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(25);
  searchQuery = signal('');
  orderBy = signal('name');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());

  usersResource = resource({
    loader: ({ params }) =>
      lastValueFrom(this.usersService.getPaginatedUsers(params)),
    params: () => ({
      page: this.page() + 1,
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : 'desc',
    }),
  });

  users = computed(() => this.usersResource.value()?.data ?? []);

  openAddUser() {
    this.dialogService
      .open(
        AddUserModalComponent,
        buildDialogOptions({
          header: 'Ajouter un utilisateur',
          width: '50%',
        })
      )
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }
        this.usersResource.reload();
      });
  }
}
