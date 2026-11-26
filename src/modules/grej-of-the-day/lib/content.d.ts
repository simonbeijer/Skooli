// Typer för content.js (ren JS, från den fristående grej-of-the-day-appen).
type Log = (line: string) => void;

export declare const STYLES: Record<string, unknown>;
export declare function generateContent(topic: string, notes: string | undefined, log?: Log, signal?: AbortSignal): Promise<unknown>;
export declare function generateMore(body: Record<string, unknown>, log?: Log, signal?: AbortSignal): Promise<unknown>;
