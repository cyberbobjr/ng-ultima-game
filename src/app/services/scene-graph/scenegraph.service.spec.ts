import { TestBed, inject } from '@angular/core/testing';

import { ScenegraphService } from './scenegraph.service';

describe('ScenegraphService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScenegraphService]
    });
  });

  it('should ...', inject([ScenegraphService], (service: ScenegraphService) => {
    expect(service).toBeTruthy();
  }));
});
