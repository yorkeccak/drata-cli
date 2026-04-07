import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export type Region = 'us' | 'eu' | 'apac';

export interface Profile {
  api_key: string;
  region: Region;
}

interface Credentials {
  active_profile: string;
  profiles: Record<string, Profile>;
}

const REGION_URLS: Record<Region, string> = {
  us: 'https://public-api.drata.com/public/v2',
  eu: 'https://public-api.eu.drata.com/public/v2',
  apac: 'https://public-api.apac.drata.com/public/v2',
};

export function getBaseUrl(region: Region): string {
  return REGION_URLS[region];
}

function configDir(): string {
  if (process.env.XDG_CONFIG_HOME) return join(process.env.XDG_CONFIG_HOME, 'drata');
  if (process.platform === 'win32') return join(process.env.APPDATA ?? homedir(), 'drata');
  return join(homedir(), '.config', 'drata');
}

function credentialsPath(): string {
  return join(configDir(), 'credentials.json');
}

function readCredentials(): Credentials {
  const path = credentialsPath();
  if (!existsSync(path)) {
    return { active_profile: 'default', profiles: {} };
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    // Migrate legacy format
    if (raw.api_key && !raw.profiles) {
      return {
        active_profile: 'default',
        profiles: { default: { api_key: raw.api_key, region: raw.region ?? 'us' } },
      };
    }
    return raw;
  } catch {
    return { active_profile: 'default', profiles: {} };
  }
}

function writeCredentials(creds: Credentials): void {
  const dir = configDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = credentialsPath();
  writeFileSync(path, JSON.stringify(creds, null, 2) + '\n', 'utf-8');
  chmodSync(path, 0o600);
}

export function storeApiKey(key: string, region: Region, profile = 'default'): void {
  const creds = readCredentials();
  creds.profiles[profile] = { api_key: key, region };
  if (!creds.active_profile || Object.keys(creds.profiles).length === 1) {
    creds.active_profile = profile;
  }
  writeCredentials(creds);
}

export function removeApiKey(profile?: string): void {
  const creds = readCredentials();
  const target = profile ?? creds.active_profile;
  delete creds.profiles[target];
  if (creds.active_profile === target) {
    const remaining = Object.keys(creds.profiles);
    creds.active_profile = remaining[0] ?? 'default';
  }
  writeCredentials(creds);
}

export interface ResolvedAuth {
  apiKey: string;
  region: Region;
  source: 'flag' | 'env' | 'config';
  profile: string;
}

export function resolveAuth(opts: { apiKey?: string; region?: string; profile?: string }): ResolvedAuth {
  // 1. CLI flags
  if (opts.apiKey) {
    return {
      apiKey: opts.apiKey,
      region: (opts.region as Region) ?? 'us',
      source: 'flag',
      profile: '-',
    };
  }

  // 2. Env vars
  if (process.env.DRATA_API_KEY) {
    return {
      apiKey: process.env.DRATA_API_KEY,
      region: (process.env.DRATA_REGION as Region) ?? (opts.region as Region) ?? 'us',
      source: 'env',
      profile: '-',
    };
  }

  // 3. Config file
  const creds = readCredentials();
  const profileName = opts.profile ?? process.env.DRATA_PROFILE ?? creds.active_profile;
  const profile = creds.profiles[profileName];
  if (profile) {
    return {
      apiKey: profile.api_key,
      region: (opts.region as Region) ?? profile.region,
      source: 'config',
      profile: profileName,
    };
  }

  throw new Error(
    'No API key found. Run `drata login` or set DRATA_API_KEY environment variable.'
  );
}

export function maskKey(key: string): string {
  if (key.length <= 12) return '****';
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

export function listProfiles(): { name: string; region: Region; active: boolean }[] {
  const creds = readCredentials();
  return Object.entries(creds.profiles).map(([name, p]) => ({
    name,
    region: p.region,
    active: name === creds.active_profile,
  }));
}

export function getActiveProfile(): string {
  return readCredentials().active_profile;
}

export function setActiveProfile(name: string): void {
  const creds = readCredentials();
  if (!creds.profiles[name]) throw new Error(`Profile "${name}" not found`);
  creds.active_profile = name;
  writeCredentials(creds);
}
