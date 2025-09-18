import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DeclareOptionIssueComponent } from '@app/pages/items/item-details/options-table/declareOptionIssue/declareOptionIssue.component';
import { Item } from '@core/types/item.type';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core/index.js';
import locale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { AuthService } from '@services/auth.service';
import { EventsService } from '@services/events.service';
import { buildDialogOptions } from '@utils/constants';
import { Button, ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { catchError, lastValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    ButtonDirective,
    RouterLink,
    FullCalendarModule,
    ProgressSpinner,
    DatePipe,
    Card,
    Button,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent {
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  calendar = viewChild<FullCalendarComponent>('calendar');

  actualEvents = resource({
    loader: () => lastValueFrom(this.eventsService.getActualEvents()),
    defaultValue: [],
  });

  events = resource<EventInput[], any>({
    params: () => ({ structureId: this.authService.selectedStructure() }),
    loader: ({ params }) =>
      lastValueFrom(
        this.eventsService.getEventsForStructure(params.structureId!.id).pipe(
          map(events =>
            events.map(
              event =>
                ({
                  start: event.start_date,
                  end: event.end_date,
                  title: event.name,
                  allDay: false,
                  color: event.structure?.color,
                  id: `${event.id}`,
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
    eventClick: event => {
      this.router.navigate(['/events', event.event.id]);
    },
    handleWindowResize: true,
  }));

  dayClicked(event: any) {
    console.log(event);
    this.calendar()?.getApi().changeView('timeGridDay', event.dateStr);
    // TODO: Implement this
  }

  reportDamage(material: Item) {
    this.dialogService.open(
      DeclareOptionIssueComponent,
      buildDialogOptions({
        header: 'Signaler un dommage',
        width: '50%',
        inputValues: {
          item: material,
        },
      })
    );
  }
}
