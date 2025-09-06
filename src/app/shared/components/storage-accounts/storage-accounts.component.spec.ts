import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageAccountsComponent } from './storage-accounts.component';

describe('StorageAccountsComponent', () => {
  let component: StorageAccountsComponent;
  let fixture: ComponentFixture<StorageAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StorageAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
