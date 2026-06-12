import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RNVBabelioFullComponent } from './rnvbabeliofull.component';

describe('RNVBabelioFullComponent', () => {
  let component: RNVBabelioFullComponent;
  let fixture: ComponentFixture<RNVBabelioFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RNVBabelioFullComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RNVBabelioFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
