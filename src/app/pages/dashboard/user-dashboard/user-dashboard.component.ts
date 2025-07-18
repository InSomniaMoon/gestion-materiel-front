import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { EventsService } from '@app/core/services/events.service';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core/index.js';
import locale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { catchError, lastValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [FullCalendarModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  calendar = viewChild<FullCalendarComponent>('calendar');

  events = resource<EventInput[], any>({
    loader: () =>
      lastValueFrom(
        this.eventsService
          .getEventsForUnit(this.authService.selectedUnit()!.id)
          .pipe(
            map(events =>
              events.map(
                event =>
                  ({
                    start: event.start_date,
                    end: event.end_date,
                    title: event.name,
                    allDay: false,
                    color: this.authService.selectedUnit()?.color,
                  }) as EventInput
              )
            ),
            catchError(() => {
              console.error('Error loading events');
              return [];
            })
          )
      ),
    defaultValue: [],
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    locale,
    initialView: 'dayGridMonth',
    eventMinWidth: 100,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    plugins: [dayGridPlugin, timeGridPlugin],
    events: this.events.value(),
    eventClick: event => {},
    handleWindowResize: true,
  }));

  dayClicked(event: any) {
    console.log(event);
    this.calendar()?.getApi().changeView('timeGridDay', event.dateStr);
    // TODO: Implement this
  }
}
