import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableRowComponent } from './selectable-row.component';

describe('SelectableRowComponent', () => {
  let component: SelectableRowComponent;
  let fixture: ComponentFixture<SelectableRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectableRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
