import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Button } from 'primeng/button';
import { ItemSelection } from '../create-edit-event.component';

@Component({
  selector: 'app-step4',
  imports: [Button, DatePipe],
  templateUrl: './step4.component.html',
  styleUrl: './step4.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step4Component {
  nextStep = output();
  previousStep = output();

  event = input.required<any>();
  isUpdate = input.required<boolean>();

  structuredItems = computed(() => {
    const structured: { [key: string]: ItemSelection[] } = {};
    this.event().items.forEach((item: ItemSelection) => {
      const categoryName = item.item.category?.name || 'Sans catégorie';
      if (!structured[categoryName]) {
        structured[categoryName] = [];
      }
      structured[categoryName].push({
        item: item.item,
        quantity: item.quantity,
      });
    });
    return Object.entries(structured).map(([category, items]) => ({
      category,
      items,
    }));
  });
}
