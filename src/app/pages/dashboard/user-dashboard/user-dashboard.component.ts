import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-user-dashboard',
  imports: [FullCalendarModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {}
