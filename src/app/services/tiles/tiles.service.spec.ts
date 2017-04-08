import { TestBed, inject } from '@angular/core/testing';

import { TilesService } from './tiles.service';

describe('TilesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TilesService]
    });
  });

  it('should ...', inject([TilesService], (service: TilesService) => {
    expect(service).toBeTruthy();
  }));
});
