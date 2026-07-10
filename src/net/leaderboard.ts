import { CONFIG } from '../config';

export interface LeaderboardEntry {
  name: string;
  country: string; // ISO 3166-1 alpha-2, uppercase
  score: number;
}

const BASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** When env vars are missing the world leaderboard degrades gracefully. */
export function isConfigured(): boolean {
  return Boolean(BASE_URL && ANON_KEY);
}

function headers(): Record<string, string> {
  return {
    apikey: ANON_KEY ?? '',
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchTop10(): Promise<LeaderboardEntry[]> {
  const url =
    `${BASE_URL}/rest/v1/leaderboard` +
    `?select=name,country,score&order=score.desc,created_at.asc&limit=${CONFIG.leaderboard.size}`;
  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(CONFIG.leaderboard.timeoutMs),
  });
  if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
  return res.json();
}

export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  const res = await fetch(`${BASE_URL}/rest/v1/leaderboard`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(entry),
    signal: AbortSignal.timeout(CONFIG.leaderboard.timeoutMs),
  });
  if (!res.ok) throw new Error(`Score submit failed: ${res.status}`);
}

/** On the board if it isn't full yet, otherwise must strictly beat 10th place. */
export function qualifies(score: number, entries: LeaderboardEntry[]): boolean {
  if (score <= 0) return false;
  if (entries.length < CONFIG.leaderboard.size) return true;
  return score > entries[entries.length - 1].score;
}
