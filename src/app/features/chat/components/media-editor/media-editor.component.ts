// src/app/features/chat/components/media-editor/media-editor.component.ts
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Cropper from 'cropperjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Custom interface for cropperjs@2.0.1
interface CustomCropperOptions {
  aspectRatio?: number;
  viewMode?: 0 | 1 | 2 | 3;
  autoCropArea?: number;
  scalable?: boolean;
  zoomable?: boolean;
  movable?: boolean;
  cropBoxResizable?: boolean;
  cropBoxMovable?: boolean;
}

@Component({
  selector: 'app-media-editor',
  templateUrl: './media-editor.component.html',
  styleUrls: ['./media-editor.component.scss']
})
export class MediaEditorComponent implements OnInit {
  @ViewChild('imageElement') imageElement?: ElementRef;
  @ViewChild('videoElement') videoElement?: ElementRef;
  file: File;
  fileUrl: string;
  isImage: boolean;
  isVideo: boolean;
  cropper?: Cropper;
  startTime = 0;
  endTime = 0;
  volume = 1;
  videoDuration = 0;
  errorMessage = '';
  isMobile = false;
  isTablet = false;
  isDesktop = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { file: File },
    private dialogRef: MatDialogRef<MediaEditorComponent>,
    private breakpointObserver: BreakpointObserver
  ) {
    this.file = data.file;
    this.fileUrl = URL.createObjectURL(this.file);
    this.isImage = this.file.type.startsWith('image/');
    this.isVideo = this.file.type.startsWith('video/');
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isMobile = result.matches && result.breakpoints[Breakpoints.Handset];
      this.isTablet = result.matches && result.breakpoints[Breakpoints.Tablet];
      this.isDesktop = result.matches && result.breakpoints[Breakpoints.Web];
    });
  }

  ngOnInit(): void {
    if (this.isImage && this.imageElement) {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        scalable: true,
        zoomable: true,
        movable: true,
        cropBoxResizable: true,
        cropBoxMovable: true
      } as CustomCropperOptions);
    }
    if (this.isVideo && this.videoElement) {
      const video = this.videoElement.nativeElement as HTMLVideoElement;
      video.onloadedmetadata = () => {
        this.videoDuration = video.duration;
        this.endTime = this.videoDuration;
      };
    }
  }

  cropImage(): void {
    if (this.cropper) {
      this.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          this.file = new File([blob], this.file.name, { type: this.file.type });
        } else {
          this.errorMessage = 'Failed to crop image.';
        }
      }, this.file.type);
    }
  }

  clipVideo(): void {
    const video = this.videoElement?.nativeElement as HTMLVideoElement;
    if (video) {
      if (this.startTime >= this.endTime || this.endTime > this.videoDuration || this.startTime < 0) {
        this.errorMessage = 'Invalid start or end time.';
        return;
      }
      video.volume = this.volume;
      console.warn('Video clipping not fully implemented; passing volume-adjusted file.');
    }
  }

  save(): void {
    if (this.errorMessage) return;
    this.dialogRef.close(this.file);
  }
}