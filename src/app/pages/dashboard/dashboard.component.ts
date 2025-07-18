import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [UserDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  isGroupResp = computed(
    () => this.authService.selectedGroup()?.pivot.role === 'admin'
  );
  isGroupChief = computed(
    () => this.authService.selectedGroup()?.pivot.role === 'user'
  );
}
