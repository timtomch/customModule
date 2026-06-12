import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RNVBabelioComponent } from './rnvbabelio.component';

describe('RNVBabelioComponent', () => {
  let component: RNVBabelioComponent;
  let fixture: ComponentFixture<RNVBabelioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RNVBabelioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RNVBabelioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
