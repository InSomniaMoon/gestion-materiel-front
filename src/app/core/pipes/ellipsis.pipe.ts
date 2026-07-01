import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
  pure: true,
})
export class EllipsisPipe implements PipeTransform {
  transform(value?: string, length: number = 50): string {
    if (!value) {
      return '';
    }
    return value.length > length ? value.substring(0, length) + '...' : value;
  }
}
