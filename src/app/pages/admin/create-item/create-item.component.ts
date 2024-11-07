import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule],
  template: `<p>create-item works!</p>`,
  styleUrl: './create-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateItemComponent {}
