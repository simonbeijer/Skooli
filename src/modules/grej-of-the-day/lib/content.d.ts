// Typer för content.js (ren JS, kopierad från tools/grej-of-the-day).
type Log = (line: string) => void;

export declare const STYLES: Record<string, unknown>;
export declare function generateContent(topic: string, notes: string | undefined, log?: Log, signal?: AbortSignal): Promise<unknown>;
export declare function generateMore(body: Record<string, unknown>, log?: Log, signal?: AbortSignal): Promise<unknown>;
