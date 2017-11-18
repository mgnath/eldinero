import { TestBed, inject } from '@angular/core/testing';

import { RobinhoodService } from './stock.service';

describe('StockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RobinhoodService]
    });
  });

  it('should be created', inject([RobinhoodService], (service: RobinhoodService) => {
    expect(service).toBeTruthy();
  }));
});
