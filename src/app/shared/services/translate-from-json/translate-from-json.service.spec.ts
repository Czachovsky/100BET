import { TestBed } from '@angular/core/testing';

import { TranslateFromJsonService } from './translate-from-json.service';

describe('TranslateFromJsonService', () => {
  let service: TranslateFromJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslateFromJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
