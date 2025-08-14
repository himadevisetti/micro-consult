import { RetainerFormErrors } from '../hooks/useRetainerState'

export function sanitizeErrors(errors: RetainerFormErrors): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).filter(([_, value]) => typeof value === 'string')
  )
}

