import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class TranslateFromJsonService {
  versionToSend: any;

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.versionToSend = new Date().valueOf();

  }
}
