import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirationSettingsComponent } from './expiration-settings.component';

describe('ExpirationSettingsComponent', () => {
  let component: ExpirationSettingsComponent;
  let fixture: ComponentFixture<ExpirationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpirationSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpirationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
