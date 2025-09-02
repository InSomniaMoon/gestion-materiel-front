import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Item } from '@core/types/item.type';
import { Button } from 'primeng/button';

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

  groupedItems = computed(() => {
    const grouped: { [key: string]: Item[] } = {};
    this.event().materials.forEach((item: Item) => {
      const categoryName = item.category?.name || 'Sans catégorie';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));
  });
}
