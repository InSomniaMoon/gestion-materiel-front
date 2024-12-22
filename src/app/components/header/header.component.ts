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
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';

@Component({
  selector: 'app-header',
  imports: [AvatarModule, TieredMenuModule, MenubarModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly auth$ = inject(AuthService);
  readonly user = this.auth$.user!;
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

  menuItems: MenuItem[] = [
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
    },
  ];
  ngOnInit(): void {}
}
