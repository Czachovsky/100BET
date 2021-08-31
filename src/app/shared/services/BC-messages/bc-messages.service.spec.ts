import { TestBed } from '@angular/core/testing';

import { BCMessagesService } from './bc-messages.service';

describe('BCMessagesService', () => {
  let service: BCMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BCMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
