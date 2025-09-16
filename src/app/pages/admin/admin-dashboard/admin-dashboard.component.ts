import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Card, ButtonDirective, RouterLink],
  template: `
    @for (item of items; track $index) {
      <p-card>
        <ng-template #header> </ng-template>
        <ng-template #title> {{ item.label }} </ng-template>

        <ng-template #footer>
          <div>
            <a
              class="p-button"
              pButton
              [outlined]="true"
              [routerLink]="item.link">
              Voir
            </a>
          </div>
        </ng-template>
      </p-card>
    }
  `,
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  items = [
    { label: 'Mes Objets', link: '/admin/items' },
    { label: "Mes catégories d'objets", link: '/admin/categories' },
    { label: 'Mon groupe', link: '/admin/my-group' },
    { label: 'Mes utilisateurs', link: '/admin/users' },
  ];
}
