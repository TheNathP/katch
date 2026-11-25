export type PushRegistrationRequest = {
  token: string;
};

export type PushRegistrationResponse = {
  registered: boolean;
};

export type PushDestination = '/defi' | '/progression/serie' | '/classement/amis';

export type PushNotification = {
  title: string;
  body: string;
  destination: PushDestination;
};

export type DailyColorResponse = {
  date: string;
  colorHex: string;
  endsAt: string;
  serverTime: string;
};
