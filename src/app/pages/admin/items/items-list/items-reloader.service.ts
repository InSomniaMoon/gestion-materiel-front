import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'platform',
})
export class ItemsReloaderService {
  reloadItem = new Subject<void>();
}
