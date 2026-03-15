import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TradeSummaryComponent } from './trade-summary';
import { SharedModule } from '../../../../shared/shared.module';

describe('TradeSummaryComponent', () => {
  let component: TradeSummaryComponent;
  let fixture: ComponentFixture<TradeSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        TradeSummaryComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
