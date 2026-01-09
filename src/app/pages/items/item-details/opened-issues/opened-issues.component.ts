import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { IssueDetailsComponent } from '@app/components/issue-details/issue-details.component';
import { Item } from '@app/core/types/item.type';
import { ItemIssue } from '@app/core/types/itemIssue.type';
import { AuthService } from '@services/auth.service';
import { buildDialogOptions } from '@utils/constants';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { DeclareIssueComponent } from '../declare-issue/declare-issue.component';

@Component({
  selector: 'app-opened-issues',
  imports: [ButtonModule, CardModule, DatePipe],
  template: `<div class="title">
      <h2>Problèmes non résolus</h2>
      <p-button
        outlined
        icon="pi pi-plus"
        iconPos="right"
        severity="danger"
        (onClick)="openDeclareIssueDialog()"
        label="" />
    </div>

    @for (issue of issues(); track $index) {
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
    }`,
  styleUrl: './opened-issues.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenedIssuesComponent {
  readonly userAdmin = inject(AuthService).isAdmin;

  readonly dialogService = inject(DialogService);

  issues = input<ItemIssue[]>([]);
  issuesChange = output<void>();
  item = input.required<Item>();
  openIssueDetailsModal(issue: ItemIssue) {
    this.dialogService
      .open(
        IssueDetailsComponent,
        buildDialogOptions({
          inputValues: { issue, item: this.item() },
          header: 'Détails du problème',
          width: 'auto',
        })
      )!
      .onClose.subscribe(event => {
        if (event) {
          this.issuesChange.emit();
        }
      });
  }

  openDeclareIssueDialog() {
    this.dialogService
      .open(
        DeclareIssueComponent,
        buildDialogOptions({
          header: 'Déclarer un problème',
          inputValues: { item: this.item() },
        })
      )!
      .onClose.subscribe((somethingHappened: boolean) => {
        if (somethingHappened) {
          this.issuesChange.emit();
        }
      });
  }
}
