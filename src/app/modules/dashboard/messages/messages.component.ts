import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';

@Component({
  selector: 'workspace-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  playerMessages: any = [];
  @Output() refreshUserData:  EventEmitter<any> = new EventEmitter<any>();
  constructor(private websocket: WebsocketService) { }

  ngOnInit(): void {
    this.websocket.sendMessage({"command":"user_messages","params":{"where":{"type":''}},"rid":"161038271632320"});

    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === '161038271632320') {
          if (data.code === 0) {
            this.playerMessages = [..._.orderBy(data.data.messages, ['date'],['desc'] )];
            this.playerMessages = [..._.orderBy(this.playerMessages, ['checked'], ['asc'])];
          } else {
            console.log('error');
          }
        }
        if(data.rid === '161038474996818'){
          if (data.code === 0) {
            this.refreshUserData.emit(true);
          } else {
            console.log('error');
          }
        }
      }
    });

  }


  readMessage(message, i){
    this.playerMessages[i].open = !this.playerMessages[i].open;
    if(!this.playerMessages[i].checked){
      this.playerMessages[i].checked = 1;
      this.sendForReadMessage(message.id)
    }
  }

  sendForReadMessage(id){
    this.websocket.sendMessage({"command":"read_user_message","params":{"message_id":id},"rid":"161038474996818"}	)
  }

}
