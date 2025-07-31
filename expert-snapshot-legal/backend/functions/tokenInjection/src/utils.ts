import { RetainerAgreementIntent } from './types'

export const formatDate = (iso: string): string => {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const extractTokens = (template: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g
  const matches = template.match(regex)
  return matches ? matches.map(m => m.replace('{{', '').replace('}}', '')) : []
}

