/**
 * RESPONSIBILITY: Verifies task clearing scope and Trash-retention selection behavior.
 * FLOW: Jest invokes pure todoTrash helpers with controlled fixtures; no storage or native modules are required.
 */

import { purgeExpiredTrash, selectTodosToClear } from './todoTrash';

const tasks = [
  { id: 'active', completed: false, deleted: false },
  { id: 'completed', completed: true, deleted: false },
  { id: 'trashed-completed', completed: true, deleted: true },
];

describe('selectTodosToClear', () => {
  it('removes only completed, non-trashed tasks for the completed scope', () => {
    expect(selectTodosToClear(tasks, 'completed').map((task) => task.id)).toEqual(['completed']);
  });

  it('preserves all records when selecting completed tasks, leaving the active source array unchanged', () => {
    const selected = selectTodosToClear(tasks, 'completed');
    expect(selected).not.toBe(tasks);
    expect(tasks.map((task) => task.id)).toEqual(['active', 'completed', 'trashed-completed']);
  });

  it('keeps the legacy all-record behavior when scope is omitted', () => {
    expect(selectTodosToClear(tasks).map((task) => task.id)).toEqual(['active', 'completed', 'trashed-completed']);
  });
});

describe('purgeExpiredTrash', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('drops only trashed records older than the retention cutoff', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000_000);
    const cutoff = 1_000_000_000 - 30 * 24 * 60 * 60 * 1000;
    const records = [
      { id: 'active-old', deleted: false, deletedAt: cutoff - 1 },
      { id: 'trash-expired', deleted: true, deletedAt: cutoff - 1 },
      { id: 'trash-current', deleted: true, deletedAt: cutoff + 1 },
      { id: 'trash-no-date', deleted: true, deletedAt: null },
    ];
    expect(purgeExpiredTrash(records).map((record) => record.id)).toEqual([
      'active-old',
      'trash-current',
      'trash-no-date',
    ]);
  });
});
