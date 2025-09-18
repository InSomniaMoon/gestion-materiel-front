import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { DialogService } from 'primeng/dynamicdialog';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';

export type MenuItemWithImage = MenuItem & {
  img?: string;
  items?: MenuItemWithImage[];
  color?: string;
};
@Component({
  selector: 'app-header',
  imports: [AvatarModule, TieredMenuModule, MenubarModule, RouterLink, Badge],
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

  protected readonly apiUrl = environment.api_url + '/storage/';

  lettres = computed(() =>
    this.user()
      ? `${this.user()?.firstname[0].toUpperCase()}${this.user()?.lastname[0].toUpperCase()}`
      : ''
  );

  authItems = computed<MenuItemWithImage[]>(() => [
    {
      label: this.selectedStructure()?.name ?? 'Groupe Actif',
      img: this.selectedStructure()?.image,
      icon: 'pi pi-users',
      command: undefined,
      items:
        this.structures().length > 1
          ? this.structures().map(structure => ({
              label: structure.name,
              img: structure.image,
              icon: 'pi pi-users',
              command: () => this.auth$.setSelectStructureById(structure.id),
            }))
          : undefined,
    },
    // {
    //   label: 'Mon compte',
    //   routerLink: '/account',
    //   icon: 'pi pi-user',
    // },
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

    {
      label: 'Administration',
      icon: 'pi pi-cog',
      routerLink: '/admin',
      visible: this.auth$.isAdmin(),
      // style: {
      //   display:
      //     this.selectedGroup()?.pivot.role == ('admin' as string)
      //       ? 'block'
      //       : 'none',
      // },
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
  ]);
  ngOnInit(): void {}
}
