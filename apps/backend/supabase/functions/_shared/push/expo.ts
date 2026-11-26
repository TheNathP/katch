import type { PushDestination } from '../types.ts';

export type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  data: { destination: PushDestination };
  expiration: number;
  sound: 'default';
};

type ExpoFailure = { status: 'error'; code: string };
type ExpoTicket = { status: 'ok'; id: string } | ExpoFailure;
type ExpoReceipt = { status: 'ok' } | ExpoFailure;

export class ExpoRequestError extends Error {
  constructor(readonly code: string, readonly retryable: boolean) {
    super(code);
  }
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function failure(value: Record<string, unknown>): ExpoFailure {
  const code = record(value.details)?.error;
  return {
    status: 'error',
    code: typeof code === 'string' && /^[A-Za-z0-9_]{1,64}$/.test(code)
      ? code
      : 'expo_message_rejected',
  };
}

export function createExpoPushClient(accessToken?: string, fetcher = fetch) {
  async function request(endpoint: 'send' | 'getReceipts', body: unknown): Promise<unknown> {
    const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    let response: Response;
    try {
      response = await fetcher(`https://exp.host/--/api/v2/push/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ExpoRequestError('delivery_unknown', false);
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ExpoRequestError(
        `expo_http_${response.status}`,
        response.status === 429 || response.status >= 500,
      );
    }
    const result: unknown = await response.json().catch(() => null);
    return record(result)?.data;
  }

  return {
    async send(messages: ExpoMessage[]): Promise<ExpoTicket[]> {
      if (messages.length === 0) return [];
      if (messages.length > 100) {
        throw new RangeError('Expo accepts at most 100 messages per batch');
      }

      const data = await request('send', messages);
      if (!Array.isArray(data) || data.length !== messages.length) {
        throw new ExpoRequestError('delivery_unknown', false);
      }

      return data.map((item) => {
        const ticket = record(item);
        if (ticket?.status === 'ok' && typeof ticket.id === 'string' && ticket.id) {
          return { status: 'ok', id: ticket.id };
        }
        return ticket?.status === 'error' ? failure(ticket) : {
          status: 'error',
          code: 'delivery_unknown',
        };
      });
    },

    async receipts(ids: string[]): Promise<Map<string, ExpoReceipt>> {
      const receipts = new Map<string, ExpoReceipt>();
      if (ids.length === 0) return receipts;

      const data = record(await request('getReceipts', { ids }));
      if (!data) throw new ExpoRequestError('expo_receipts_unavailable', true);
      for (const id of ids) {
        const receipt = record(data[id]);
        if (receipt?.status === 'ok') receipts.set(id, { status: 'ok' });
        if (receipt?.status === 'error') receipts.set(id, failure(receipt));
      }
      return receipts;
    },
  };
}

export type ExpoPushClient = ReturnType<typeof createExpoPushClient>;
