import api from './api';

export const assignmentService = {
  formatDaysRemaining: (days) => {
    if (days === undefined || days === null) return 'N/A';
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  },
};

export default assignmentService;
