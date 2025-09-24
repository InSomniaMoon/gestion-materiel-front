import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRole',
})
export class UserRolePipe implements PipeTransform {
  transform(value: string): string {
    return value === 'admin' ? 'Administrateur' : 'Utilisateur';
  }
}
