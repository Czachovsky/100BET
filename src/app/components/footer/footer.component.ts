import { Component, OnInit } from '@angular/core';
import { LanguageService } from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionsService } from "../../shared/services/subscriptions/subscriptions.service";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'workspace-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentTimeZone: string;
  currentLanguage: any;
  languages = [
    {
      displayer: "English",
      flag: 'assets/images/icons/flags/flag.png',
      select: 'en'
    },
    {
      displayer: "中文",
      flag: 'assets/images/icons/flags/flag_china.png',
      select: 'zh'
    }
  ]
  langChanger: Boolean;
  loadingChat: Boolean = false;

  constructor(private translate: TranslateService, private subscriptions: SubscriptionsService) {
    this.currentLanguage = this.languages.filter((e) => e.select === localStorage.getItem('pageLanguage'))[0];
  }

  ngOnInit(): void {
    setInterval(() => {
      this.currentTimeZone = this.currentTime();
    }, 1);
  }

  changeLang(e) {
    const language = e.select;
    localStorage.setItem('pageLanguage', language);
    localStorage.setItem('pageLanguageByUser', 'true');
    this.translate.use(language);
    this.subscriptions.setLanguage(language);
    this.currentLanguage = e;
    this.langChanger = false;
    setTimeout(() => {
      window.location.reload();
    }, 100)
  }

  currentTime() {
    const d = new Date(),
      h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
      m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    return h + ':' + m + ' ' + d.toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
  }

  loadZendeskChat(callback) {
    const zdscript = document.createElement('script');
    zdscript.setAttribute('id', 'ze-snippet');
    zdscript.src = `https://static.zdassets.com/ekr/snippet.js?key=${environment.settings.zdscript_key}`;
    (document.getElementsByTagName('body')[0]).appendChild(zdscript);

    const zdonload = setInterval(() => {
      if (typeof window['zE'] !== "undefined" && typeof window['zE'].activate !== "undefined") {
        clearInterval(zdonload);
        callback();
      }
    }, 50, null)
  };

  loadChat() {
    this.loadingChat = true;
    this.loadZendeskChat(() => {
      window.setTimeout(() => {
        window['zE'].activate();
        this.loadingChat = false;
      }, 1000);
    });
  }

}
