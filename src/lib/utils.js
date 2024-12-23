import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Validate IP address
export function isValidIPAddress(ip) {
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  const parts = ip.split('.');
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
}

// Format date
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

// Parse error message
export function parseError(error) {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unknown error occurred';
}
