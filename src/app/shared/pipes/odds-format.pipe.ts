import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'oddsFormat'
})
export class OddsFormatPipe implements PipeTransform {

  transform(value: any, type: string): any {
    const fValue = parseFloat(value);
    const iValue = parseInt(value, 10);
    const rValue = (value !== undefined && value !== '') ? Math.round(parseFloat(value) * 1000 || 0) / 1000 : value;
    const priceDecimals = 3;

    switch (type) {
      case 'decimal': {
        if (value.toString().split('.').length > 1 && value.toString().split('.')[1].length === 3) {
          return value;
        } else {
          const num = formatNumber(value, 'en-US', '1.2-2');
          return num;
        }
      }
      case 'fractional': {
        return this.decimalToFractional(rValue);
      }
      case 'american': {
        return value ? rValue > 2 ? '+' + Math.round(100 * (rValue - 1)) : rValue !== 1 ? Math.round(-100 / (rValue - 1)) : '-' : rValue;
      }
      case 'hongkong': {
        const hValue = (value !== undefined && value !== '') ? (iValue !== fValue && value.toString().split('.')[1].length > 2) ? (Math.round((value - 1) * Math.pow(10, priceDecimals)) / Math.pow(10, priceDecimals)) : (fValue - 1.0).toFixed(2) : value;
        return Number(hValue).toFixed(priceDecimals);

      }
      case 'malay': {
        if (fValue === 2) {
          return '1.00';
        } else if (fValue > 2) {
          return (Math.round(((1 / (1 - fValue))) * Math.pow(10, priceDecimals + 3)) / Math.pow(10, priceDecimals + 3)).toFixed(priceDecimals);
        }
        return (fValue - 1).toFixed(priceDecimals);
      }
      case 'indo': {
        if (fValue === 2) {
          return '1.00';
        } else if (fValue > 2) {
          return (fValue - 1).toFixed(priceDecimals);
        }
        return (Math.round(((1 / (1 - fValue))) * Math.pow(10, priceDecimals + 3)) / Math.pow(10, priceDecimals + 3)).toFixed(priceDecimals);
      }
      default:
        return rValue;
    }

  }

  decimalToFractional(decVal) {
    let Znxt;
    let Dnxt;
    let Nnxt;

    function recCalc(Zcur, Dcur?, Dprev?) {
      Dcur = Dcur !== undefined ? Dcur : 1;
      Dprev = Dprev !== undefined ? Dprev : 0;
      Znxt = 1 / (Zcur - parseInt(Zcur, 10));
      Dnxt = Dcur * parseInt(Znxt, 10) + Dprev;
      Nnxt = Math.round(decVal * Dnxt);
      return (Nnxt / Dnxt === decVal) ? Nnxt.toString() + '/' + Dnxt.toString() : recCalc(Znxt, Dnxt, Dcur);
    }

    if (decVal !== parseInt(decVal, 10)) {
      decVal = parseFloat((parseInt(decVal, 10) - 1).toString() + '.' + String(decVal).split('.')[1]);
    } else {
      decVal = decVal - 1;
    }

    return decVal % 1 === 0 ? String(decVal) + '/1' : String(recCalc(decVal));
  }
}
