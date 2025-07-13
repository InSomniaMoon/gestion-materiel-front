import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-backoffice-dashboard',
  imports: [CardModule, RouterLink, ButtonModule],
  template: `
    @for (card of cards; track $index) {
    <p-card class="card" [header]="card.label">
      <i class="pi pi-{{ card.icon }}"></i>
      <ng-template #footer>
        <a
          pButton
          severity="secondary"
          [routerLink]="card.link"
          [outlined]="true"
          >Aller</a
        >
      </ng-template>
    </p-card>
    }
  `,
  styleUrl: './backoffice-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAdminDashboardComponent {
  cards = [
    {
      label: 'Gestion des utilisateurs',
      icon: 'person',
      link: '/backoffice/users',
    },
    {
      label: 'Gestion des groupes',
      icon: 'persons',
      link: '/backoffice/groups',
    },
  ];
}
