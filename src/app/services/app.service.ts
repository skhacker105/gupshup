import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../shared/components/confirm-delete-dialog/confirm-delete-dialog.component';
import { take } from 'rxjs';
import { ConfirmDialogData } from '../models';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    isMobile = false;
    isTablet = false;
    isDesktop = true;

    constructor(private breakpointObserver: BreakpointObserver, private dialog: MatDialog) {
        this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
            const breakAndFind = (breakPoints: { [key: string]: boolean }, targetScreenSize: string) => {
                const targetScreenSizes = targetScreenSize.split(', ');
                return targetScreenSizes.some(ts => breakPoints[ts] === true)
            }
            this.isMobile = result.matches && breakAndFind(result.breakpoints, Breakpoints.Handset);
            this.isTablet = result.matches && breakAndFind(result.breakpoints, Breakpoints.Tablet);
            this.isDesktop = result.matches && breakAndFind(result.breakpoints, Breakpoints.Web);
        });
    }

    confirmForDelete(itemName: string) {
        const dialogConfig = {
            width: this.isMobile ? '90%' : this.isTablet ? '70%' : '400px',
            data: {
                itemName,
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isDesktop: this.isDesktop
            }
        };

        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, dialogConfig);
        return new Promise<boolean>((resolve => {
            dialogRef.afterClosed().pipe(take(1))
            .subscribe({
                next: (response: boolean) => resolve(response ?? false)
            });
        }));
    }

    confirmForBackup(message: string, subInfo?: string) {
        const dialogConfig = {
            width: this.isMobile ? '90%' : this.isTablet ? '70%' : '400px',
            data: {
                message,
                subInfo,
                isMobile: this.isMobile,
                isTablet: this.isTablet,
                isDesktop: this.isDesktop
            } as ConfirmDialogData
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        return new Promise<boolean>((resolve => {
            dialogRef.afterClosed().pipe(take(1))
            .subscribe({
                next: (response: boolean) => resolve(response ?? false)
            });
        }));
    }
}