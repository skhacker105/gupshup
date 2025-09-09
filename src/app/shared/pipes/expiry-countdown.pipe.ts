// countdown.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'expiryCountdown',
  pure: true
})
export class ExpiryCountdownPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) { }

  transform(value: Date | string | null): string {
    if (!value) return '';

    const expiryDate = new Date(value);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Expired';
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Show countdown if <= 7 days
    if (days <= 7) {
      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`;
      } else if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''} left`;
      } else if (minutes > 0) {
        return `${minutes} min${minutes > 1 ? 's' : ''} left`;
      } else {
        return `${seconds} sec${seconds > 1 ? 's' : ''} left`;
      }
    }

    // If more than 7 days → show date format
    return this.datePipe.transform(expiryDate, 'shortDate') || '';
  }
}
