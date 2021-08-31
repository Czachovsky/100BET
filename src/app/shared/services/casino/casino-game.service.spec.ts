import { TestBed } from '@angular/core/testing';

import { CasinoGameService } from './casino-game.service';

describe('CasinoGameService', () => {
  let service: CasinoGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CasinoGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
