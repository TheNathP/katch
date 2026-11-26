import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NotificationPermissionsStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import type { PushRegistrationRequest, PushRegistrationResponse } from './api.types';
import { supabase, supabaseConfig } from './supabase';

const projectId: unknown = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
const channelId = 'daily-challenge';
const storageKey = (userId: string) => `katch:push-token:${userId}`;
let pendingUpdate: Promise<void> = Promise.resolve();

export const pushNotificationsAvailable =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient && typeof projectId === 'string' && projectId.length > 0;

export async function loadPushNotifications() {
  return pushNotificationsAvailable ? import('expo-notifications') : null;
}

function readPushToken(userId: string) {
  return AsyncStorage.getItem(storageKey(userId));
}

type Notifications = NonNullable<Awaited<ReturnType<typeof loadPushNotifications>>>;

function permissionGranted(notifications: Notifications, permissions: NotificationPermissionsStatus) {
  return permissions.granted ||
    permissions.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function pushNotificationsEnabled(userId: string) {
  const notifications = await loadPushNotifications();
  return !!notifications && !!await readPushToken(userId) &&
    permissionGranted(notifications, await notifications.getPermissionsAsync());
}

function updateRegistration(update: () => Promise<void>) {
  const result = pendingUpdate.then(update);
  pendingUpdate = result.catch(() => {});
  return result;
}

async function sendRegistration(userId: string, token: string, method: 'POST' | 'DELETE') {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || session?.user.id !== userId) throw new Error('No active session for push registration');

  const response = await fetch(`${supabaseConfig.url}/functions/v1/push-registration`, {
    method,
    headers: {
      apikey: supabaseConfig.publishableKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token } satisfies PushRegistrationRequest),
  });
  if (!response.ok) throw new Error('Could not update push registration');
  const result: PushRegistrationResponse = await response.json();
  if (result.registered !== (method === 'POST')) throw new Error('Unexpected push registration response');
}

export async function enablePushNotifications(userId: string) {
  const notifications = await loadPushNotifications();
  if (!notifications || typeof projectId !== 'string') throw new Error('Push notifications are unavailable');

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync(channelId, {
      name: 'Défi du jour',
      importance: notifications.AndroidImportance.HIGH,
    });
  }
  const current = await notifications.getPermissionsAsync();
  const permissions = permissionGranted(notifications, current)
    ? current
    : await notifications.requestPermissionsAsync();
  if (!permissionGranted(notifications, permissions)) return false;

  const { data: token } = await notifications.getExpoPushTokenAsync({ projectId });
  await updateRegistration(async () => {
    const previous = await readPushToken(userId);
    if (previous && previous !== token) await sendRegistration(userId, previous, 'DELETE');
    await sendRegistration(userId, token, 'POST');
    await AsyncStorage.setItem(storageKey(userId), token);
  });
  return true;
}

export function disablePushNotifications(userId: string) {
  return updateRegistration(async () => {
    const token = await readPushToken(userId);
    if (!token) return;
    await sendRegistration(userId, token, 'DELETE');
    await AsyncStorage.removeItem(storageKey(userId));
  });
}

export async function reconcilePushPermission(userId: string, notifications: Notifications) {
  if (!await readPushToken(userId)) return;
  if (!permissionGranted(notifications, await notifications.getPermissionsAsync())) {
    await disablePushNotifications(userId);
  }
}
