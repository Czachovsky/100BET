import { AfterViewChecked, Component, Input, OnInit, Output, Renderer2, EventEmitter, Inject } from '@angular/core';
import { SubscriptionsService } from "../../shared/services/subscriptions/subscriptions.service";
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'workspace-ohb-modal',
  templateUrl: './ohb-modal.component.html',
  styleUrls: ['./ohb-modal.component.scss']
})
export class OhbModalComponent implements OnInit, AfterViewChecked {
  @Input() visible: boolean;
  @Input() modalTitle: string;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private renderer: Renderer2, private subscriptionService: SubscriptionsService, @Inject(DOCUMENT) private document: Document) {
    this.subscriptionService.getCloseModal().subscribe(closing => {
      if(closing === true){
        const element = this.document.getElementsByTagName('html');
        this.renderer.removeClass(document.body, 'modal-open');
        this.renderer.removeClass(document.body, 'pass-recover');
        this.renderer.removeClass(element[0], 'modal-open');
        this.visible = false;
        this.visibleChange.emit(this.visible);
      }
    })
  }

  ngOnInit(): void {
  }
  ngAfterViewChecked() {
    if (this.visible === true) {
      const element = this.document.getElementsByTagName('html');
      this.renderer.addClass(document.body, 'modal-open');
      this.renderer.addClass(element[0], 'modal-open');
    }
  }
  closeModal(){
    this.subscriptionService.setOpenModal(false);
    this.subscriptionService.setCloseModal(true);
  }
}
