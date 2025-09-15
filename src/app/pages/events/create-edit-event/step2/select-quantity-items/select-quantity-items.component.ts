import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ItemWithQuantity } from '@app/core/types/item.type';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-select-quantity-items',
  imports: [AccordionModule, Button, InputText, FormsModule, FloatLabel],
  templateUrl: './select-quantity-items.component.html',
  styleUrl: './select-quantity-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectQuantityItemsComponent {
  private ref = inject(DynamicDialogRef);
  item = input.required<ItemWithQuantity>();

  quantity = signal(1);
  closeCancel() {
    this.ref.close();
  }

  closeConfirm() {
    this.ref.close(this.quantity());
  }
}
