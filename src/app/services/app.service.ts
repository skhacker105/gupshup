import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    isMobile = false;
    isTablet = false;
    isDesktop = true;

    constructor(private breakpointObserver: BreakpointObserver) {
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
}