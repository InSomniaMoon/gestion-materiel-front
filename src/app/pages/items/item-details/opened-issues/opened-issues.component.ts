import { DatePipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOption } from '@app/core/types/itemOption.type';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-opened-issues',
  standalone: true,
  imports: [ButtonModule, CardModule, DatePipe],
  template: `<div class="title">
      <h2>Problèmes non résolus</h2>
      <!-- <p-button outlined icon="pi pi-plus" iconPos="right" label="" /> -->
    </div>
    @for (option of options(); track $index) {
      <h3>{{ option.name }}</h3>
      @for (issue of option.option_issues; track $index) {
        <p-card [subheader]="'délcarée le ' + (issue.created_at | date)">
          <p>{{ issue.value }}</p>
          <ng-template pTemplate="footer">
            <p-button
              label="Voir les details"
              severity="secondary"
              outlined="true"
            />
          </ng-template>
        </p-card>

        <!-- <pre>{{ issue | json }}</pre> -->
      }
    }`,
  styleUrl: './opened-issues.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenedIssuesComponent {
  readonly userAdmin = inject(AuthService).isAdmin;

  options = input<ItemOption[]>([]);
  optionsChange = output<void>();
  itemId = input.required<number>();
}
