import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { applyFormToTemplate } from '../../expert-snapshot-legal/subdomains/retainer_agreement/utils/templateMapper';
import mappingSchema from '../../expert-snapshot-legal/subdomains/retainer_agreement/mappings/formToTemplate.schema.json';

export async function generateContract(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  type RequestPayload = {
    intent: Record<string, string>;
    template: string;
  };

  const { intent, template } = (await request.json()) as RequestPayload;
  const output = applyFormToTemplate(intent, template, mappingSchema);

  return {
    status: 200,
    body: output,
  };
}

// HTTP registration block
app.http('generateContract', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: generateContract,
});
