import { MultiRoom, MultiRoomMember } from '.prisma/client';

export type MultiRoomWithMember = MultiRoom & {
  multiRoomMember: MultiRoomMember[];
};
