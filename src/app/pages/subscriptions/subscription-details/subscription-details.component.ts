import { JsonPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SubscriptionService } from '@app/core/services/subscription.service';
import { Subscription } from '@app/core/types/subscription.type';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-subscription-details',
    imports: [
        ProgressSpinnerModule,
        ButtonModule,
        RouterLink,
        SkeletonModule,
        JsonPipe,
        AccordionModule,
        FullCalendarModule,
    ],
    templateUrl: './subscription-details.component.html',
    styleUrl: './subscription-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionDetailsComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private readonly subscription$ = inject(SubscriptionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly issues$: any = inject(SubscriptionService);
  subscription = signal<Subscription | null>(null);

  viewDate = signal(new Date());

  firstDay = computed(() => {
    if (!this.subscription()) {
      return 1;
    }

    // return the nth day of week of start date
    return this.subscription()!.start_date.getDay();
  });

  initialView = signal('dayGridMonth');

  // calendar = viewChild<FullCalendarComponent>('calendar');
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  issuesQuery = injectQuery(() => ({
    queryKey: ['issues', this.subscription()],
    enabled: !!this.subscription(),
    queryFn: () => this.issues$().getIssues(this.subscription()!),
  }));

  issues = computed(() => {
    if (!this.issuesQuery.data()) {
      return [];
    }
    return this.issuesQuery.data()!.data;
  });

  events = computed<EventSourceInput | undefined>(() => {
    return [
      {
        title: this.subscription()?.name,
        start: this.subscription()?.start_date,
        end: this.subscription()?.end_date,
      },
    ];
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    locale: 'fr',
    initialView: this.initialView(),
    plugins: [dayGridPlugin, timeGridPlugin],
    firstDay: this.firstDay(),
    events: this.events(),
    initialDate: this.viewDate(),
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'timeGridWeek,dayGridDay', // user can switch between the two
    },
  }));
  constructor() {}

  ngAfterViewInit(): void {
    this.subscription$
      .getItemSubscription(
        this.activatedRoute.snapshot.params['itemId'],
        this.activatedRoute.snapshot.params['subscriptionId'],
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (subscription) => {
          this.subscription.set(subscription);

          this.viewDate.set(subscription.start_date);

          if (this.checkEventOneDay(subscription)) {
            // TODO: set the calendar view to day
            this.initialView.set('timeGridDay');
            return;
          }

          if (this.checkEventOnWeek(subscription)) {
            this.initialView.set('timeGridWeek');

            console.log('week');
            return;
          }

          this.initialView.set('dayGridMonth');

          console.log('month');
        },
        complete: () => {
          this.calendarComponent.getApi().changeView(this.initialView());
        },
      });
  }

  checkEventOneDay(subscription: Subscription) {
    // check if end and start are on the same day
    const end = new Date(
      subscription.end_date.getFullYear(),
      subscription.end_date.getMonth(),
      subscription.end_date.getDate(),
    );

    const start = new Date(
      subscription.start_date.getFullYear(),
      subscription.start_date.getMonth(),
      subscription.start_date.getDate(),
    );

    return end.getTime() === start.getTime();
  }

  checkEventOnWeek(subscription: Subscription) {
    // check if end and start are on the same week
    const end = new Date(
      subscription.end_date.getFullYear(),
      subscription.end_date.getMonth(),
      subscription.end_date.getDate(),
    );

    const start = new Date(
      subscription.start_date.getFullYear(),
      subscription.start_date.getMonth(),
      subscription.start_date.getDate(),
    );

    const diff = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    return diffDays <= 7;
  }
}
