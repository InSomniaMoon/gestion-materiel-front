import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsComponent {

}
