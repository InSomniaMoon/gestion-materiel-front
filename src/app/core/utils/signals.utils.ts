import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

export function debounceTimeSignal<T>(
  valueSignal: Signal<T>,
  time: number = 500
): Signal<T> {
  return toSignal(toObservable(valueSignal).pipe(debounceTime(time)), {
    initialValue: valueSignal(),
  });
}
