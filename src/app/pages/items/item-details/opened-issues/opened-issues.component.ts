import { DatePipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { IssueDetailsComponent } from '@app/components/issue-details/issue-details.component';
import { AuthService } from '@app/core/services/auth.service';
import { ItemOption } from '@app/core/types/itemOption.type';
import { OptionIssue } from '@app/core/types/optionIssue.type';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-opened-issues',
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
              (onClick)="openIssueDetailsModal(issue)" />
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

  readonly dialogService = inject(DialogService);

  options = input<ItemOption[]>([]);
  optionsChange = output<void>();
  itemId = input.required<number>();
  openIssueDetailsModal(issue: OptionIssue) {
    this.dialogService
      .open(IssueDetailsComponent, {
        data: { issue },
        header: 'Détails du problème',
        width: 'auto',
      })
      .onClose.subscribe(event => {
        if (event) {
          this.optionsChange.emit();
        }
      });
  }
}
