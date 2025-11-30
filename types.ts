
export enum QuadrantType {
  Q1 = 'Q1', // Urgent & Important
  Q2 = 'Q2', // Not Urgent & Important
  Q3 = 'Q3', // Urgent & Not Important
  Q4 = 'Q4', // Not Urgent & Not Important
  Backlog = 'Backlog', // Unsorted
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantType;
  completed: boolean;
  tags: string[];
  createdAt: number;
  dueDate?: number; // Timestamp for calendar
  completedAt?: number; // Timestamp for history
}

export interface AIImportResult {
  title: string;
  quadrant: QuadrantType;
  tags: string[];
}

export const QUADRANT_CONFIG = {
  [QuadrantType.Q1]: {
    id: QuadrantType.Q1,
    label: 'Do First',
    subLabel: 'Urgent & Important',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-950/20',
    shortcut: '1',
  },
  [QuadrantType.Q2]: {
    id: QuadrantType.Q2,
    label: 'Schedule',
    subLabel: 'Not Urgent & Important',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-950/20',
    shortcut: '2',
  },
  [QuadrantType.Q3]: {
    id: QuadrantType.Q3,
    label: 'Delegate',
    subLabel: 'Urgent & Not Important',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-950/20',
    shortcut: '3',
  },
  [QuadrantType.Q4]: {
    id: QuadrantType.Q4,
    label: 'Eliminate',
    subLabel: 'Not Urgent & Not Important',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/50',
    bgColor: 'bg-slate-900/50',
    shortcut: '4',
  },
  [QuadrantType.Backlog]: {
    id: QuadrantType.Backlog,
    label: 'Backlog',
    subLabel: 'Inbox',
    color: 'text-gray-300',
    borderColor: 'border-gray-700',
    bgColor: 'bg-gray-900',
    shortcut: '`',
  }
};
