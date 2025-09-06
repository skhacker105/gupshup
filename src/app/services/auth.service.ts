import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { User } from '../models/';
import { environment } from '../../environments/environment';
import { DbService } from './';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUsers = environment.storageAccountService + 'users';
    private tokenKey = 'authToken';
    private userInfoKey = 'userInfoKey';

    constructor(private http: HttpClient, private dbService: DbService) {
    }

    login(credentials: { email: string, password: string }): Observable<User> {
        return this.http.post(`${this.apiUsers}/login`, credentials).pipe(

            tap((res: any) => {
                localStorage.setItem(this.tokenKey, res.token);
            }),

            mergeMap((res: any) => {
                if (!res || !res.token) throw new Error('Login Failed');

                return this.getLoggedInUserInfoFromBackend().pipe(
                    catchError(err => {
                        this.logout();
                        throw err;
                    })
                );
            })
        );
    }

    getLoggedInUserInfoFromBackend(): Observable<User> {
        return this.http.get(`${this.apiUsers}/myInfo`).pipe(
            tap((userInfo: any) => {
                if (!userInfo) throw new Error('Login successfull but no user information found.');

                this.saveLoggedInUserInfo(userInfo);
            })
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
        localStorage.removeItem(this.userInfoKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    async saveLoggedInUserInfo(userInfo: User) {
        await this.dbService.updateUser(userInfo);
        localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
    }

    async getLoggedInUserInfo(): Promise<User | undefined> {
        const str_usr = localStorage.getItem(this.userInfoKey);
        const user = str_usr ? JSON.parse(str_usr) as User : undefined;
        if (!user) return;

        return await this.dbService.getUser(user.id)
    }
}