import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from '@ngx-translate/core';
import * as toastr from 'toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  toastr: any = toastr
  constructor(
    private translate: TranslateService,
  ) {
    this.toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
  }

  

  checkError(message: any) {
    let code: any;
    if (message && message.data) {
      if(message.data.result){
        code = message.data.result > 0 ? message.data.result: -message.data.result;
        console.log("==", message, code);
        if (this.translate.instant(`errors.${code}`).message) {
          this.errorPupup(this.translate.instant(`errors.${code}`).message, "Something wrong...");
        }
      }
      else if(message.data.status){
        code = message.data.status > 0 ? message.data.status: -message.data.status;;
        console.log("==", message, code);
        if (this.translate.instant(`errors.${code}`).message) {
          this.errorPupup(this.translate.instant(`errors.${code}`).message, "Something wrong...");
        }
      }
    }
  }

  errorPupup(message: any, title: any) {
    this.toastr.error(message, title);
  }
}
