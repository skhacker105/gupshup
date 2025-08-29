import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Cropper from 'cropperjs';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { file: File },
    private dialogRef: MatDialogRef<MediaEditorComponent>
  ) {
    this.file = data.file;
    this.fileUrl = URL.createObjectURL(this.file);
    this.isImage = this.file.type.startsWith('image/');
    this.isVideo = this.file.type.startsWith('video/');
  }

  ngOnInit(): void {
    if (this.isImage && this.imageElement) {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 1, // Supported in cropperjs >=1.5.12
        viewMode: 1,
        autoCropArea: 0.8,
        scalable: true,
        zoomable: true,
        movable: true
      });
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
        }
      }, this.file.type);
    }
  }

  clipVideo(): void {
    const video = this.videoElement?.nativeElement as HTMLVideoElement;
    if (video) {
      video.volume = this.volume;
      console.warn('Video clipping not fully implemented; passing volume-adjusted file.');
    }
  }

  save(): void {
    this.dialogRef.close(this.file);
  }
}