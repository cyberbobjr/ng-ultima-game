import { TestBed, inject } from '@angular/core/testing';

import { EntitiesService } from './entities.service';

describe('EntitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntitiesService]
    });
  });

  it('should ...', inject([EntitiesService], (service: EntitiesService) => {
    expect(service).toBeTruthy();
  }));
});
