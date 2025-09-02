import { DatePipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { ActualEvent } from '@core/types/event.type';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, Card, RouterLink, ButtonDirective, JsonPipe],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailsComponent {
  private readonly authService = inject(AuthService);
  event = input.required<ActualEvent>();

  isAdmin = this.authService.isAdmin;
}
