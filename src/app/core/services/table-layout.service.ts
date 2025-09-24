import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TableLayoutService {
  private _layout = signal<'list' | 'grid'>('list');
  layout = this._layout.asReadonly();
  setLayout(layout: 'list' | 'grid') {
    this._layout.set(layout);
    localStorage.setItem('table-layout', layout);
  }
  constructor() {
    const savedLayout = localStorage.getItem('table-layout');
    if (savedLayout === 'list' || savedLayout === 'grid') {
      this._layout.set(savedLayout);
    }
  }
}
