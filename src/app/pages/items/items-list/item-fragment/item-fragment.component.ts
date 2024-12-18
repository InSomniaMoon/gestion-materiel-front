import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddSubscriptionComponent } from '@components/add-subscription/add-subscription.component';
import { SubscriptionService } from '@core/services/subscription.service';
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
export class ItemFragmentComponent implements OnInit, AfterViewInit {
  item = input.required<Item>();
  subscription$ = inject(SubscriptionService);
  private readonly subscriptionService = inject(SubscriptionService);

  toast = inject(MessageService);

  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);

  calendar = viewChild.required<FullCalendarComponent>('calendar');

  calendarOptions = computed<CalendarOptions>(() => ({
    locale: 'fr',
    initialView: 'dayGridMonth',
    eventMinWidth: 100,
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
    handleWindowResize: true,
  }));

  uses = signal<Subscription[]>([]);

  viewDate = signal(new Date());

  constructor() {}

  ngOnInit(): void {
    this.fetchSubscriptions();
  }
  ngAfterViewInit(): void {
    this.calendar().getApi().updateSize();
  }

  openAddSubscriptionDialog() {
    this.dialog
      .open(AddSubscriptionComponent, {
        header: `Emprunter ${this.item().name}`,
      })
      .onClose.subscribe((value) => {
        if (!value) {
          return;
        }
        this.subscriptionService
          .addSubscription(this.item(), {
            name: value.name!,
            start_date: new Date(value.start_date!),
            end_date: new Date(value.end_date!),
            item_id: this.item().id,
            status: 'active',
            id: 0,
            user_id: 0,
          })
          .subscribe({
            next: () => {
              this.fetchSubscriptions();
              this.toast.add({
                key: 'success',
                severity: 'success',
                summary: 'Emprunt ajouté',
              });
            },
            error: (error) => {
              console.error(error);
              this.toast.add({
                key: 'error',
                severity: 'error',
                summary: 'Erreur',
                detail: 'Une erreur est survenue',
              });
            },
          });
      });
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
    }));
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
    console.log(event);
    this.calendar().getApi().changeView('timeGridDay', event.dateStr);
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
