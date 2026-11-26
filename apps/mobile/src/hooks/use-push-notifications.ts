import { router } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import type { PushDestination } from '@/data/api.types';
import { loadPushNotifications, reconcilePushPermission } from '@/data/push-notifications';

function isPushDestination(value: unknown): value is PushDestination {
  return value === '/' || value === '/amis' || value === '/defi' ||
    value === '/progression/serie' || value === '/classement/amis';
}

export function usePushNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let dispose: (() => void) | undefined;

    void loadPushNotifications().then((notifications) => {
      if (!active || !notifications) return;

      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const openNotification = (response: NotificationResponse | null) => {
        if (response?.actionIdentifier !== notifications.DEFAULT_ACTION_IDENTIFIER) return;
        const request = response.notification.request;
        const destination: unknown = request.content.data?.destination;
        if (!isPushDestination(destination)) return;
        if (destination === '/amis') {
          router.navigate({ pathname: '/amis', params: { notification: request.identifier } });
        } else {
          router.navigate(destination);
        }
        notifications.clearLastNotificationResponse();
      };

      const refreshPermission = () => void reconcilePushPermission(userId, notifications).catch(() => {});
      const responses = notifications.addNotificationResponseReceivedListener(openNotification);
      const appState = AppState.addEventListener('change', (state) => {
        if (state === 'active') refreshPermission();
      });
      dispose = () => {
        responses.remove();
        appState.remove();
        notifications.setNotificationHandler(null);
      };
      openNotification(notifications.getLastNotificationResponse());
      refreshPermission();
    }).catch(() => {});

    return () => {
      active = false;
      dispose?.();
    };
  }, [userId]);
}
