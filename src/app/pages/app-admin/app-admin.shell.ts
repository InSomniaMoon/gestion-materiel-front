import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackofficeService } from './services/backoffice.service';

@Component({
  selector: 'app-app-admin-shell',
  imports: [RouterOutlet],
  providers: [BackofficeService],
  template: ` <h1 class="header">Back office admin</h1>
    <router-outlet />`,

  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app-admin.shell.scss'],
})
export class AppAdminShellComponent {}
