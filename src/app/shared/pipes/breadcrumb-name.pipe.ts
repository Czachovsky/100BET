import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'breadcrumbName'
})
export class BreadcrumbNamePipe implements PipeTransform {

  transform(value: string): string {
    value = value.charAt(0).toUpperCase() + value.slice(1);
    return value.split('-').join(' ');
  }

}
