import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { ButtonDirective } from 'primeng/button';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    UserDashboardComponent,
    AdminDashboardComponent,
    RouterLink,
    ButtonDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  isGroupResp = computed(
    () => this.authService.selectedStructure()?.pivot.role === 'admin'
  );
  isGroupChief = computed(
    () => this.authService.selectedStructure()?.pivot.role === 'user'
  );
}
