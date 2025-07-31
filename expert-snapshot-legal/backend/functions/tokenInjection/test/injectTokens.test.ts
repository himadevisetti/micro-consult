import { injectTokensIntoContract } from '../src/injectTokens'
import { RetainerAgreementIntent } from '../src/types'

const mockTemplate = `
  This agreement is between {{clientName}} and the legal team for {{serviceType}} services.
  It begins on {{startDate}} and ends on {{endDate}}, billed at {{rate}}.
  Jurisdiction: {{jurisdiction}}, Billing: {{billingCycle}}.
`

const mockIntent: RetainerAgreementIntent = {
  clientName: 'Acme Corp',
  serviceType: 'legalConsulting',
  startDate: '2025-07-01',
  endDate: '2025-12-31',
  rate: '$400/hour',
  jurisdiction: 'California',
  billingCycle: 'monthly'
}

describe('injectTokensIntoContract', () => {
  it('should inject all matching fields correctly', () => {
    const result = injectTokensIntoContract(mockTemplate, mockIntent)
    expect(result.injectedOutput).toContain('Acme Corp')
    expect(result.injectedOutput).toContain('legalConsulting')
    expect(result.injectedOutput).toContain('California')
    expect(Object.keys(result.fieldsInjected)).toContain('rate')
    expect(result.originalTemplate).toBe(mockTemplate)
  })

  it('should fall back to [missing: token] if token is absent', () => {
    const incompleteTemplate = 'Missing field: {{nonExistent}}.'
    const result = injectTokensIntoContract(incompleteTemplate, mockIntent)
    expect(result.injectedOutput).toContain('[missing: nonExistent]')
  })
})

