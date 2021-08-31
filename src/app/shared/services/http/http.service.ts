import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import {Observable, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators'
import { ApiMethod } from '../const'
import { environment } from '../../../../environments/environment'
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) { }

  private handleError(error: any) {
    const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server Error';
    console.log(errMsg);
    return throwError(errMsg);
  }


    callRequest(endpoint: string, method: string, data?: any, casino?: boolean): Observable<any> {
      let response, url;
      casino ? url  = environment.settings.casinoApi : url = environment.settings.apiUrl;
      switch (method) {
      case ApiMethod.GET:
        response = this.http.get(`${url}/${endpoint}`).pipe(catchError((err) => this.handleError(err)));
        break;
      case ApiMethod.POST:
        response = this.http.post(`${url}/${endpoint}`, data).pipe(catchError((err) => this.handleError(err)));
        break
      case ApiMethod.PUT:
        response = this.http.put(`${url}/${endpoint}`, data).pipe(catchError((err) => this.handleError(err)));
        break;
      case ApiMethod.DELETE:
        response = this.http.delete(`${url}/${endpoint}`, data).pipe(catchError((err) => this.handleError(err)));
        break;
      default:
        break;
    }
    return response;
  }
}
