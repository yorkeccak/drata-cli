import { type Region, getBaseUrl } from './config.js';

export interface ClientOpts {
  apiKey: string;
  region: Region;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string | null;
    totalCount?: number;
  };
}

export interface RequestOpts {
  params?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  isMultipart?: boolean;
}

export class DrataClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(opts: ClientOpts) {
    this.baseUrl = getBaseUrl(opts.region);
    this.apiKey = opts.apiKey;
  }

  async request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
    const { params, body, method = 'GET', isMultipart = false } = opts;

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) url.searchParams.append(key, v);
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    let reqBody: string | FormData | undefined;
    if (body && !isMultipart) {
      headers['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: reqBody,
    });

    if (!res.ok) {
      const text = await res.text();
      let detail: string;
      try {
        const json = JSON.parse(text);
        detail = json.message ?? json.error ?? text;
      } catch {
        detail = text;
      }
      throw new Error(`${res.status} ${res.statusText}: ${detail}`);
    }

    if (res.status === 204) return undefined as T;

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as T;
  }

  // Paginate through all results using cursor-based pagination
  async *paginate<T>(path: string, opts: RequestOpts = {}): AsyncGenerator<T[]> {
    let cursor: string | undefined;
    do {
      const params = { ...opts.params, ...(cursor ? { cursor } : {}) };
      const res = await this.request<PaginatedResponse<T>>(path, { ...opts, params });
      if (res.data?.length) yield res.data;
      cursor = res.pagination?.cursor ?? undefined;
    } while (cursor);
  }

  async fetchAll<T>(path: string, opts: RequestOpts = {}): Promise<T[]> {
    const all: T[] = [];
    for await (const page of this.paginate<T>(path, opts)) {
      all.push(...page);
    }
    return all;
  }

  // Convenience methods
  async get<T>(path: string, params?: RequestOpts['params']): Promise<T> {
    return this.request<T>(path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  async del<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  // Validate API key by fetching company info
  async validateKey(): Promise<boolean> {
    try {
      await this.get('/company');
      return true;
    } catch {
      return false;
    }
  }
}

export function createClient(apiKey: string, region: Region): DrataClient {
  return new DrataClient({ apiKey, region });
}
