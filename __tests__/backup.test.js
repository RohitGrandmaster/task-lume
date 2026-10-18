import {validateAndSanitizeTasks} from '../src/components/common/BackupImportModal';

describe('validateAndSanitizeTasks', () => {
  it('returns null for empty or non-array inputs', () => {
    expect(validateAndSanitizeTasks(null)).toBeNull();
    expect(validateAndSanitizeTasks([])).toBeNull();
    expect(validateAndSanitizeTasks('invalid string')).toBeNull();
  });

  it('filters out tasks without a valid title', () => {
    const raw = [
      {title: '', completed: false},
      {description: 'No title here'},
      {title: '   '},
    ];
    expect(validateAndSanitizeTasks(raw)).toBeNull();
  });

  it('normalizes valid tasks and assigns default fields safely', () => {
    const raw = [
      {
        id: 'task-101',
        title: 'Complete Medium Priority Checklist',
        completed: 1, // truthy, should normalize to boolean
        priority: 'urgent', // invalid priority, fallback to medium
        category: 'Work',
      },
      {
        title: 'Buy Milk',
        // missing id, completed, etc.
      },
    ];

    const sanitized = validateAndSanitizeTasks(raw);
    expect(sanitized).toHaveLength(2);

    expect(sanitized[0].id).toBe('task-101');
    expect(sanitized[0].title).toBe('Complete Medium Priority Checklist');
    expect(sanitized[0].completed).toBe(true);
    expect(sanitized[0].priority).toBe('medium');
    expect(sanitized[0].category).toBe('Work');

    expect(sanitized[1].id).toBeDefined();
    expect(sanitized[1].title).toBe('Buy Milk');
    expect(sanitized[1].completed).toBe(false);
    expect(sanitized[1].priority).toBe('medium');
    expect(sanitized[1].category).toBe('Personal');
  });
});
