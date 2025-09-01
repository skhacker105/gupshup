import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFolderIconComponent } from './document-folder-icon.component';

describe('DocumentFolderIconComponent', () => {
  let component: DocumentFolderIconComponent;
  let fixture: ComponentFixture<DocumentFolderIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentFolderIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentFolderIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
