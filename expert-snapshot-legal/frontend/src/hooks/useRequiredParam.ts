// src/hooks/useRequiredParam.ts
import { useParams } from 'react-router-dom';

/**
 * Reads a param from the current route and throws if it's missing.
 * Use this for params that should *always* be present when a component mounts.
 */
export function useRequiredParam(name: string): string {
  const params = useParams();
  const value = params[name];

  if (!value) {
    // Fail fast in dev — this should never happen if navigation is wired correctly
    throw new Error(`Missing required route param: ${name}`);
  }

  return value;
}

