import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLine',
})
export class FirstLinePipe implements PipeTransform {
  transform(value?: string): string {
    if (!value) {
      return '';
    }
    const firstLine = value.split('\n')[0];
    return firstLine;
  }
}
