import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeFluixComponent } from './three-fluix.component';

describe('ThreeFluixComponent', () => {
  let component: ThreeFluixComponent;
  let fixture: ComponentFixture<ThreeFluixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreeFluixComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeFluixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
