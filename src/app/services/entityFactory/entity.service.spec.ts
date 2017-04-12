import { TestBed, inject } from '@angular/core/testing';

import { EntityFactoryService } from './entityFactory.service';

describe('EntityFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityFactoryService]
    });
  });

  it('should ...', inject([EntityFactoryService], (service: EntityFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
