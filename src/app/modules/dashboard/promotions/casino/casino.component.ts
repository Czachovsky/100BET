import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { WebsocketService } from '../../../../shared/services/websocket/websocket.service';
import { bonus_banner_ch, bonus_banner_en, banner_id } from '../bonus_banner_url';

@Component({
  selector: 'workspace-casino',
  templateUrl: './casino.component.html',
  styleUrls: ['./casino.component.scss']
})
export class CasinoComponent implements OnInit {

  banner:any = bonus_banner_en;
  banner_id = banner_id;

  constructor(
    private websocket: WebsocketService
  ) { 
    const currentPageLanguage = localStorage.getItem("pageLanguage");
    if(currentPageLanguage === 'zh'){
      this.banner = bonus_banner_ch;
    }
  }


  @Output() changeTab = new EventEmitter<string>();

  bonus:any = [];
  current_slectedBonus:any;
  isGoToMyBonus: Boolean = false;
  isConfirmation: Boolean = false;
  loading = true;
  isError: Boolean = false;
  errorMessage: any;

  ngOnInit(): void {
    this.getCasinoBonus();
    this.getBonusCount();

    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === 'get_bonus_details_false') {
          if(data.data.bonuses) {
            let bonus = data.data.bonuses;
            bonus = bonus.filter((b: any)=> {
              if(b.can_accept){
                const currentDate = new Date().getTime();
                if(b.start_date && (b.start_date*1000 < currentDate) && b.end_date && (b.end_date*1000 > currentDate)) {
                  b.start_d = this.getFormated_date(b.start_date*1000);
                  b.end_d = this.getFormated_date(b.end_date*1000);
                  return b
                }
              }
            });
            this.bonus = [...this.bonus, ...bonus];
            this.setImageToBonus();
            this.loading = false;
          }
        }
        else if(data.rid === 'claim_bonus'){
          if(data.data.result === 0){
            this.bonus = this.bonus.filter((b: any)=> 
              b && 
              b.partner_bonus_id && 
              this.current_slectedBonus &&
              this.current_slectedBonus.partner_bonus_id &&  
              (b.partner_bonus_id !== this.current_slectedBonus.partner_bonus_id)
            );
            this.getBonusCount();
            this.openGoToMybonusPupUp();
          }
          else {
            this.closeAllPupUp();
            // this.isError = true;
            // this.errorMessage = data.data.result_text;
          }
        }
      }
    });
  }

  getFormated_date(time: any){
    const date = new Date(time);
    return date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear();
  }

  openConfirmationPopUp(boonus: any) {
    this.isConfirmation = true;
    this.current_slectedBonus = boonus;
  }

  openGoToMybonusPupUp(){
    this.isConfirmation = false;
    setTimeout(() => {
      this.isGoToMyBonus = true;
    }, 100)
  }

  closeAllPupUp(){
    this.isConfirmation = false;
    this.isGoToMyBonus = false;
    this.current_slectedBonus = undefined;
    this.errorMessage = '';
    this.isError = false;
  }

  goToMyBonus() {
    this.changeTab.emit("MY_BONUS");
  }

  getCasinoBonus(){
    this.websocket.sendMessage({
      'command': 'get_bonus_details',
      'params': {
        "free_bonuses" : false
      },
      "rid":"get_bonus_details_false"
    });
  }

  claimBonus(bonus_id: any){
    this.websocket.sendMessage({
      'command': 'claim_bonus',
      'params': {
        "bonus_id" : bonus_id
      },
      "rid":"claim_bonus"
    });
  }

  getBonusCount(){
    this.websocket.sendMessage({
      'command': 'get_client_claimable_bonuses_count',
      'params': {},
      "rid":"get_client_claimable_bonuses_count"
    });
  }

  setImageToBonus() {
    this.bonus = this.bonus.map((b: any) => {
      switch (b.partner_bonus_id) {
        case this.banner_id.FirstDeposit:
          b.img_url = this.banner.FirstDeposit;
          break;
        case this.banner_id.FirstDepositSlots:
          b.img_url = this.banner.FirstDepositSlots;
          break;
        case this.banner_id.match_of_the_week:
          b.img_url = this.banner.match_of_the_week;
          break;
        case this.banner_id.Draw_Insurance:
          b.img_url = this.banner.Draw_Insurance;
          break;
        case this.banner_id.Accumulator_Insurance:
          b.img_url = this.banner.Accumulator_Insurance;
          break;
        default:
          b.img_url = this.banner.SecondDeposit;
      }
      return b;
    });
  }

}
