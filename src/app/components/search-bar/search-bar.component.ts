import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-bar',
  imports: [InputTextModule, InputIconModule, IconFieldModule],
  template: `
    <p-iconField iconPosition="left">
      <input
        pInputText
        fluid
        #searchInput
        type="text"
        [placeholder]="placeholder()" />
      <p-inputIcon [class]="icon()" />
    </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit {
  queryChange = output<string>();

  placeholder = input<string>('Rechercher');
  icon = input<string>('pi pi-search');

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  ngOnInit(): void {
    fromEvent(this.searchInput().nativeElement, 'input')
      .pipe(
        map((e: Event) => (e.target as HTMLInputElement).value),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(query => this.queryChange.emit(query));
  }
}
