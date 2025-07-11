import bcrypt from 'bcryptjs';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateLong = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Text processing utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const formatUsername = (username: string): string => {
  return username.trim().replace(/\s+/g, '');
};

// Validation utilities
export const isValidRobloxUsername = (username: string): boolean => {
  // ROBLOX usernames: 3-20 characters, alphanumeric and underscore only
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

export const isValidDiscordUsername = (username: string): boolean => {
  // Discord usernames: either new format (@username) or old format (username#1234)
  const newFormat = /^@[a-zA-Z0-9._]{1,32}$/;
  const oldFormat = /^.{1,32}#[0-9]{4}$/;
  return newFormat.test(username) || oldFormat.test(username);
};

export const validateRequiredFields = (fields: Record<string, any>): string[] => {
  const errors: string[] = [];
  
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${capitalizeWords(key.replace(/([A-Z])/g, ' $1'))} is required`);
    }
  });
  
  return errors;
};

// Permission utilities
export const formatPermissionLevel = (permission: string): string => {
  return permission === 'Honours Committee' ? 'Committee' : permission;
};

export const getPermissionColor = (permission: string): string => {
  switch (permission) {
    case 'Admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Honours Committee':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'User':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Data formatting utilities
export const formatStatus = (status: string): string => {
  return status === 'under_review' ? 'Under Review' : capitalize(status);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'under_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getFieldIcon = (field: string): string => {
  switch (field) {
    case 'Parliamentary and Public Service':
      return 'ri-government-line';
    case 'Military':
      return 'ri-shield-line';
    case 'Diplomatic':
      return 'ri-global-line';
    case 'Private Sector':
      return 'ri-briefcase-line';
    default:
      return 'ri-award-line';
  }
};

export const getFieldColor = (field: string): string => {
  switch (field) {
    case 'Parliamentary and Public Service':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Military':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Diplomatic':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Private Sector':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const getHonourTitle = (field: string): string => {
  switch (field) {
    case 'Parliamentary and Public Service':
      return 'Order of Project Britannia';
    case 'Military':
      return 'Military Cross';
    case 'Diplomatic':
      return 'Diplomatic Service Order';
    case 'Private Sector':
      return 'Order of Merit';
    default:
      return 'Special Recognition';
  }
};

// Array sorting utilities
export const sortByDate = <T extends { createdAt: Date | string }>(items: T[], ascending = false): T[] => {
  return [...items].sort((a, b) => {
    const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
    const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
    return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
};

export const sortByField = <T>(items: T[], field: keyof T, ascending = true): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ascending 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

// Form utilities
export const generateFieldId = (baseName: string, index?: number): string => {
  const suffix = index !== undefined ? `-${index}` : '';
  return `${baseName.toLowerCase().replace(/\s+/g, '-')}${suffix}`;
};

export const formatFormError = (error: string): string => {
  return error.charAt(0).toUpperCase() + error.slice(1);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility type guards
export const isNotEmpty = <T>(value: T | null | undefined): value is T => {
  return