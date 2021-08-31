import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value: number): any {
    if (value.toString().split('.').length > 1 && value.toString().split('.')[1].length === 3) {
      return value;
    } else {
      const num = formatNumber(value, 'en-US', '1.2-2');
      return num;
    }
  }

}
