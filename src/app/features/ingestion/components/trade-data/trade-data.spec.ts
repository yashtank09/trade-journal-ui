import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeData } from './trade-data';

describe('TradeData', () => {
  let component: TradeData;
  let fixture: ComponentFixture<TradeData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
