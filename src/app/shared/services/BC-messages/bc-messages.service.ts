import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BCMessagesService {
  constructor() {}

  bcUnsubscribe(id) {
    return { command: 'unsubscribe', params: { subid: id } };
  }

  bcMessageBuilder(command: string, subscribe: boolean, rid?: string) {
    const message = {};
    message['command'] = command;
    message['params'] = {};
    message['params']['subscribe'] = subscribe;


    return message;
  }
}
