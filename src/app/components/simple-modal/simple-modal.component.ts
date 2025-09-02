import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface SimpleModalData {
  message: string;
  confirm: boolean;
  confirmText: string;
  cancelText: string;
  severity?: ButtonSeverity;
}

@Component({
  selector: 'app-simple-modal',
  imports: [DialogModule, ButtonModule],
  templateUrl: './simple-modal.component.html',
  styleUrl: './simple-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleModalComponent implements OnInit {
  private ref = inject(DynamicDialogRef);
  private dialog$ = inject(DialogService);

  data = signal<SimpleModalData>({
    message: '',
    confirm: false,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    severity: 'primary',
  });

  ngOnInit(): void {
    this.data.set(this.dialog$.getInstance(this.ref).data);
  }

  closeConfirm() {
    this.ref.close(true);
  }

  closeCancel() {
    this.ref.close(false);
  }
}
