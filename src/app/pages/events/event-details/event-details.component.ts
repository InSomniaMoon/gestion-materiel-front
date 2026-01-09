import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { AuthService } from '@app/core/services/auth.service';
import { EventsService } from '@app/core/services/events.service';
import { buildDialogOptions } from '@app/core/utils/constants';
import { ActualEvent } from '@core/types/event.type';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, Card, RouterLink, ButtonDirective],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailsComponent {
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);

  readonly isAdmin = this.authService.isAdmin;
  readonly event = input.required<ActualEvent>();
  readonly canUpdate = computed(
    () =>
      this.authService.isAdmin() ||
      this.event().structure.code_structure ===
        this.authService.selectedStructure()?.code_structure
  );

  deleteEvent() {
    // Logic to delete the event
    this.dialogService
      .open(
        SimpleModalComponent,
        buildDialogOptions<SimpleModalData>({
          data: {
            message: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
            confirmText: 'Supprimer',
            confirm: true,
            severity: 'danger',
            cancelText: 'Annuler',
          },
        })
      )!
      .onClose.subscribe(result => {
        if (result) {
          this.eventsService.delete(this.event()).subscribe({
            next: () => {
              this.router.navigate(['/dashboard']);
            },
            error: error => {
              // Handle error
            },
          });
        }
      });
  }
}
