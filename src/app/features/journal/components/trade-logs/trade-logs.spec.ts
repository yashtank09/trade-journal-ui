import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeLogs } from './trade-logs';

describe('TradeLogs', () => {
  let component: TradeLogs;
  let fixture: ComponentFixture<TradeLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
