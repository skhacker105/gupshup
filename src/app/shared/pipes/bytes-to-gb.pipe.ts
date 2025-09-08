import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesToGB'
})
export class BytesToGBPipe implements PipeTransform {
  transform(bytes?: number): string {
    if (!bytes) return '0';
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2);
  }
}