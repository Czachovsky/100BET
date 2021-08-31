import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { HttpService } from '../../../shared/services/http/http.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { UtilityService } from '../../../shared/services/utility.service';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { WindowService } from '../../../shared/services/window/window.service';

@Component({
  selector: 'workspace-withdrawal',
  templateUrl: './withdrawal.component.html',
  styleUrls: ['./withdrawal.component.scss']
})
export class WithdrawalComponent implements OnInit {
  amount;
  enteredAmount;
  withdrawAmount;
  withdrawalAttempLeft = 5;
  userInfo;
  isLoading = false;
  predefinedValues = [300, 500, 1000, 1500, 3000, 4999];
  message = '';
  showForm = false;
  showNoChannelsModal: boolean;
  balance;
  withdrawable;
  bankName;
  allBankList = [];
  bankList = [];
  isMobile: boolean;
  confirmWithdrawal: boolean;
  minimumReqAmount;
  maximumReqAmount;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private actRoute: ActivatedRoute,
    private router: Router,
    private httpSer: HttpService,
    private utility: UtilityService,
    private decimal: DecimalPipe,
    private windowService: WindowService,
    private auth: AuthService,
    private translate: TranslateService,
    private subscripton: SubscriptionsService,
    private websocket: WebsocketService) {
    this.subscripton.checkIfGetUserInfo().subscribe(data => {
      if(data) {
        this.userInfo = this.auth.userInfoObject;
        if (this.userInfo.address) {
          const idx = this.allBankList.findIndex(x => (x.bankCode === this.userInfo.address.split('/')[0]));
          if (idx !== -1) {
            this.bankName = this.allBankList[idx]['bankName'];
            this.minimumReqAmount = this.decimal.transform(this.allBankList[idx].minAmount, '1.2-2');
            this.maximumReqAmount = this.decimal.transform(this.allBankList[idx].maxAmount, '1.2-2');
          }
        }
      }
    });

    this.windowService.onResize$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data.width <= 992) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    if (this.windowService.getScreenSize() <= 992) {
      this.isMobile = true;
    }
    this.userInfo = this.auth.userInfoObject;
    this.balance = decimal.transform(this.userInfo.balance, '1.2-2');
    this.withdrawable = decimal.transform(this.userInfo.balance - this.userInfo.unplayed_balance - this.userInfo.bonus_balance, '1.2-2');
  }

  ngOnInit(): void {
    this.getBankList();
    this.getTransactionRecords(Math.round(new Date().getTime() / 1000), Math.round(new Date().getTime() / 1000));


    this.websocket.getData().subscribe(data => {
      if (data.data && data.data !== 'null' && data.data !== 'undefined') {
        if (data.rid === `withdraw Amount`) {
          this.isLoading = false;
          if(data.data.result === '-20007'){
            this.message = data.data.details.error;
          } else {
            this.message = '';
            this.goToDashboardSection('transaction');
          }
        }
        if (data.rid === `OHB-HistoryTransactions`) {
          if(data.data.result === '-2455'){
            console.log('waiting....')
          } else {
            if (data.code === 0) {
              const arr = data.data.history || [];
              let total = 0;
              let i = 0;
              for (const item of arr) {
                if (item.operation === 12) {
                  total += item.amount;
                  i++;
                }
              }
              this.withdrawalAttempLeft = this.withdrawalAttempLeft < i ? 0 : this.withdrawalAttempLeft - i;
              this.withdrawAmount = 200000 + total;
            } else {
              console.log('error')
            }
          }
        }
      }
    })
  }

  sendMessage() {
    this.websocket.sendMessage({
      "command": "withdraw",
      "params": {
      "amount": this.amount,
      "service": 6505,
      "payee": {
        "email": this.userInfo.email,
        "name": this.userInfo.username,
        bankCode: this.userInfo.address.split('/')[0],
        bankAccountName: this.userInfo.name,
        province: this.userInfo.address.split('/')[1],
        city: this.userInfo.address.split('/')[2],
        branch: this.userInfo.address.split('/')[3],
        bankAccountNumber: this.userInfo.iban
      }
      },
      "rid": "withdraw Amount"
    });
  }


  getTransactionRecords(start, end){
    this.websocket.sendMessage(   {
      "command": "balance_history",
      "params": {
        "where": {
          "from_date": start,
          "to_date": end,
        }
      },
      "rid": `OHB-HistoryTransactions`
    })
  }

  withdraw() {
    this.isLoading = true;
    this.sendMessage();
  }

  confirmWithdraw() {
    if (this.userInfo.iban && this.userInfo.address && this.amount) {
      const minReq = this.minimumReqAmount ? Number(this.minimumReqAmount.split(',').join('')) : 0;
      const maxReq = this.maximumReqAmount ? Number(this.maximumReqAmount.split(',').join('')) : 0;
      const withdrawal = this.withdrawable ? Number(this.withdrawable.split(',').join('')) : 0;
      if ((minReq && maxReq) && this.amount > 0 && this.amount <= withdrawal && this.amount >= minReq && this.amount <= maxReq && this.withdrawalAttempLeft > 0) {
        if (this.amount.toString().indexOf('.') === -1) {
          this.enteredAmount = this.amount;
          const random = this.utility.genrateRandomNumber(0, 1, 2);
          this.amount -= random;
          this.confirmWithdrawal = true;
        } else {
          this.withdraw();
        }

      } else {
        if (!minReq || !maxReq) {
          this.message = this.translate.instant('withdrawal.error.message6');
        } else if (this.amount > withdrawal) {
          this.message = this.translate.instant('withdrawal.error.message1');
        } else if (this.withdrawalAttempLeft <= 0) {
          this.message = this.translate.instant('withdrawal.error.message2');
        } else if (this.amount < minReq || this.amount > maxReq) {
          this.message = this.translate.instant('withdrawal.error.message4');
        }
      }
    } else if (!this.amount) {
      this.message = this.translate.instant('withdrawal.error.message3');
    } else {
      this.message = this.translate.instant('withdrawal.error.message5');
    }
  }

  getBankList() {
    this.httpSer.callRequest(`payment/getwithdrawablebanks`,'GET')
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.allBankList = data;
      if (this.userInfo.address) {
        const idx = this.allBankList.findIndex(x => (x.bankCode === this.userInfo.address.split('/')[0]));
        if (idx !== -1) {
          this.bankName = this.allBankList[idx]['bankName'];
          this.minimumReqAmount = this.decimal.transform(this.allBankList[idx].minAmount, '1.2-2');
          this.maximumReqAmount = this.decimal.transform(this.allBankList[idx].maxAmount, '1.2-2');
        }
      }
      this.bankList = this.allBankList.filter(x => x.isAvailable).map((bank) => ({
        optionName: bank.bankName,
        optionDisplayName: bank.bankName,
        optionValue: bank.bankCode,
        noTranslate: true
      }));
      if(!this.bankList.length) {
        this.showNoChannelsModal = true;
      }
    });
  }

  goToDashboardSection(section){
    this.router.navigate(['.'], {relativeTo: this.actRoute, queryParams: {"tab": section}});
  }

  addedCard(event) {
    this.userInfo.iban = event.accNo;
    this.bankName = event.bankName;
    this.userInfo.address = '/';
  }

  getDigit(num) {
    return num ? num.split('.')[0] : 0;
  }

  getFractional(num) {
    return num ? num.split('.')[1] : 0;
  }

  showModal() {
    this.showForm = true;
    this.subscripton.setOpenModal(true);
  }

  closeModal() {
    this.subscripton.setOpenModal(false);
    this.subscripton.setCloseModal(true)
  }

}
