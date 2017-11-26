import { TestBed, inject } from '@angular/core/testing';

import { RobinhoodRxService } from './robinhood-rx.service';

describe('RobinhoodRxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RobinhoodRxService]
    });
  });

  it('should be created', inject([RobinhoodRxService], (service: RobinhoodRxService) => {
    expect(service).toBeTruthy();
  }));
});
