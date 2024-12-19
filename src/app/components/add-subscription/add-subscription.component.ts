import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item } from '@app/core/types/item.type';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { fromEvent, map, startWith } from 'rxjs';

@Component({
    selector: 'app-add-subscription',
    imports: [
        DialogModule,
        ButtonModule,
        CalendarModule,
        ReactiveFormsModule,
        InputTextModule,
    ],
    templateUrl: './add-subscription.component.html',
    styleUrl: './add-subscription.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSubscriptionComponent implements OnInit {
  subscriptionChange = output<void>();

  private ref = inject(DynamicDialogRef);

  // check if screen is a mobile device from event
  isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth <= 768),
      startWith(window.innerWidth <= 768),
    ),
  );

  fb = inject(FormBuilder);

  curDate = new Date();
  form = this.fb.group({
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    start_date: this.fb.control('', {
      nonNullable: true,
    }),
    end_date: this.fb.control('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.curDate.setMinutes(0, 0, 0);

    this.form.valueChanges.subscribe((value) => {
      console.log(value);
    });

    // format :2024-11-13 16:01
    this.form.patchValue({
      start_date: this.formatDate(this.curDate),
      end_date: this.formatDate(this.curDate),
    });
  }

  close() {
    this.ref.close();
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.ref.close(this.form.value);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
