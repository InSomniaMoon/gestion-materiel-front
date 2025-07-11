import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { DialogService } from 'primeng/dynamicdialog';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ChangeActiveGroupComponent } from './changeActiveGroup/changeActiveGroup.component';

@Component({
  selector: 'app-header',
  imports: [AvatarModule, TieredMenuModule, MenubarModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly auth$ = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  readonly user = this.auth$.user;
  readonly groups = this.auth$.groups;
  readonly selectedGroup = this.auth$.selectedGroup;
  private readonly router = inject(Router);

  lettres = computed(
    () =>
      this.user()
        ?.name.split(' ')
        .map((n) => n[0])
        .join('') ?? '',
  );

  authItems: MenuItem[] = [
    {
      label: 'Mon compte',
      routerLink: '/account',
      icon: 'pi pi-user',
    },
    {
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      routerLink: '/auth/login',
      command: () =>
        this.auth$.logout() && this.router.navigate(['/auth/login']),
    },
  ];

  menuItems = computed<MenuItem[]>(() => [
    {
      label: 'Accueil',
      routerLink: '/items',
      icon: 'pi pi-home',
    },
    {
      label: 'Mon compte',
      icon: 'pi pi-user',
      routerLink: '/account',
    },
    {
      label: 'Administration',
      icon: 'pi pi-cog',
      routerLink: '/admin',
      style: {
        display:
          this.selectedGroup()?.role == ('admin' as string) ? 'block' : 'none',
      },
    },
    {
      label: 'Changer de Groupe actif',
      icon: 'pi pi-users',
      style: { display: this.groups().length > 1 ? 'block' : 'none' },
      command: () => this.showChangeActiveGroup(),
    },
    {
      label: 'App Admininistration',
      icon: 'pi pi-cog',
      routerLink: '/app-admin',
      style: {
        display: this.auth$.isAppAdmin() ? 'block' : 'none',
      },
    },
  ]);
  ngOnInit(): void {}

  showChangeActiveGroup() {
    this.dialogService
      .open(ChangeActiveGroupComponent, {
        header: 'Changer de groupe actif',
        width: '70%',
        height: '70%',
        appendTo: 'body',
      })
      .onClose.subscribe((data) => {
        if (data) {
          this.auth$.setSelectGroupById(data.group_id);
        }
      });
  }
}
