import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges, OnDestroy,
  OnInit, Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { BetSlipService } from '../../../shared/services/bet-slip/bet-slip.service';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { Subscription } from "rxjs";
import { WindowService } from "../../../shared/services/window/window.service";
import { AnimationsService } from '../../../shared/services/animations/animations.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'workspace-bet-slip',
  templateUrl: './bet-slip.component.html',
  styleUrls: ['./bet-slip.component.scss'],
})
export class BetSlipComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() pickedItems: any;
  @Input() betSlipSubId: any;
  @ViewChild('summaryWrapper', { read: ElementRef, static: false })
  summaryWrapper: ElementRef;
  @ViewChild('betSlipWrapperSub') betSlipWrapperSub: ElementRef;
  @ViewChild('betSlipBody') betSlipBody: ElementRef;
  minStakeError: boolean;
  maxStakeError: boolean;
  betSystem: number;
  confirmDelete: boolean;
  openSettings: boolean;
  betSlipSettings: any;
  openedTab: string;
  allChecked: boolean;
  numpad: boolean;
  tempVal: any;
  numPadOptions: any;
  isMobile: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error1: boolean;
  error2: boolean;
  error3:boolean;
  error4: boolean;
  betslipChanged: boolean;
  selectOptions: any;
  defaultOption: any;
  numpadShow: Subscription;
  isMobileCheck: Subscription;
  isSinglePickChanged: Subscription;
  isLogged: Subscription;
  betSlipUpdateSubscription: Subscription;
  betSlipCartChangedSmall: Subscription;
  balanceErrorSubscription: Subscription;
  blockedOrDeletedSubscription: Subscription;
  betRefSubscription: Subscription;
  betPlacedSubscription: Subscription;
  hideBalanceSubscription: Subscription;
  betCountSubscription: Subscription;
  checkErrorsSubscription: Subscription;
  hideBalance: boolean;
  userBalance: any;
  cdkDragPosition: object = {x: 0, y: 0};
  maximumBetError: boolean;
  minimumBetError: boolean;
  betPlaced: boolean;
  slectedFreeBet: boolean;
  totalReturn: any;
  totalStake: any;
  betSlipHiddenState:boolean;
  betRef: any;

  constructor(
    private betSlipService: BetSlipService,
    public subscriptionService: SubscriptionsService,
    private windowService: WindowService,
    private animation: AnimationsService,
    private auth: AuthService,
    private websocket: WebsocketService,
    private router: Router,
    private renderer: Renderer2
  ) {

    this.subscriptionService.getBetSlipDeleted().subscribe(data => {
      this.betslipChanged = false;
      this.error4 = false;
    })

    this.checkErrorsSubscription = this.subscriptionService.getPleaseCheckErrors().subscribe(data => {
      if(data){
        setTimeout(() => {
          this.checkForErrors();
        }, 500)
      }
    })
    this.betCountSubscription = this.subscriptionService.getbetCount().subscribe(data => {
      if(!data || data ===  0){
        this.betSlipHiddenState = false;
      }
    })
    this.hideBalanceSubscription = this.subscriptionService.getIfBanalceHidden().subscribe(data => {
      this.hideBalance = data;
    })
    this.betRefSubscription = this.subscriptionService.getBetRef().subscribe(data => {
      if(data){
        this.betRef = data;
      }
    })
    this.betPlacedSubscription = this.subscriptionService.getIfBetComplete().subscribe(data => {
        this.betPlaced = data;
        if(data){
          this.isLoading = false;
        }
    });
    this.blockedOrDeletedSubscription = this.subscriptionService.getIfBlockedOrDeleted().subscribe(data => {
      data ? this.error4 = true : this.error4 = false;
    })
    this.balanceErrorSubscription = this.subscriptionService.getIfBalanceError().subscribe(data => {
      data ? this.error3 = true : this.error3 = false;
    })

    this.maximumBetError = false;
    this.minimumBetError = false;
    this.betSlipCartChangedSmall = this.subscriptionService.getBetSlipChangesButDoNotSubscribeAgain().subscribe(data => {
      if(data){
       // this.betslipChanged = false;
        this.calculateFullReturn();
      }
    })
    this.betSlipUpdateSubscription = this.subscriptionService.getBetSlipUpdateFromBC().subscribe(data => {
      if(data && this.auth.isLoggedIn) {
        if(this.betSlipService.returnBetslip.picks.filter(e => e.isChanged).length){
          this.betslipChanged = true;
        }
        this.calculateFullReturn();
      }
    })
    this.numpadShow = this.subscriptionService.getShowNumpad().subscribe(data => {
      this.numPadOptions = Object.assign({}, data);

      this.numpad = this.numPadOptions['show'];
    });
    this.isMobileCheck = this.windowService.onResize$.subscribe((data) => {
      if (data.width <= 997) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.isSinglePickChanged = this.subscriptionService.getSinglePickChanged().subscribe((data) => {
      if(data) {
        this.tempVal = '';
        this.calculateFullReturn();
      }
    });
    this.isLogged = this.subscriptionService.getIsLoggedIn().subscribe((data)=>{
      this.isLoggedIn = data;
      if(data){
        this.userBalance = this.auth.userInfoObject['balance'];
      }
    })
    this.selectOptions = [
      {
        "optionName": "Standard",
        "optionDisplayName": "Standard",
        "optionValue": "Standard"
      },
      {
        "optionName": "Banker",
        "optionDisplayName": "Banker",
        "optionValue": "Banker"
      },
    ]
    this.defaultOption = {
      "optionName": "Standard",
      "optionDisplayName": "Standard",
      "optionValue": "Standard"
    }
    this.subscriptionService.checkIfGetUserInfo().subscribe(data => {
      if(data && this.isLoggedIn){
        this.userBalance = this.auth.userInfoObject['balance'];
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
   // this.betPlaced = true;
    if (changes['pickedItems'] && changes['pickedItems'].currentValue) {
      this.betSlipSettings = this.betSlipService.getBetSlipFromLocalStorage();
      this.pickedItems.length === this.pickedItems.filter((e) => e.selected).length ? (this.allChecked = true) : (this.allChecked = false);
      this.pickedItems.map((e) => {
        e.possibleWin = e.stake * e.price;
      });
      this.error2 = this.betSlipService.getBetSlipFromLocalStorage()['isConflict'];
    }
    if (changes['betSlipSubId'] && changes['betSlipSubId'].currentValue) {
      this.betSlipSubId = changes['betSlipSubId'].currentValue;
    }
    this.calculateFullReturn();
  }

  ngAfterViewInit() {}
  ngOnDestroy() {
    this.betslipChanged = false;
    this.error4 = false;
    this.numpadShow.unsubscribe();
    this.isMobileCheck.unsubscribe();
    this.isSinglePickChanged.unsubscribe();
    this.isLogged.unsubscribe();
    this.betSlipUpdateSubscription.unsubscribe();
    this.betSlipCartChangedSmall.unsubscribe();
    this.balanceErrorSubscription.unsubscribe();
    this.blockedOrDeletedSubscription.unsubscribe();
    this.betRefSubscription.unsubscribe();
    this.betPlacedSubscription.unsubscribe();
    this.betCountSubscription.unsubscribe();
    this.checkErrorsSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.betslipChanged = false;
   // this.betPlaced = true;
    if(localStorage.getItem('betSlipPosition')){
          this.cdkDragPosition = JSON.parse(localStorage.getItem('betSlipPosition'));
    }
    if(this.auth.isLoggedIn){
      this.userBalance = this.auth.userData['balance'];
      this.isLoggedIn = true;
    }
    this.error1 = false;
    this.error2 = false;
    this.error3 = false;
    this.error4 = false;
    this.isLoading = false;
    this.tempVal = 10;
    this.betSlipSettings = this.betSlipService.getBetSlipFromLocalStorage();
    switch (this.betSlipSettings.type) {
      case 'Single':
        this.betSystem = 0;
        break;
      case 'Multi':
        this.betSystem = 1;
        break;
      case 'System':
        this.betSystem = 2;
        break;
      default:
        this.betSystem = 0;
        break;
    }
    this.openSettings = false;
    this.pickedItems.length ===
    this.pickedItems.filter((e) => e.selected).length
      ? (this.allChecked = true)
      : (this.allChecked = false);


    if(this.betSlipSettings.bankerEnabled){
      this.defaultOption = Object.assign({}, this.selectOptions.filter(e => e.optionValue === 'Banker')[0]);
    }
    if(this.pickedItems.length){
      this.checkForErrors();
      this.calculateFullReturn();
      this.betSlipService.checkBlockedOrDeletedEvents();
    }
  }

  changeSettings(what, newVal) {
    this.betSlipService.changeSetSlipObject(what, newVal);
    this.betSlipSettings = this.betSlipService.getBetSlipFromLocalStorage();
  }

  checkForConflicts(array){
    if(array.filter(e => e.isConflict).length){
      this.betSlipService.changeSetSlipObject('isConflict', true);
      return true;
    } else {
      this.betSlipService.changeSetSlipObject('isConflict', false);
      return false;
    }
  }

  changeSettingsState(e) {
    this.openSettings = e;
  }

  removeThatPick(pick) {
   // console.log(pick);
  }

  removeAllPicks() {
    this.betSlipService.removeAllFromBetSlip(this.betSlipSubId);
    this.betSlipHiddenState = false;
  }

  checkUncheckAll() {
    if (this.allChecked) {
      this.allChecked = false;
      this.pickedItems.filter((e) => (e.selected = false));
    } else {
      this.allChecked = true;
      this.pickedItems.filter((e) => (e.selected = true));
    }
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }

  valFromInput(e){
    const pattern = /[0-9\+\-\ ]/;
    if(!this.isMobile){
        setTimeout(() => {
          this.pickedItems.map((el) => {
            el.stake = parseInt(e.target.value,10).toFixed(2);
            el.possibleWin = el.stake * el.price;
            this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
            this.betSlipService.changeSetSlipObject('stake_all', parseInt(e.target.value,10).toFixed(2));
            this.tempVal = parseInt(e.target.value,10).toFixed(2);
          })
        }, 700)
    }
  }

  showNumpad() {
    if(this.isMobile){
      this.subscriptionService.setShowNumpad({
        show: true,
        index: 'all'
      })
    }
  }

  newVal(e){
    this.tempVal = e;
  }

  confirmValFromPad(e){
   this.numpad = !e;
  }

  placeBet(e){
    if(!this.isLoggedIn){
      this.subscriptionService.setShowLogin(true);
    } else {
      this.checkForErrors();
      this.betSlipService.checkUserBalance();

      if(!this.error1 && !this.error3 && !this.error4 && !this.maxStakeError && !this.minStakeError){
        console.log("%cPLACING BET...", "color:red;font-weight:bold");
        this.websocket.sendMessage({
          "command": "unsubscribe",
          "params": {
            "subid": this.betSlipSubId
          }
        });
        this.isLoading = true;
        this.betSlipService.placeBet(this.pickedItems, this.betSlipSettings.isConflict);
      //   setTimeout(() =>{
      //     this.betPlaced = true;
      //     this.isLoading = false;
      //   }, 5000)
        if(this.betPlaced){
          this.isLoading = false;
        }
      }
    }
  }


  checkStakeErr() {
    this.betSlipSettings = Object.assign({}, this.betSlipService.getBetSlipFromLocalStorage());
    this.betSlipSettings.stake_all > 10000 ? this.maxStakeError = true : this.maxStakeError = false;
    this.betSlipSettings.stake_all < 1 ? this.minStakeError = true : this.minStakeError = false;
    this.pickedItems.map(f => {
      if (Number(f.stake) === 0 || f.stake === 'NaN' || f.stake === '') {
        f.stakeError = true;
      } else {
        f.stakeError = false;
      }
    });
    this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
  }

  checkForErrors() {
    if (this.pickedItems.filter(e => Number(e.stake) === 0 || e.stake === 'NaN' || e.stake === '').length < this.pickedItems.length) {
      this.error1 = false;
      this.checkStakeErr();
    } else {
      if (Number(this.betSlipSettings.multi_stake) && Number(this.betSlipSettings.multi_stake) > 0) {
        this.error1 = false;
        this.checkStakeErr();
      } else if (this.betSlipSettings.multiples.length && (this.betSlipSettings.multiples.filter(e => Number(e.stake) === 0 || e.stake === 'NaN' || e.stake === '').length < this.betSlipSettings.multiples.length)) {
        this.error1 = false;
        this.checkStakeErr();
      }  else if (this.betSlipSettings.system.length && (this.betSlipSettings.system.filter(e => Number(e.stake) === 0 || e.stake === 'NaN' || e.stake === '').length < this.betSlipSettings.system.length)) {
        this.error1 = false;
        this.checkStakeErr();
    } else {
        this.error1 = true;
        this.checkStakeErr();
      }
    }

  }

  showLogIn(){
    this.subscriptionService.setShowLogin(true);
  }

  changeBetslipMethod(e){
    // if(e.optionValue === 'Banker'){
    //   this.betSlipService.changeSetSlipObject('bankerEnabled', true);
    //   this.subscriptionService.triggerBetSlipChangesButDoNotSubscribeAgain(true);
    // } else {
    //   this.betSlipService.changeSetSlipObject('bankerEnabled', false);
    //   this.subscriptionService.triggerBetSlipChangesButDoNotSubscribeAgain(true);
    // }
  }

  chagedBetslip(isBetslipChanged){
    if(isBetslipChanged){
      this.checkForErrors();
    }
  }

  dragEnd(e: CdkDragEnd){
    const transform = e.source.element.nativeElement.style.transform;
    const regex = /translate3d\(\s?(?<x>[-]?\d*)px,\s?(?<y>[-]?\d*)px,\s?(?<z>[-]?\d*)px\)/;
    const values = regex.exec(transform);
    localStorage.setItem('betSlipPosition', JSON.stringify({ x: parseInt(values[1], 10), y: parseInt(values[2], 10) }));
  }

  closeBetSlipSummary(){
    this.betPlaced = false;
    this.betSlipHiddenState = false;
    this.betSlipService.removeAllFromBetSlip(this.betSlipSubId, true);
    this.betSlipService.initNewBetSlip(true);
  }

  calculateFullReturn(){
    this.totalReturn = 0;
    this.totalReturn = this.betSlipService.getBetSlipFromLocalStorage()['possible_return_single'] +
                       this.betSlipService.getBetSlipFromLocalStorage()['possible_return_multi'] +
                       this.betSlipService.getBetSlipFromLocalStorage()['possible_return_system'];
    this.betSlipService.getBetSlipFromLocalStorage().multiples.map(e =>{ this.totalReturn = this.totalReturn +  e.possible_return});
    this.totalStake = this.betSlipService.getBetSlipFromLocalStorage().stake_all;
  }

  showOrHide(element){
    if(!this.betSlipHiddenState){
      this.betSlipHiddenState = true;
      this.renderer.addClass(document.getElementsByTagName( 'html' )[0], 'betslip_open');
      if(this.betSlipService.getBetSlipFromLocalStorage().picks.length > 1){
        if(this.error2){
          this.subscriptionService.setSelectBetslipInput('single');
        } else {
          this.subscriptionService.setSelectBetslipInput('multi');
        }
      } else if(this.betSlipService.getBetSlipFromLocalStorage().picks.length === 1){
        this.subscriptionService.setSelectBetslipInput('single');
      }
    } else {
      this.betSlipHiddenState = false;
      this.renderer.removeClass(document.getElementsByTagName( 'html' )[0], 'betslip_open');
    }
  }

  hideBetslip(){
    if(!this.betPlaced) {
      this.betSlipHiddenState = false;
      this.renderer.removeClass(document.getElementsByTagName( 'html' )[0], 'betslip_open');
    }

  }

  goToDepositPage(){
    this.router.navigate(['dashboard'], {queryParams: {'tab': 'deposit'}});
  }

  acceptOddChanges(){
    if(this.error4){
      this.pickedItems = [...this.pickedItems.filter(e => !e.isBlocked)];
      this.betSlipService.changeSetSlipObject('picks', this.pickedItems);
    }
    this.betslipChanged = false;


  }

}
