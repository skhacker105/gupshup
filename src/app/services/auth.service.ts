import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUsers = environment.storageAccountService + 'users';
    private tokenKey = 'authToken';

    constructor(private http: HttpClient) { }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUsers}/login`, credentials).pipe(
            tap((res: any) => localStorage.setItem(this.tokenKey, res.token))
        );
    }

    signup(user: User): Observable<any> {
        return this.http.post(`${this.apiUsers}/register`, user);
    }

    forgotPassword(identifier: string): Observable<any> {
        return this.http.post(`${this.apiUsers}/forgot-password`, { identifier });
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}