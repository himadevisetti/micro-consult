import { RetainerAgreementIntent, TokenizedContract } from './types.js';
import { formatDate, extractTokens } from './utils.js';

export const injectTokensIntoContract = (
  template: string,
  intent: RetainerAgreementIntent
): TokenizedContract => {
  const tokenMap: Record<string, string> = {
    clientName: intent.clientName,
    serviceType: intent.serviceType,
    startDate: formatDate(intent.startDate),
    endDate: formatDate(intent.endDate),
    rate: intent.rate,
    jurisdiction: intent.jurisdiction ?? 'N/A',
    billingCycle: intent.billingCycle ?? 'monthly',
  };

  const extractedTokens = extractTokens(template);
  let output = template;

  extractedTokens.forEach((token) => {
    const replacement = tokenMap[token] || `[missing: ${token}]`;
    output = output.replace(new RegExp(`\\{\\{${token}\\}\\}`, 'g'), replacement);
  });

  return {
    originalTemplate: template,
    injectedOutput: output,
    fieldsInjected: tokenMap,
  };
};
