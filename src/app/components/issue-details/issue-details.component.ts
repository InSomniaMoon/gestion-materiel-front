import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IssueCommentsService } from '@app/core/services/issue-comments.service';
import { OptionIssuesService } from '@app/core/services/option-issues.service';
import { OptionIssue } from '@app/core/types/optionIssue.type';
import { DIALOG_RESPONSIVE_BREAKPOINTS } from '@app/core/utils/constants';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Inplace, InplaceModule } from 'primeng/inplace';
import { Textarea } from 'primeng/textarea';
import { lastValueFrom } from 'rxjs';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '../simple-modal/simple-modal.component';

type IssueDetailsComponentData = {
  itemId: number;
  issue: OptionIssue;
};

@Component({
  selector: 'app-issue-details',
  imports: [
    DatePipe,
    DialogModule,
    ButtonModule,
    InplaceModule,
    FormsModule,
    Textarea,
  ],
  templateUrl: './issue-details.component.html',
  styleUrl: './issue-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetailsComponent implements OnInit {
  ref = inject(DynamicDialogRef);
  dialog = inject(DialogService);
  private readonly issueCommentsService = inject(IssueCommentsService);
  private readonly issueService = inject(OptionIssuesService);

  inplace = viewChild.required<Inplace>('inplace');

  data: IssueDetailsComponentData = this.dialog.getInstance(this.ref).data;

  commentsQuery = injectQuery(() => ({
    queryKey: ['issueComments', this.data.issue.id],
    queryFn: () =>
      lastValueFrom(
        this.issueCommentsService.getComments(
          this.data.itemId,
          this.data.issue.item_option_id,
          this.data.issue.id
        )
      ),
  }));

  comments = computed(
    () =>
      this.commentsQuery
        .data()
        ?.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) ?? []
  );

  newComment = signal<string>('');

  ngOnInit(): void {}

  onResolve() {
    const config: DynamicDialogConfig<SimpleModalData> = {
      header: 'Résoudre le problème',
      height: 'auto',
      data: {
        confirm: true,
        cancelText: 'Annuler',
        confirmText: 'Résoudre',
        message: 'Voulez-vous vraiment résoudre ce Problème ?',
      },
      breakpoints: DIALOG_RESPONSIVE_BREAKPOINTS,
    };
    this.dialog.open(SimpleModalComponent, config).onClose.subscribe(result => {
      if (!result) {
        return;
      }
      // resolve issue
      this.issueService.resolve(this.data.issue).subscribe({
        next: () => {
          this.ref.close(true);
        },
      });
    });
  }

  onAddComment() {
    this.issueCommentsService
      .addComment(
        this.data.itemId,
        this.data.issue.item_option_id,
        this.data.issue.id,
        this.newComment()
      )
      .subscribe({
        next: () => {
          this.newComment.set('');
          this.commentsQuery.refetch();
          this.closeInplace();
        },
      });
  }

  closeInplace() {
    this.inplace().deactivate();
  }
}
