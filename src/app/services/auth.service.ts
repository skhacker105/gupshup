import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';
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
                    tap(userInfo => {
                        this.dbService.initializeDB(userInfo);
                    }),
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

                this.saveLoggedInUserInfo(userInfo, true);
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
        this.dbService.deInitializeDB();
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    async saveLoggedInUserInfo(userInfo: User, fromDB = false) {
        let savedUser = userInfo;
        if (!fromDB) {
            savedUser = await new Promise((resolve, reject) => {
                this.http.put<User>(`${this.apiUsers}/update`, userInfo)
                .pipe(take(1), catchError((err) => {
                    reject(err);
                    return of(undefined);
                }))
                .subscribe(resUser => resUser ? resolve(resUser) : undefined)
            });
        }

        await this.dbService.updateUser(savedUser);
        localStorage.setItem(this.userInfoKey, JSON.stringify(savedUser));
    }

    async getLoggedInUserInfo(): Promise<User | undefined> {
        const str_usr = localStorage.getItem(this.userInfoKey);
        const user = str_usr ? JSON.parse(str_usr) as User : undefined;
        if (!user) return;

        return await this.dbService.getUser(user.id)
    }
}