import {NgModule} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {LeftColumnNavComponent} from '../../components/left-column-nav/left-column-nav.component';
import {BetColumnComponent} from "../../components/bet-column/bet-column.component";
import {BetSlipComponent} from "../../components/bet-column/bet-slip/bet-slip.component";
import {MyBetsComponent} from "../../components/my-bets/my-bets.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {BetSlipSingleComponent} from "../../components/bet-column/bet-slip/bet-slip-single/bet-slip-single.component";
import {BetSlipMultiComponent} from "../../components/bet-column/bet-slip/bet-slip-multi/bet-slip-multi.component";
import {BetSlipSystemComponent} from "../../components/bet-column/bet-slip/bet-slip-system/bet-slip-system.component";
import {OhbSelectComponent} from '../../usability/ohb-select/ohb-select.component'
import {StakeNumpadComponent} from "../../components/bet-column/stake-numpad/stake-numpad.component";
import {BetSlipSettingsComponent} from "../../components/bet-column/bet-slip-settings/bet-slip-settings.component";
import {BreadcrumbsComponent} from "../../components/breadcrumbs/breadcrumbs.component";
import {RouterModule} from "@angular/router";
import {BreadcrumbNamePipe} from "../../shared/pipes/breadcrumb-name.pipe";
import {ClickOutsideModule} from "ng4-click-outside";
import { OhbMenuTabComponent } from "../../usability/ohb-menu-tab/ohb-menu-tab.component";
import { MyBetsAllComponent } from "../../components/my-bets/my-bets-all/my-bets-all.component";
import { MyBetsCashOutComponent } from "../../components/my-bets/my-bets-cash-out/my-bets-cash-out.component";
import { MyBetsLiveNowComponent } from "../../components/my-bets/my-bets-live-now/my-bets-live-now.component";
import { MyBetsSettledComponent } from "../../components/my-bets/my-bets-settled/my-bets-settled.component";
import { MyBetsUnsettledComponent } from "../../components/my-bets/my-bets-unsettled/my-bets-unsettled.component";
import { AutoCashOutComponent } from "../../components/my-bets/my-bets-all/auto-cash-out/auto-cash-out.component";
import { PartialCashOutComponent } from "../../components/my-bets/my-bets-all/partial-cash-out/partial-cash-out.component";
import {MatSliderModule} from '@angular/material/slider';
import { OhbModalComponent } from "../../usability/ohb-modal/ohb-modal.component";
import { LoginComponent } from "../../components/login/login.component";
import { RegisterComponent } from "../../components/register/register.component";
import { NavigationComponent } from "../../components/navigation/navigation.component";
import { PhoneVerificationComponent } from "../../components/login/phone-verification/phone-verification.component";
import { EmailVerificationComponent } from "../../components/login/email-verification/email-verification.component"
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppModule } from '../../app.module';
import { SearchComponent } from '../../components/search/search.component';
import { AdvanceSearchComponent } from '../../components/advance-search/advance-search.component'
import { MarketsComponent } from '../../components/markets/markets.component';
import { TransitionGroupComponent } from '../../shared/components/transition-group.component';
import { TransitionGroupItemDirective } from '../../shared/directives/transition-group-item.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormatNumberPipe } from '../../shared/pipes/format-number.pipe';
import { FormatBasePipe } from '../../shared/pipes/format-base.pipe';
import { BetslipDoublesComponent } from '../../components/bet-column/bet-slip/bet-slip-single/betslip-doubles/betslip-doubles.component';
import { BetslipSinglesComponent } from '../../components/bet-column/bet-slip/bet-slip-single/betslip-singles/betslip-singles.component';
import { BetSlipMultipleComponent } from '../../components/bet-column/bet-slip/bet-slip-single/bet-slip-multiple/bet-slip-multiple.component';
import { LiveEventComponent } from '../home/live-event/live-event.component'
import { BetHistoryComponent } from '../../components/bet-history/bet-history.component';
import { BetHistoryCashOutComponent } from '../../components/bet-history/bet-history-cash-out/bet-history-cash-out.component';
import { CashOutSettingsComponent } from '../../components/bet-history/cash-out-settings/cash-out-settings.component';
import { BetHistoryLiveNowComponent } from '../../components/bet-history/bet-history-live-now/bet-history-live-now.component';
import { BetHistoryUnsettledComponent } from '../../components/bet-history/bet-history-unsettled/bet-history-unsettled.component';
import { BetHistorySettledComponent } from '../../components/bet-history/bet-history-settled/bet-history-settled.component';
import { BetHistoryAllComponent } from '../../components/bet-history/bet-history-all/bet-history-all.component';
import { SportsOddsListingComponent } from '../../components/sports-odds-listing/sports-odds-listing.component';
import { BetslipOthersComponent } from '../../components/bet-column/bet-slip/bet-slip-single/betslip-others/betslip-others.component';
import { NumpadSmallComponent } from '../../components/bet-column/numpad-small/numpad-small.component';
import { CashoutHistoryComponent } from '../../components/bet-history/cashout-history/cashout-history.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FooterComponent } from '../../components/footer/footer.component';
import { SidenavMobileComponent } from '../../components/sidenav-mobile/sidenav-mobile.component';
import { PromotionSportsComponent } from '../../components/promotion-sports/promotion-sports.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatDialogModule } from '@angular/material/dialog';
import { SafePipe } from '../../shared/pipes/safe.pipe';
import { OddsFormatPipe } from '../../shared/pipes/odds-format.pipe';
import { PasswordRecoverComponent } from '../../components/login/password-recover/password-recover.component';
import { PhoneRecoverComponent } from '../../components/login/password-recover/phone-recover/phone-recover.component';
import { MailRecoverComponent } from '../../components/login/password-recover/mail-recover/mail-recover.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { RecaptchaModule } from 'ng-recaptcha';
import { CustomDatePipe } from '../../shared/pipes/custom-date.pipe';
import { CanLoginNowComponent } from '../../components/login/password-recover/can-login-now/can-login-now.component';


