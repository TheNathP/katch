import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import ChallengePhoto from '@/components/ui/ChallengePhoto';
import { readChallengePhotoSource } from '@/lib/challenge-photo';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));

test('offers a manual retry when the renewed photo link also fails', async () => {
  const user = userEvent.setup();
  const label = 'Photo du défi du 26 novembre';
  const url = 'https://katch.example/storage/v1/object/sign/challenge-photos/player/photo.jpg';
  const onRetry = jest.fn(async () => {});
  const photo = (token: string) => (
    <ChallengePhoto
      photo={readChallengePhotoSource(`${url}?token=${token}`)}
      label={label}
      full
      onRetry={onRetry}
    />
  );
  const view = await render(photo('expired'));

  await fireEvent(screen.getByLabelText(label), 'error', { nativeEvent: { error: 'HTTP 403' } });
  expect(onRetry).toHaveBeenCalledTimes(1);
  await view.rerender(photo('renewed'));
  await fireEvent(screen.getByLabelText(label), 'error', { nativeEvent: { error: 'Network error' } });

  expect(screen.getByText('Photo indisponible')).toBeOnTheScreen();
  expect(onRetry).toHaveBeenCalledTimes(1);
  await user.press(screen.getByRole('button', { name: 'Réessayer la photo' }));
  expect(onRetry).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText(label)).toBeOnTheScreen();
});
