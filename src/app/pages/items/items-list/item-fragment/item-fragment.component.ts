import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '@app/core/services/events.service';
import { AddSubscriptionComponent } from '@components/add-subscription/add-subscription.component';
import { Item } from '@core/types/item.type';
import { Subscription } from '@core/types/subscription.type';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core/index.js';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import locale from '@fullcalendar/core/locales/fr';

@Component({
  selector: 'app-item-fragment',
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    DialogModule,
    ButtonModule,
    ButtonGroupModule,
    TagModule,
    FullCalendarModule,
  ],
  templateUrl: './item-fragment.component.html',
  styleUrl: './item-fragment.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFragmentComponent implements OnInit, AfterViewInit {
  private readonly subscriptionService = inject(EventsService);
  private readonly destroyRef = inject(DestroyRef);
  item = input.required<Item>();
  subscription$ = inject(EventsService);

  toast = inject(MessageService);

  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);

  calendar = viewChild<FullCalendarComponent>('calendar');

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
    events: this.events(),
    eventClick: event => {
      this.eventClicked(event);
    },
    handleWindowResize: true,
  }));

  uses = signal<Subscription[]>([]);

  viewDate = signal(new Date());

  constructor() {}

  ngOnInit(): void {
    this.fetchSubscriptions();
  }
  ngAfterViewInit(): void {
    // this.calendar().getApi().updateSize();
  }

  openAddSubscriptionDialog() {
    let d = this.dialog
      .open(AddSubscriptionComponent, {
        header: `Take ${this.item().name}`,
        width: '70%',
        height: '90%',
        modal: true,
        data: { item: this.item() },
        // reponsive dialog
        breakpoints: {
          '960px': '80vw',
          '640px': '90vw',
        },
      })
      .onClose.subscribe(value => {
        if (!value) return;
        this.fetchSubscriptions();
        this.toast.add({
          key: 'success',
          severity: 'success',
          summary: 'Emprunt ajouté',
        });
      });
  }

  events = computed(() => {
    if (!this.uses()) {
      return undefined;
    }
    return this.uses().map(use => ({
      title: use.name,
      start: use.start_date,
      end: use.end_date,
      id: `${use.id}`,
    }));
  });

  fetchSubscriptions() {
    // this.subscription$
    //   .getItemSubscriptions(this.item())
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(subscriptions => {
    //     this.uses.set(subscriptions);
    //   });
  }

  displaySubscriptionDialog = signal(false);

  dayClicked(event: any) {
    console.log(event);
    this.calendar()?.getApi().changeView('timeGridDay', event.dateStr);
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
