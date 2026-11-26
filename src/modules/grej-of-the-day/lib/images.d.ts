// Typer för images.js (ren JS, från den fristående grej-of-the-day-appen).
export interface ImageSource {
  id: string;
  label: string;
  enabled: boolean;
  key: string | null;
}

export interface SourceResult {
  source: string;
  label: string;
  error: string | null;
  images: Array<Record<string, unknown>>;
}

export declare function listSources(): ImageSource[];
export declare function searchImages(query: string, only?: string[]): Promise<SourceResult[]>;
