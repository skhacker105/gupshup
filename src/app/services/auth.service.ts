import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://backend-url'; // Replace with actual
    private tokenKey = 'authToken';

    constructor(private http: HttpClient) { }

    login(credentials: { phoneOrEmail: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => localStorage.setItem(this.tokenKey, res.token))
        );
    }

    signup(user: User): Observable<any> {
        return this.http.post(`${this.apiUrl}/signup`, user);
    }

    forgotPassword(identifier: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { identifier });
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