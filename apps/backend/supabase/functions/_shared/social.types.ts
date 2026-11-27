export type Relationship = 'none' | 'incoming' | 'outgoing' | 'friend';

export type SocialPlayer = {
  id: string;
  name: string;
  relationship: Relationship;
};

export type FriendOverview = { players: SocialPlayer[] };

export const pixReactions = ['like', 'love', 'laugh', 'wow'] as const;
export type PixReaction = (typeof pixReactions)[number];

export type PhotoReactions = {
  myReaction: PixReaction | null;
  counts: Partial<Record<PixReaction, number>>;
};

export type PhotoReactionContext = { id: string; reactions: PhotoReactions };

export type FriendResultPhoto =
  | { status: 'locked' | 'missing' | 'unavailable' }
  | ({ status: 'available'; url: string } & PhotoReactionContext);

export type FriendResult = { date: string; score: number; photo?: FriendResultPhoto };

export type FriendProfile = {
  id: string;
  name: string;
  canViewResults: boolean;
  relationship?: Relationship;
  results: FriendResult[];
};

export type FriendMutation = 'request' | 'accept' | 'remove';

export type FriendsRequest =
  | { action: 'overview' }
  | { action: 'search' | 'rename'; text: string }
  | { action: 'profile' | FriendMutation; target: string }
  | { action: 'react'; attempt: string; reaction: PixReaction | null };
