import { Signal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

export function debounceTimeSignal<T>(
  valueSignal: Signal<T>,
  time: number = 0
): Signal<T> {
  return toSignal(toObservable(valueSignal).pipe(debounceTime(time)), {
    initialValue: valueSignal(),
  });
}
