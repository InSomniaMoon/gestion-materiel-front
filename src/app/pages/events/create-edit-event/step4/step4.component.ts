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

  groupedItems = computed(() => {
    const grouped: { [key: string]: ItemSelection[] } = {};
    this.event().materials.forEach((item: ItemSelection) => {
      const categoryName = item.item.category?.name || 'Sans catégorie';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push({ item: item.item, quantity: item.quantity });
    });
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));
  });
}
