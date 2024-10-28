import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionService } from '@app/core/services/subscription.service';
import { Item } from '@app/core/types/item.type';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-add-subscription',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    CalendarModule,
    ReactiveFormsModule,
    InputTextModule,
  ],
  templateUrl: './add-subscription.component.html',
  styleUrl: './add-subscription.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSubscriptionComponent {
  private readonly subscriptionService = inject(SubscriptionService);

  subscriptionChange = output<void>();

  visible = model.required<boolean>();
  item = input.required<Item>();

  fb = inject(FormBuilder);

  form = this.fb.group({
    name: this.fb.control('', { nonNullable: true }),
    start_date: this.fb.control('', { nonNullable: true }),
    end_date: this.fb.control('', { nonNullable: true }),
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.subscriptionService
      .addSubscription(this.item(), {
        name: this.form.value.name!,
        start_date: new Date(this.form.value.start_date!),
        end_date: new Date(this.form.value.end_date!),
        item_id: this.item().id,
        status: 'active',
        id: 0,
        user_id: 0,
      })
      .subscribe({
        next: () => {
          this.visible.set(false);
          this.subscriptionChange.emit();
        },

        error: (error) => {
          console.error(error);
        },
      });
  }
}
