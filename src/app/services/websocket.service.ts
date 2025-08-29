import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket$: WebSocketSubject<any>;
    public messages$ = new Subject<any>();

    constructor() {
        this.socket$ = new WebSocketSubject('ws://localhost:3000'); // From provided code
        this.socket$.subscribe(
            msg => this.messages$.next(msg),
            err => console.error(err)
        );
    }

    send(msg: any) {
        this.socket$.next(msg);
    }
}