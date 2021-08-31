import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { WebSocketSubject } from 'rxjs/internal-compatibility';
import { webSocket } from 'rxjs/webSocket';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, retryWhen, switchAll, tap, delayWhen } from 'rxjs/operators';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  openSocket: any;
  reconnectAttempts = 3;
  private pageLang: string;
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public socketInfo = new Subject();
  isOpenSocket$ = this.socketInfo.asObservable();
  public reconnectWebsocket$ = new Subject<any>();
  public messages$ = this.messagesSubject$.pipe(
    switchAll(),
    catchError((e) => {
      throw e;
    })
  );
  initPayload: object;
  constructor(
    private error: ErrorService
  ) {

  }

  public connect(lang): Observable<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.pageLang = lang === 'en' ? 'eng' : 'zhh';
      this.initPayload = {
        command: 'request_session',
        params: {
          language: this.pageLang,
          site_id: environment.settings.siteID,
        },
      };
      console.log('%c BC initPayload: ' + JSON.stringify(this.initPayload), 'color:green;');
      this.socket$ = this.getNewWebSocket();
      this.socket$.next(this.initPayload);
      this.socket$.subscribe(
        (msg) => {
          if(msg.error){
            console.log('%c'+msg.error, 'color:red;')
          }
          this.error.checkError(msg);
        },
        (err) => {
          if (err.code === 1006) {
            window.location.reload();
          }
          //  this.reconnectWebsocket$.next(true);
          console.log(err, ` --> ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} / ${new Date().getTime()}`);
        },
        () => console.log('complete'))
      return this.socket$.asObservable();
    }
  }

  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(retryWhen(errors => errors.pipe(tap(val => console.log('%c [Data Service] Try to reconnect', 'color:blue;', val)),
      delayWhen(_ => timer(2000)))));
  }

  public getData(): Observable<any> {
    return this.socket$;
  }

  private getNewWebSocket() {
    return webSocket({
      url: environment.settings.wssUrl,
      openObserver: {
        next: () => {
          console.log('%c [DataService]: connection ok', 'color:green;');
        }
      },
      closeObserver: {
        next: () => {
          console.log('%c [DataService]: connection closed -> reconnecting, '+this.reconnectAttempts+' attempts left', 'color:red;');
          if(this.reconnectAttempts > 0){
            this.socket$ = undefined;
            this.connect(this.pageLang);
            this.reconnectAttempts = this.reconnectAttempts - 1;
          } else {
            window.location.reload();
          }
        }
      },

    });
  }

  sendMessage(msg: any) {
    if (!this.openSocket) {
      this.isOpenSocket$.subscribe(data => {
        if (data) {
          this.openSocket = data;
          this.socket$.next(msg);
        }
      })
    } else {
      this.socket$.next(msg);
    }

  }
  close() {
    console.log('closing...');
    this.socket$.complete();
    this.socket$.unsubscribe();
  }
}
