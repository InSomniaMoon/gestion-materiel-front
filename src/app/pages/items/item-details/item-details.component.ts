import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from '@app/core/services/items.service';
import { Item } from '@app/core/types/item.type';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsComponent implements OnInit {
  private readonly routeSnapshot = inject(ActivatedRoute).snapshot;
  private readonly itemService = inject(ItemsService);
  // title service to change the title of the page
  private readonly titleService = inject(Title);

  item = signal<Item | null>(null);
  options = signal<any[]>([]);

  ngOnInit(): void {
    const itemId = this.routeSnapshot.params['id'];
    // get itemid from route
    this.itemService.getItem(itemId).subscribe({
      next: (item) => {
        this.item.set(item);
        this.titleService.setTitle(item.name);
      },
    });
  }
}
