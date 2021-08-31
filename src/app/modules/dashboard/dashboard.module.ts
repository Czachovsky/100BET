import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule, Routes } from "@angular/router";
import { HttpLoaderFactory, SharedModule } from "../shared/shared.module";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { AccountDetailsComponent } from './account-details/account-details.component';
import { BettingRecordsComponent } from './betting-records/betting-records.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { TransactionRecordsComponent } from './transaction-records/transaction-records.component';
import { ChangePasswordComponent } from './account-details/change-password/change-password.component';
import { MessagesComponent } from './messages/messages.component';
import { PasswordFormComponent } from './account-details/password-form/password-form.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawalComponent } from './withdrawal/withdrawal.component';
import { DepositNumpadComponent } from './deposit/deposit-numpad/deposit-numpad.component';
import { ClickOutsideModule } from 'ng4-click-outside';
import { PromotionsComponent } from './promotions/promotions.component';
import { AllPromotionComponent } from './promotions/all-promotion/all-promotion.component';
import { MyBonusComponent } from './promotions/my-bonus/my-bonus.component';
import { AddBankModalComponent } from './add-bank-modal/add-bank-modal.component';
import { SortsbookComponent } from './promotions/sortsbook/sortsbook.component';
import { CasinoComponent } from './promotions/casino/casino.component';

const routes: Routes = [
  { path: '', component: DashboardComponent}
];

@NgModule({
  declarations: [WithdrawalComponent, DashboardComponent, AccountDetailsComponent, BettingRecordsComponent, TransactionRecordsComponent, ChangePasswordComponent, MessagesComponent, PasswordFormComponent, DepositComponent, DepositNumpadComponent, PromotionsComponent, AllPromotionComponent, MyBonusComponent, AddBankModalComponent, SortsbookComponent, CasinoComponent],
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ClickOutsideModule
  ]
})
export class DashboardModule { }
