import httpTrigger from '../src/index.js';
import { InvocationContext } from '@azure/functions';
import * as httpMocks from 'node-mocks-http';

function createMockContext(): InvocationContext & { res?: any } {
  const mockLogFn = (...args: any[]) => console.log(...args);

  return {
    invocationId: 'test-invoke',
    functionName: 'httpTrigger',
    extraInputs: {
      get: () => undefined,
      set: () => {},
    },
    extraOutputs: {
      get: () => undefined,
      set: () => {},
    },
    traceContext: {
      traceParent: '',
      traceState: '',
      attributes: {},
    },
    trace: mockLogFn,
    log: mockLogFn,
    debug: mockLogFn,
    info: mockLogFn,
    warn: mockLogFn,
    error: mockLogFn,
    options: {
      trigger: {
        type: 'httpTrigger',
        name: 'req',
      },
      extraInputs: [],
      extraOutputs: [],
    },
    res: undefined,
  };
}

describe('Azure Function index.ts', () => {
  const mockIntent = {
    clientName: 'Beta LLC',
    serviceType: 'contractReview',
    startDate: '2025-08-01',
    endDate: '2025-12-01',
    rate: '$5000',
    jurisdiction: 'New York',
    billingCycle: 'weekly',
  };

  const mockTemplate = 'Client: {{clientName}}, Service: {{serviceType}}, Rate: {{rate}}';

  it('returns 200 with injected output', async () => {
    const req = {
      json: async () => ({
        template: mockTemplate,
        intent: mockIntent,
      }),
    } as any;

    const context = createMockContext();
    await httpTrigger(req, context);

    const result = await httpTrigger(req, context);

    expect(result.status).toBe(200);

    expect(result.jsonBody.fieldsInjected.clientName).toContain('Beta LLC');
    expect(result.jsonBody.fieldsInjected.rate).toBe('$5000');
  });

  it('returns 400 for missing payload', async () => {
    const req = {
      json: async () => ({}),
    } as any;

    const context = createMockContext();
    await httpTrigger(req, context);

    const result = await httpTrigger(req, context);

    expect(result.status).toBe(400);
    expect(result.jsonBody.error).toBeDefined();
  });
});
