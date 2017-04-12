import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpartyComponent } from './subparty.component';

describe('SubpartyComponent', () => {
  let component: SubpartyComponent;
  let fixture: ComponentFixture<SubpartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubpartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubpartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