@NgModule({
  declarations: [
    NavigationComponent,
    LeftColumnNavComponent,
    BetColumnComponent,
    FormatNumberPipe,
    FormatBasePipe,
    BetSlipComponent,
    MyBetsComponent,
    BetSlipSingleComponent,
    BetSlipMultiComponent,
    BetSlipSystemComponent,
    OhbSelectComponent,
    StakeNumpadComponent,
    BetSlipSettingsComponent,
    BreadcrumbsComponent,
    BreadcrumbNamePipe,
    OhbMenuTabComponent,
    MyBetsAllComponent,
    MyBetsCashOutComponent,
    MyBetsLiveNowComponent,
    MyBetsSettledComponent,
    MyBetsUnsettledComponent,
    AutoCashOutComponent,
    PartialCashOutComponent,
    OhbModalComponent,
    LoginComponent,
    RegisterComponent,
    NavigationComponent,
    SidenavMobileComponent,
    PhoneVerificationComponent,
    EmailVerificationComponent,
    TransitionGroupComponent,
    TransitionGroupItemDirective,
    SearchComponent,
    AdvanceSearchComponent,
    BetslipDoublesComponent,
    BetslipSinglesComponent,
    BetSlipMultipleComponent,
    LiveEventComponent,
    SportsOddsListingComponent,
    MarketsComponent,
    BetHistoryComponent,
    BetHistoryCashOutComponent,
    CashOutSettingsComponent,
    BetHistoryLiveNowComponent,
    BetHistoryUnsettledComponent,
    BetHistorySettledComponent,
    BetHistoryAllComponent,
    BetslipOthersComponent,
    NumpadSmallComponent,
    CashoutHistoryComponent,
    FooterComponent,
    PromotionSportsComponent,
    SafePipe,
    OddsFormatPipe,
    PasswordRecoverComponent,
    PhoneRecoverComponent,
    MailRecoverComponent,
    CustomDatePipe,
    CanLoginNowComponent
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule,
    ClickOutsideModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    NgxIntlTelInputModule,
    CarouselModule,
    DragScrollModule,
    MatDialogModule,
    RecaptchaModule
  ],
  exports: [
    PerfectScrollbarModule,
    SidenavMobileComponent,
    LeftColumnNavComponent,
    TransitionGroupItemDirective,
    TransitionGroupComponent,
    BetColumnComponent,
    BetSlipComponent,
    MyBetsComponent,
    OhbSelectComponent,
    StakeNumpadComponent,
    BetSlipSettingsComponent,
    BreadcrumbsComponent,
    OhbMenuTabComponent,
    OhbModalComponent,
    LoginComponent,
    RegisterComponent,
    NavigationComponent,
    FormatNumberPipe,
    FormatBasePipe,
    FormsModule,
    ReactiveFormsModule,
    PhoneVerificationComponent,
    EmailVerificationComponent,
    SearchComponent,
    AdvanceSearchComponent,
    DragDropModule,
    BetslipDoublesComponent,
    BetslipSinglesComponent,
    LiveEventComponent,
    BetSlipMultipleComponent,
    MarketsComponent,
    BetHistoryComponent,
    BetHistoryCashOutComponent,
    CashOutSettingsComponent,
    SportsOddsListingComponent,
    BetHistoryLiveNowComponent,
    BetHistoryUnsettledComponent,
    BetHistorySettledComponent,
    BetHistoryAllComponent,
    BetslipOthersComponent,
    NumpadSmallComponent,
    CashoutHistoryComponent,
    FooterComponent,
    PromotionSportsComponent,
    SafePipe,
    OddsFormatPipe,
    PasswordRecoverComponent,
    PhoneRecoverComponent,
    MailRecoverComponent,
    DragScrollModule,
    CustomDatePipe,
    CanLoginNowComponent
  ],
  providers: [DecimalPipe, FormatBasePipe]
})
export class SharedModule {

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'zh']);
    let browserLang = localStorage.getItem('pageLanguage');
    if (browserLang === null) {
      browserLang = translate.getBrowserLang();
      if (browserLang !== 'zh') {
        browserLang = 'en';
      }
    }
    translate.use(browserLang);

  }

}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
