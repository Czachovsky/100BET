import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';

@Component({
  selector: 'workspace-my-bonus',
  templateUrl: './my-bonus.component.html',
  styleUrls: ['./my-bonus.component.scss']
})
export class MyBonusComponent implements OnInit {

  constructor(
    private websocket: WebsocketService
  ) {
    this.getSportBookBonus();
    this.getCasinoBonus();
    this.get_Bonus_Rule();
  }

  bonus:any = [];
  bonus_rule = {
    MinOdds: 0,
    MinimumSelections: 0
  }

  loading = true;

  ngOnInit(): void {
    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'get_bonus_details_true') {
          if(data.data.bonuses) {
            console.log(data)
            let bonus = data.data.bonuses;
            bonus = bonus.filter((b: any)=> {
             if(!b.can_accept && b.acceptance_type !== 0 && b.bonus_type !== 2){
               const currentDate = new Date().getTime();
               if(b.client_bonus_expiration_date && (b.client_bonus_expiration_date*1000 > currentDate)) {
                 b.expire_d = this.convertInDayAndHour(b.client_bonus_expiration_date*1000, currentDate);
                 return b
               }
             }
            });
            this.bonus = [...this.bonus, ...bonus];
            this.loading = false;
          }
        }
        else if (data.rid === 'get_bonus_details_false') {
          if(data.data.bonuses) {
            console.log(data)
            let bonus = data.data.bonuses;
            bonus = bonus.filter((b: any)=> {
              if(!b.can_accept && b.acceptance_type !== 0 && b.bonus_type !== 2){
                const currentDate = new Date().getTime();
                if(b.client_bonus_expiration_date && (b.client_bonus_expiration_date*1000 > currentDate)) {
                  b.expire_d = this.convertInDayAndHour(b.client_bonus_expiration_date*1000, currentDate);
                  return b
                }
              }
             });
            this.bonus = [...this.bonus, ...bonus];
            this.loading = false;
          }
        }
        else if(data.rid === 'get_sport_bonus_rules') {
          console.log(data);
          if(data.data && data.data.details) {
            data.data.details.map((rule: any)=>{
              this.bonus_rule.MinOdds = this.bonus_rule.MinOdds + rule.MinOdds;
              this.bonus_rule.MinimumSelections = this.bonus_rule.MinimumSelections + rule.MinimumSelections
            });
          }
        }
      }
    });
  }

  convertInDayAndHour(time, currentDate){
    const difference = time - currentDate;
    const days = Math.floor(difference / (1000*60*60*24));
    const hours = Math.floor((difference % (1000*60*60*24))/(60*60*1000))

    return days+'d '+hours+'h'
  }

  getSportBookBonus(){
    this.websocket.sendMessage({
      'command': 'get_bonus_details',
      'params': {
        "free_bonuses" : true
      },
      "rid":"get_bonus_details_true"
    });
  }

  getCasinoBonus() {
    this.websocket.sendMessage({
      'command': 'get_bonus_details',
      'params': {
        "free_bonuses" : false
      },
      "rid":"get_bonus_details_false"
    });
  }

  get_Bonus_Rule() {
    this.websocket.sendMessage({
      'command': 'get_sport_bonus_rules',
      'params': { },
      "rid":"get_sport_bonus_rules"
    });
  }

}
