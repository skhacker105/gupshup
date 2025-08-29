import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private apiKey = 'YOUR_GOOGLE_TRANSLATE_API_KEY'; // Replace
    private baseUrl = 'https://translation.googleapis.com/language/translate/v2';
    private enabled = true;

    constructor(private http: HttpClient) { }

    async translate(text: string, source: string, target: string): Promise<string> {
        const res = await this.http.post(this.baseUrl, {
            q: text,
            source,
            target,
            key: this.apiKey
        }).toPromise() as any;
        return res.data.translations[0].translatedText;
    }

    isTranslationEnabled(): boolean {
        return this.enabled;
    }

    toggleTranslation(enabled: boolean) {
        this.enabled = enabled;
    }
}