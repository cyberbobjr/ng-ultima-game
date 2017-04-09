import { TestBed, inject } from '@angular/core/testing';

import { TilesLoaderService } from './tiles.service';

describe('TilesLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TilesLoaderService]
    });
  });

  it('should ...', inject([TilesLoaderService], (service: TilesLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
