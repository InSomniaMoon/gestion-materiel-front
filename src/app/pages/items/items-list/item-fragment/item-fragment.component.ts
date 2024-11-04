import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddSubscriptionComponent } from '@components/add-subscription/add-subscription.component';
import { SubscriptionService } from '@core/services/subscription.service';
import { Item } from '@core/types/item.type';
import { Subscription } from '@core/types/subscription.type';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core/index.js';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { Subject } from 'rxjs';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-item-fragment',
  standalone: true,
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    DialogModule,
    AddSubscriptionComponent,
    ButtonModule,
    ButtonGroupModule,
    TagModule,
    FullCalendarModule,
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

  calendarOptions = computed<CalendarOptions>(() => ({
    locale: 'fr',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    plugins: [dayGridPlugin, timeGridPlugin],
    events: this.events(),
    eventClick: (event) => {
      this.eventClicked(event);
    },
  }));

  uses = signal<Subscription[]>([]);

  viewDate = signal(new Date());

  constructor() {}

  ngOnInit(): void {
    this.fetchSubscriptions();
  }

  events = computed(() => {
    if (!this.uses()) {
      return undefined;
    }
    return this.uses().map((use) => ({
      title: use.name,
      start: use.start_date,
      end: use.end_date,
      id: `${use.id}`,
    })); // TODO: Implement this
  });

  fetchSubscriptions() {
    this.subscription$
      .getItemSubscriptions(this.item())
      .subscribe((subscriptions) => {
        this.uses.set(subscriptions);
      });
  }

  displaySubscriptionDialog = signal(false);

  dayClicked(event: any) {
    // TODO: Implement this
  }

  eventClicked(event: any) {

    this.router.navigate([
      '/items',
      this.item().id,
      'subscriptions',
      event.event.id,
    ]);
  }
}
