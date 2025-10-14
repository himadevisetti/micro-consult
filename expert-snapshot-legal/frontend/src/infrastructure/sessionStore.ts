import type { Candidate } from "../types/Candidate.js";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Default to 1h if env not set
const DEFAULT_TTL =
  parseInt(process.env.CANDIDATE_TTL_MS || "", 10) || 60 * 60 * 1000;

// ---------- Candidate helpers ----------

export async function saveCandidates(
  key: string,
  candidates: Candidate[],
  ttl: number = DEFAULT_TTL
) {
  cache.set(key, {
    value: candidates,
    expiresAt: Date.now() + ttl,
  });
}

export async function loadCandidates(
  key: string
): Promise<Candidate[] | undefined> {
  const entry = cache.get(key) as CacheEntry<Candidate[]> | undefined;
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export async function deleteCandidates(key: string) {
  cache.delete(key);
}

// ---------- optional background cleanup ----------

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();
