export const getEntityId = (entity: { id?: string; _id?: string } | string | null | undefined): string => {
  if (!entity) {
    return '';
  }

  if (typeof entity === 'string') {
    return entity;
  }

  return entity.id ?? entity._id ?? '';
};

export const getInitials = (value: string): string => {
  const words = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (words.length === 0) {
    return '?';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
};

export const formatShortDate = (value?: string): string => {
  if (!value) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

export const formatShortTime = (value?: string): string => {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
};
