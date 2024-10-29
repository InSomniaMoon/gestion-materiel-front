import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CalendarEventAdapter } from '@app/core/adapters/calendar-event.adapter';
import { SubscriptionService } from '@app/core/services/subscription.service';
import { Subscription } from '@app/core/types/subscription.type';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-subscription-details',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    ButtonModule,
    RouterLink,
    SkeletonModule,
    JsonPipe,
    CalendarModule,
  ],
  templateUrl: './subscription-details.component.html',
  styleUrl: './subscription-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionDetailsComponent implements OnInit {
  private readonly subscription$ = inject(SubscriptionService);
  private readonly activatedRoute = inject(ActivatedRoute);

  subscription = signal<Subscription | null>(null);

  readonly CAL_TYPE = CalendarView;
  calendarType = signal<CalendarView>(CalendarView.Day);
  viewDate = signal(new Date());
  refresh = new Subject<void>();

  events = computed(() => {
    if (!this.subscription()) {
      return [];
    }
    return [CalendarEventAdapter.adapt(this.subscription()!)];
  });

  firstDay = computed(() => {
    console.log(this.subscription());

    if (!this.subscription()) {
      return 1;
    }

    // return the nth day of week of start date
    return this.subscription()!.start_date.getDay();
  });
  constructor() {}

  ngOnInit(): void {
    // This method should fetch the item subscription
    this.subscription$
      .getItemSubscription(
        this.activatedRoute.snapshot.params['itemId'],
        this.activatedRoute.snapshot.params['subscriptionId']
      )
      .subscribe({
        next: (subscription) => {
          this.subscription.set(subscription);

          this.viewDate.set(subscription.start_date);

          if (this.checkEventOneDay(subscription)) {
            this.calendarType.set(CalendarView.Day);
            return;
          }

          if (this.checkEventOnWeek(subscription)) {
            this.calendarType.set(CalendarView.Week);
            return;
          }

          this.calendarType.set(CalendarView.Month);
        },
      });
  }

  checkEventOneDay(subscription: Subscription) {
    // check if end and start are on the same day
    const end = new Date(
      subscription.end_date.getFullYear(),
      subscription.end_date.getMonth(),
      subscription.end_date.getDate()
    );

    const start = new Date(
      subscription.start_date.getFullYear(),
      subscription.start_date.getMonth(),
      subscription.start_date.getDate()
    );

    return end.getTime() === start.getTime();
  }

  checkEventOnWeek(subscription: Subscription) {
    // check if end and start are on the same week
    const end = new Date(
      subscription.end_date.getFullYear(),
      subscription.end_date.getMonth(),
      subscription.end_date.getDate()
    );

    const start = new Date(
      subscription.start_date.getFullYear(),
      subscription.start_date.getMonth(),
      subscription.start_date.getDate()
    );

    const diff = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    return diffDays <= 7;
  }
}
