import { Pipe, PipeTransform } from '@angular/core';
export const localeCode = localStorage.getItem('pageLanguage');
@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(value: any, hour?: boolean): any {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1
    const day = date.getDate();
    let _hour = '';
    if(hour){
       _hour = `${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    }
    if(localeCode === 'en'){
      return `${day<10?'0':''}${day}/${month<10?'0':''}${month}/${year} ${hour ? _hour : ''}`;
    } else {
      return `${year}/${month<10?'0':''}${month}/${day<10?'0':''}${day} ${hour ? _hour : ''}`;
    }
  }

}
