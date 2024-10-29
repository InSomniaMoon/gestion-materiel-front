import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddSubscriptionComponent } from '@components/add-subscription/add-subscription.component';
import { CalendarEventAdapter } from '@core/adapters/calendar-event.adapter';
import { SubscriptionService } from '@core/services/subscription.service';
import { Item } from '@core/types/item.type';
import { Subscription } from '@core/types/subscription.type';
import {
  CalendarCommonModule,
  CalendarDayModule,
  CalendarEvent,
  CalendarMonthModule,
  CalendarMonthViewDay,
  CalendarView,
  CalendarWeekModule,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-item-fragment',
  standalone: true,
  imports: [
    RouterLink,
    CardModule,
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule,
    CalendarCommonModule,
    ButtonModule,
    DialogModule,
    AddSubscriptionComponent,
    ButtonModule,
    ButtonGroupModule,
    TagModule,
  ],
  templateUrl: './item-fragment.component.html',
  styleUrl: './item-fragment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFragmentComponent implements OnInit {
  refresh = new Subject<void>();
  item = input.required<Item>();
  subscription$ = inject(SubscriptionService);
  private readonly router = inject(Router);

  CAL_VIEW = CalendarView;

  uses = signal<Subscription[]>([]);

  viewDate = signal(new Date());

  viewType = signal<CalendarView>(CalendarView.Month);

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  constructor() {
    effect(() => {
      this.refresh.next();
    });
  }

  ngOnInit(): void {
    this.fetchSubscriptions();
  }

  events = computed(() => {
    if (!this.uses()) {
      return [];
    }

    return this.uses().map((subscription) =>
      CalendarEventAdapter.adapt(subscription)
    );
  });

  fetchSubscriptions() {
    this.subscription$
      .getItemSubscriptions(this.item())
      .subscribe((subscriptions) => {
        this.uses.set(subscriptions);
      });
  }

  displaySubscriptionDialog = signal(false);

  dayClicked({
    day,
    sourceEvent,
  }: {
    day: CalendarMonthViewDay;
    sourceEvent: MouseEvent | KeyboardEvent;
  }) {
    this.viewDate.set(day.date);
    this.viewType.set(CalendarView.Day);
  }

  eventClicked(event: {
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }) {
    
    this.router.navigate([
      '/items',
      this.item().id,
      'subscriptions',
      event.event.id,
    ]);
  }
}
