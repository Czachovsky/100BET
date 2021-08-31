import { DecimalPipe, formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatBase'
})
export class FormatBasePipe implements PipeTransform {

  constructor(private numberPipe: DecimalPipe) {}

  transform(value: number): any {
    if (!value && value !== 0) {
      return;
    }
    if (value.toString().split('.').length > 1 && (value.toString().split('.')[1] === '25' || value.toString().split('.')[1] === '75')) {
      const basedig = value.toString().split('.')[0];
      let str = '';
      if (value.toString().split('.')[1] === '25') {
        str = basedig + '.0, ' + basedig + '.5';
      } else {

        if(basedig[0] === '-') {
          const newDig = parseInt(basedig[1], 0) + 1;
          str = basedig + '.5, ' + basedig[0] + newDig + '.0';
        } else {
          const newDig = parseInt(basedig[0], 0) + 1;
          str = basedig + '.5, ' + '+' +  newDig + '.0';
        }

      }
      return str;
    } else {
      return this.numberPipe.transform(value, '1.1-1');
    }
  }
}
