// src/infrastructure/sessionStore.ts

import type { Candidate } from "../types/Candidate.js";
import type { ClauseBlock } from "../types/ClauseBlock.js";

interface ExtractionArtifacts {
  candidates: Candidate[];
  clauseBlocks: ClauseBlock[];
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Default to 1h if env not set
const DEFAULT_TTL =
  parseInt(process.env.CANDIDATE_TTL_MS || "", 10) || 60 * 60 * 1000;

// ---------- Extraction artifact helpers ----------

export async function saveCandidates(
  key: string,
  artifacts: ExtractionArtifacts,
  ttl: number = DEFAULT_TTL
) {
  cache.set(key, {
    value: artifacts,
    expiresAt: Date.now() + ttl,
  });
}

export async function loadCandidates(
  key: string
): Promise<ExtractionArtifacts | undefined> {
  const entry = cache.get(key) as CacheEntry<ExtractionArtifacts> | undefined;
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

const CLEANUP_INTERVAL_MS =
  parseInt(process.env.CANDIDATE_CLEANUP_MS || "", 10) || 10 * 60 * 1000;

function scheduleCleanup() {
  setTimeout(() => {
    try {
      const now = Date.now();
      for (const [key, entry] of cache.entries()) {
        if (now > entry.expiresAt) {
          cache.delete(key);
        }
      }
    } finally {
      // reschedule after finishing this run
      scheduleCleanup();
    }
  }, CLEANUP_INTERVAL_MS).unref();
}

// kick off the first cleanup
scheduleCleanup();
