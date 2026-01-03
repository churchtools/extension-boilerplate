import { GroupMember} from './ct-types';

export type GroupMemberExtended = GroupMember & { personFields: {birthday: string; sexID: number}}