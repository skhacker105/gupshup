export function utf8(str: string) { return new TextEncoder().encode(str); }

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function toB64(uint8: Uint8Array): string {
    let output = '';
    const len = uint8.length;
    for (let i = 0; i < len; i += 3) {
      const byte1 = uint8[i];
      const byte2 = uint8[i + 1] || 0;
      const byte3 = uint8[i + 2] || 0;
  
      // Encode first 6 bits of byte1
      output += BASE64_CHARS.charAt(byte1 >> 2);
      // Encode last 2 bits of byte1 + first 4 bits of byte2
      output += BASE64_CHARS.charAt(((byte1 & 0x3) << 4) | (byte2 >> 4));
      // Encode last 4 bits of byte2 + first 2 bits of byte3
      output += BASE64_CHARS.charAt(((byte2 & 0xF) << 2) | (byte3 >> 6));
      // Encode last 6 bits of byte3
      output += BASE64_CHARS.charAt(byte3 & 0x3F);
    }
  
    // Handle padding (remove extra chars and add =)
    const mod = len % 3;
    if (mod === 1) {
      output = output.substring(0, output.length - 2) + '==';
    } else if (mod === 2) {
      output = output.substring(0, output.length - 1) + '=';
    }
  
    return output;
  }

export function fromB64(s: string): Uint8Array {
    return new Uint8Array([...atob(s)].map(c => c.charCodeAt(0)));
}

export async function importAesKey(raw: Uint8Array) {
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
export async function exportRawKey(key: CryptoKey) { return new Uint8Array(await crypto.subtle.exportKey('raw', key)); }

export async function genAesKey() {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
export async function genSigningKeyPair() {
    return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
}
export async function signBytes(privKey: CryptoKey, bytes: Uint8Array) {
    return new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, bytes));
}
export async function verifyBytes(pubKey: CryptoKey, sig: Uint8Array, bytes: Uint8Array) {
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pubKey, sig, bytes);
}
export async function importPubJwk(jwk: JsonWebKey) {
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
}
export async function importPrivJwk(jwk: JsonWebKey) {
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
}
export async function hmacKeyFromRaw(raw: Uint8Array) {
    return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
export async function hmacDigest(key: CryptoKey, bytes: Uint8Array) {
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes));
}
