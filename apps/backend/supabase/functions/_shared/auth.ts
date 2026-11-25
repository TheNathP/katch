import type { AdminClient } from './db.ts';

export async function resolveUserId(request: Request, admin: AdminClient) {
  const token = request.headers.get('Authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error && (error.status === undefined || error.status >= 500)) {
    throw new Error('Could not reach Supabase Auth');
  }
  return error ? null : data.user?.id ?? null;
}
