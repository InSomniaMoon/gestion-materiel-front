import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DeclareIssueComponent } from '@app/pages/items/item-details/declareIssue/declareIssue.component';
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
import { catchError, lastValueFrom, map } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    ButtonDirective,
    RouterLink,
    FullCalendarModule,
    DatePipe,
    Card,
    Button,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  readonly calendar = viewChild.required<FullCalendarComponent>('calendar');

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  actualEvents = resource({
    loader: () => lastValueFrom(this.eventsService.getActualEvents()),
    defaultValue: [],
  });

  events = resource<EventInput[], any>({
    params: () => ({
      structureId: this.authService.selectedStructure(),
      startDate: this.startDate(),
      endDate: this.endDate(),
    }),
    loader: ({ params }) =>
      this.startDate() === null || this.endDate() === null
        ? Promise.resolve([])
        : lastValueFrom(
            this.eventsService
              .getEventsForStructure(
                params.structureId!.id,
                params.startDate,
                params.endDate
              )
              .pipe(
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
    datesSet: set => {
      this.startDate.set(set.start);
      this.endDate.set(set.end);
    },

    handleWindowResize: true,
  }));
  ngAfterViewInit(): void {
    console.log(this.calendar().getApi().getDate());
  }
  dayClicked(event: any) {
    console.log(event);
    this.calendar()?.getApi().changeView('timeGridDay', event.dateStr);
    // TODO: Implement this
  }

  reportDamage(item: Item) {
    this.dialogService.open(
      DeclareIssueComponent,
      buildDialogOptions({
        header: 'Signaler un dommage',
        width: '50%',
        inputValues: {
          itemId: item.id,
        },
      })
    );
  }
}
