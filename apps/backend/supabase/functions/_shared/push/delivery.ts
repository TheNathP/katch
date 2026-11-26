import { type AdminClient, createAdminClient } from '../db.ts';
import type { PushNotification } from '../types.ts';
import { type ExpoPushClient, ExpoRequestError } from './expo.ts';

const minute = 60_000;
const day = 24 * 60 * minute;
const maxAttempts = 5;

type EnqueuePush = {
  eventKey: string;
  userIds: readonly string[];
  notification: PushNotification;
  expiresAt?: Date;
};

type Delivery = {
  id: string;
  attempts: number;
  expires_at: string;
};

type ClaimedDelivery = Delivery & { token: string; content: PushNotification };
type PendingReceipt = Delivery & { ticket_id: string; submitted_at: string };
type ActiveStatus = 'sending' | 'submitted';
type DeliveryResult = {
  id: string;
  previous_status: ActiveStatus;
  attempts: number;
  status: 'pending' | 'submitted' | 'accepted' | 'failed';
  next_action_at?: string;
  error_code?: string;
  ticket_id?: string;
};

export async function enqueuePushNotification(
  { eventKey, userIds, notification, expiresAt = new Date(Date.now() + day) }: EnqueuePush,
  admin = createAdminClient(),
): Promise<number> {
  if (!eventKey.trim() || eventKey.length > 160) throw new Error('Invalid push event key');
  const textBytes = new TextEncoder().encode(JSON.stringify(notification)).length;
  if (!notification.title.trim() || !notification.body.trim() || textBytes > 3_000) {
    throw new Error('Invalid push notification content');
  }
  if (userIds.length === 0 || expiresAt.getTime() <= Date.now()) return 0;

  const { data, error } = await admin.rpc('enqueue_push_notification', {
    p_event_key: eventKey,
    p_user_ids: [...new Set(userIds)],
    p_content: notification,
    p_expires_at: expiresAt.toISOString(),
  });
  if (error || typeof data !== 'number') throw new Error('Could not enqueue notification');
  return data;
}

function failure(
  delivery: Delivery,
  previousStatus: ActiveStatus,
  code: string,
  retryable: boolean,
  now: number,
): DeliveryResult {
  const retryAt = now + minute * 2 ** (delivery.attempts - 1);
  if (retryable && delivery.attempts < maxAttempts && retryAt < Date.parse(delivery.expires_at)) {
    return {
      id: delivery.id,
      attempts: delivery.attempts,
      previous_status: previousStatus,
      status: 'pending',
      next_action_at: new Date(retryAt).toISOString(),
      error_code: code,
    };
  }
  return {
    id: delivery.id,
    attempts: delivery.attempts,
    previous_status: previousStatus,
    status: 'failed',
    error_code: code,
  };
}

async function applyResults(admin: AdminClient, results: DeliveryResult[]) {
  if (results.length === 0) return;
  const { error } = await admin.rpc('apply_push_results', { p_results: results });
  if (error) throw new Error('Could not save push outcomes');
}

async function sendPending(admin: AdminClient, expo: ExpoPushClient) {
  const { data, error } = await admin.rpc('claim_push_deliveries')
    .overrideTypes<ClaimedDelivery[], { merge: false }>();
  if (error || !Array.isArray(data)) throw new Error('Could not claim push deliveries');
  const deliveries = data;
  if (deliveries.length === 0) return 0;

  let results: DeliveryResult[];
  try {
    const tickets = await expo.send(deliveries.map(({ token, content, expires_at }) => ({
      to: token,
      title: content.title,
      body: content.body,
      data: { destination: content.destination },
      expiration: Math.floor(Date.parse(expires_at) / 1000),
      sound: 'default',
    })));
    const now = Date.now();
    results = deliveries.map((delivery, index) => {
      const ticket = tickets[index];
      if (ticket.status === 'error') {
        return failure(
          delivery,
          'sending',
          ticket.code,
          ticket.code === 'MessageRateExceeded',
          now,
        );
      }
      return {
        id: delivery.id,
        attempts: delivery.attempts,
        previous_status: 'sending',
        status: 'submitted',
        ticket_id: ticket.id,
        next_action_at: new Date(now + 15 * minute).toISOString(),
      };
    });
  } catch (error) {
    if (!(error instanceof ExpoRequestError)) throw error;
    const now = Date.now();
    results = deliveries.map((delivery) =>
      failure(delivery, 'sending', error.code, error.retryable, now)
    );
  }

  await applyResults(admin, results);
  return deliveries.length;
}

async function checkReceipts(admin: AdminClient, expo: ExpoPushClient) {
  const now = Date.now();
  const { data, error } = await admin
    .from('push_deliveries')
    .select('id, attempts, expires_at, ticket_id, submitted_at')
    .eq('status', 'submitted')
    .lte('next_action_at', new Date(now).toISOString())
    .order('next_action_at')
    .limit(100)
    .overrideTypes<PendingReceipt[], { merge: false }>();
  if (error) throw new Error('Could not load push receipts');

  const due = data ?? [];
  const open = due.filter(({ submitted_at }) => Date.parse(submitted_at) + day > now);
  const receipts = await expo.receipts(open.map(({ ticket_id }) => ticket_id));
  const results: DeliveryResult[] = due.map((delivery) => {
    const receipt = receipts.get(delivery.ticket_id);
    if (receipt?.status === 'error') {
      return failure(
        delivery,
        'submitted',
        receipt.code,
        receipt.code === 'MessageRateExceeded',
        now,
      );
    }
    const base = {
      id: delivery.id,
      attempts: delivery.attempts,
      previous_status: 'submitted' as const,
    };
    if (receipt) return { ...base, status: 'accepted' };

    const expires = Date.parse(delivery.submitted_at) + day;
    if (expires <= now) return { ...base, status: 'failed', error_code: 'receipt_expired' };
    return {
      ...base,
      status: 'submitted',
      next_action_at: new Date(Math.min(now + 5 * minute, expires)).toISOString(),
    };
  });

  await applyResults(admin, results);
  return due.length;
}

export async function processPushQueue(admin: AdminClient, expo: ExpoPushClient) {
  const processedSends = await sendPending(admin, expo);
  const checkedReceipts = await checkReceipts(admin, expo);
  return { processedSends, checkedReceipts };
}
