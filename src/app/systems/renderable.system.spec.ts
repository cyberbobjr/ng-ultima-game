import { TestBed, inject } from '@angular/core/testing';

import { RenderableSystem } from './renderable.system';

describe('RenderableSystem', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RenderableSystem]
    });
  });

  it('should ...', inject([RenderableSystem], (service: RenderableSystem) => {
    expect(service).toBeTruthy();
  }));
});
