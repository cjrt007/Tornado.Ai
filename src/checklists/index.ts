import type { ChecklistItem } from '../shared/types.js';

export type Checklist = {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'reference';
  items: ChecklistItem[];
};

export const loadDefaultChecklists = (): Checklist[] => [
  {
    id: 'owasp-web',
    name: 'OWASP Web Application Testing',
    type: 'web',
    items: []
  },
  {
    id: 'owasp-mobile',
    name: 'OWASP Mobile Application Testing',
    type: 'mobile',
    items: []
  },
  {
    id: 'owasp-cheatsheet',
    name: 'OWASP Cheat Sheet Series',
    type: 'reference',
    items: []
  }
];
