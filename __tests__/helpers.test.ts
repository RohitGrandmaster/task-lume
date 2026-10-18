import {createId, purgeExpiredTrash} from '../src/utils/helpers';

describe('createId', () => {
  it('does not collide during rapid task creation', () => {
    const ids = Array.from({length: 2000}, () => createId());
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(id => typeof id === 'string' && id.length > 10)).toBe(true);
  });
});

describe('purgeExpiredTrash', () => {
  const day = 24 * 60 * 60 * 1000;
  const now = 1_800_000_000_000;

  it('purges deleted tasks older than 30 days only', () => {
    const tasks = [
      {id: 'old-trash', deleted: true, deletedAt: now - 31 * day},
      {id: 'recent-trash', deleted: true, deletedAt: now - 2 * day},
      {id: 'active', deleted: false, deletedAt: now - 90 * day},
      {id: 'legacy-trash', deleted: true},
    ];

    expect(purgeExpiredTrash(tasks, now).map(task => task.id)).toEqual([
      'recent-trash',
      'active',
      'legacy-trash',
    ]);
  });

  it('handles a non-array input safely', () => {
    expect(purgeExpiredTrash(null)).toEqual([]);
  });
});
