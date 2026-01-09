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
import { AuthService } from '@app/core/services/auth.service';
import { TableLayoutService } from '@app/core/services/table-layout.service';
import { SortBy } from '@app/core/types/pagination-request.type';
import { environment } from '@env/environment';
import { TippyDirective } from '@ngneat/helipopper';
import { UsersService } from '@services/users.service';
import { buildDialogOptions } from '@utils/constants';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DataView } from 'primeng/dataview';
import { DialogService } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { UserRolePipe } from '../user-role.pipe';
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
    TippyDirective,
    Card,
    DataView,
    SelectButton,
    UserRolePipe,
    Select,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly usersService = inject(UsersService);
  private readonly dialogService = inject(DialogService);
  private readonly selectedStructure = inject(AuthService).selectedStructure;
  private readonly tableLayoutService = inject(TableLayoutService);
  constructor() {
    effect(() => {
      this.orderBy();
      this.sortBy();
      this.page.set(0);
    });
  }
  pageSizeOptions = [
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
  ];
  baseUrl = environment.api_url + '/storage/';

  page = signal(0);
  size = signal(100);
  searchQuery = signal('');
  orderBy = signal<'lastname' | 'firstname' | 'email' | 'role'>('lastname');
  sortBy = signal<1 | -1>(1);
  first = computed(() => this.page() * this.size());

  dataViewType = [
    { label: 'Liste', value: 'list' },
    { label: 'Tableau', value: 'grid' },
  ];
  layout = this.tableLayoutService.layout;
  setLayout(layout: 'list' | 'grid') {
    this.tableLayoutService.setLayout(layout);
  }
  sortOptions = [
    { label: 'Nom', value: 'lastname' },
    { label: 'Prénom', value: 'firstname' },
    { label: 'Email', value: 'email' },
    { label: 'Rôle', value: 'role' },
  ];

  usersResource = resource({
    loader: ({ params }) =>
      lastValueFrom(
        this.usersService.getPaginatedUsers({
          size: params.size,
          q: params.q,
          order_by: params.order_by,
          sort_by: params.sort_by,
          page: params.page + 1,
        })
      ),
    params: () => ({
      page: this.page(),
      size: this.size(),
      q: this.searchQuery(),
      order_by: this.orderBy(),
      sort_by: this.sortBy() === 1 ? 'asc' : ('desc' as SortBy),
      selected_structure: this.selectedStructure(),
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
      )!
      .onClose.subscribe(result => {
        if (!result) {
          return;
        }
        this.usersResource.reload();
      });
  }

  switchSortOrder() {
    this.sortBy.set(this.sortBy() === 1 ? -1 : 1);
  }
}
