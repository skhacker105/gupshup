import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../../services';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const token = this.authService.getToken();
        if (token) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(req).pipe(
            catchError(error => {
                if (error.status === 401) {
                    this.authService.logout();
                    this.router.navigateByUrl('/auth/login')
                }
                throw error;
            })
        );
    }
}