import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor( private http: HttpClient) { }

  getJson(filename: string){
    return this.http.get(`assets/dev/json/${filename}.json`);
  }

}
