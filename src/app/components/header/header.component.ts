import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { DialogService } from 'primeng/dynamicdialog';
import { MenubarModule } from 'primeng/menubar';
import { Select } from 'primeng/select';
import { TieredMenuModule } from 'primeng/tieredmenu';

export type MenuItemWithImage = MenuItem & {
  img?: string;
  items?: MenuItemWithImage[];
  color?: string;
};
@Component({
  selector: 'app-header',
  imports: [
    AvatarModule,
    TieredMenuModule,
    MenubarModule,
    RouterLink,
    Badge,
    Select,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly auth$ = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  readonly user = this.auth$.user;
  readonly structures = this.auth$.structures;
  readonly selectedStructure = this.auth$.selectedStructure;
  private readonly router = inject(Router);

  protected readonly imgBaseUrl = environment.api_url + '/storage/';

  lettres = computed(() =>
    this.user()
      ? `${this.user()?.firstname[0].toUpperCase()}${this.user()?.lastname[0].toUpperCase()}`
      : ''
  );

  setSelectStructureById(id: number) {
    this.auth$.setSelectStructureById(id);
  }
  selectedStructureId = computed(() => this.auth$.selectedStructure()?.id);
  authItems = computed<MenuItemWithImage[]>(() => [
    {
      label: this.selectedStructure()?.name ?? 'Groupe Actif',
      img: this.selectedStructure()?.image,
      icon: 'pi pi-users',
      command: undefined,
    },
    {
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      routerLink: '/auth/login',
      command: () =>
        this.auth$.logout() && this.router.navigateByUrl('/auth/login'),
    },
  ]);

  menuItems = computed<MenuItem[]>(() => [
    {
      label: 'Accueil',
      routerLink: '/dashboard',
      icon: 'pi pi-home',
    },
    { label: 'Matériel', routerLink: '/items', icon: 'pi pi-box' },
    {
      label: 'Administration',
      icon: 'pi pi-cog',
      visible: this.auth$.isAdmin(),
      items: [
        { label: 'Objets', icon: 'pi pi-box', routerLink: '/admin/items' },
        {
          label: 'Catégories',
          icon: 'pi pi-tags',
          routerLink: '/admin/categories',
        },
        {
          label: 'Ma Structure',
          icon: 'pi pi-building',
          routerLink: '/admin/my-structure',
        },
        {
          label: 'Utilisateurs',
          icon: 'pi pi-users',
          routerLink: '/admin/users',
        },
      ],
    },
    {
      label: 'App Admininistration',
      icon: 'pi pi-cog',
      routerLink: '/backoffice',
      visible: this.auth$.isAppAdmin(),
      // style: {
      //   display: this.auth$.isAppAdmin() ? 'block' : 'none',
      // },
    },
    { separator: true },
  ]);
  ngOnInit(): void {}
}
