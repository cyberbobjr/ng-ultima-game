import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartscreenComponent } from './startscreen.component';

describe('StartscreenComponent', () => {
  let component: StartscreenComponent;
  let fixture: ComponentFixture<StartscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartscreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
