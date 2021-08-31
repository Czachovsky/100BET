import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubscriptionsService } from '../../../shared/services/subscriptions/subscriptions.service';
import { WebsocketService } from '../../../shared/services/websocket/websocket.service';
import * as _ from 'lodash';
import { HttpService } from '../../../shared/services/http/http.service';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'workspace-add-bank-modal',
  templateUrl: './add-bank-modal.component.html',
  styleUrls: ['./add-bank-modal.component.scss']
})
export class AddBankModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userInfo;
  @Input() bankList = [];
  defaoultOption = {
    optionName: 'Select Bank',
    optionDisplayName: 'selectBank',
    optionValue: ''
  };
  options = [this.defaoultOption];
  form: FormGroup;
  isSubmit: boolean;
  message = '';
  selectedBank = '';
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Output() hideForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() formData: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addedCard: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(
    private websocket: WebsocketService,
    private subscripton: SubscriptionsService) {
    }

  ngOnInit(): void {
    this.form = new FormGroup({
      bank_name: new FormControl(null, Validators.required),
      account_number: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{13,19}$/)]),
      province: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      bank_branch: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  selectName(e) {
    this.selectedBank = e.optionDisplayName;
    this.form.patchValue({bank_name: e.optionValue});
  }

  updateUser() {
    this.isSubmit = true;
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      const password = formData.password;
      const acc = formData.account_number;
      delete formData['password'];
      delete formData['account_number'];
      this.websocket.sendMessage({
        "command": "update_user",
        "params": {
          "user_info": {
            "password": password,
            "iban": acc,
            "address": _.values(formData).join('/')
          }
        },
        "rid": "UPDATE USER"
      });

      this.websocket.getData().subscribe(data => {
        if (data.data && data.data !== 'null' && data.data !== 'undefined') {
          if (data.rid === `UPDATE USER`) {
            if (data.data.result < 0) {
              this.message = data.data.details;
            } else {
              this.addedCard.emit({
                bankName: this.selectedBank,
                accNo: this.form.value.account_number
              });
              this.closeModal();
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.bankList && changes.bankList.currentValue) {
      this.options = [...this.options, ...changes.bankList.currentValue];
    }
  }

  closeModal() {
    this.hideForm.emit(true);
    this.subscripton.setOpenModal(false);
    this.subscripton.setCloseModal(true);
  }

}
