export type Relationship = 'none' | 'incoming' | 'outgoing' | 'friend';

export type SocialPlayer = {
  id: string;
  name: string;
  relationship: Relationship;
};

export type FriendOverview = { players: SocialPlayer[] };

export type FriendProfile = {
  id: string;
  name: string;
  canViewResults: boolean;
  results: { date: string; score: number }[];
};

export type FriendMutation = 'request' | 'accept' | 'remove';

export type FriendsRequest =
  | { action: 'overview' }
  | { action: 'search' | 'rename'; text: string }
  | { action: 'profile' | FriendMutation; target: string };
