import { Types } from 'mongoose';

export const matchesId = (value: unknown, expectedId?: string): boolean => {
  if (!value || !expectedId) {
    return false;
  }

  if (typeof value === 'string') {
    return value === expectedId;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString() === expectedId;
  }

  if (typeof value === 'object') {
    const candidate = (value as { id?: unknown; _id?: unknown }).id ?? (value as { _id?: unknown })._id;
    return matchesId(candidate, expectedId);
  }

  return false;
};

export const isWorkspaceMember = (members: unknown[], userId?: string): boolean => {
  if (!userId) {
    return false;
  }

  return members.some((member) => matchesId(member, userId));
};
