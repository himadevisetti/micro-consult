import { InvocationContext, HttpRequest, HttpResponseInit } from '@azure/functions';
import { injectTokensIntoContract } from './injectTokens';
import { RetainerAgreementIntent } from './types';

export default async function httpTrigger(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = (await req.json()) as {
    template: string;
    intent: RetainerAgreementIntent;
  };

  const { template, intent } = body;

  if (!template || !intent || !intent.clientName || !intent.serviceType) {
    return {
      status: 400,
      jsonBody: {
        error: 'Missing required fields. "template", "clientName", and "serviceType" are required.',
      },
    };
  }

  const injectedFieldsObject = {
    clientName: intent.clientName,
    serviceType: intent.serviceType,
    rate: intent.rate,
    billingCycle: intent.billingCycle,
    jurisdiction: intent.jurisdiction,
    startDate: intent.startDate,
    endDate: intent.endDate,
  };

  // const interpolatedString = injectTokensIntoContract(template, intent)
  const interpolatedString = injectTokensIntoContract(template, injectedFieldsObject);

  return {
    status: 200,
    jsonBody: {
      injectedOutput: interpolatedString, // string version — for display/use
      fieldsInjected: injectedFieldsObject, // object version — for inspection/tests
    },
  };
}
