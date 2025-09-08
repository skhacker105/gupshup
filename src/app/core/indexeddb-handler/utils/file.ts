export async function fileToString(file: File): Promise<string> {
    const b = await file.arrayBuffer();
    const bytes = new Uint8Array(b);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function stringToFile(str: string, type: string) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes.buffer], { type });
}