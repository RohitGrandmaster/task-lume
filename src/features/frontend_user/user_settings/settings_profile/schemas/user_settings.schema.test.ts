/**
 * RESPONSIBILITY: Verifies profile field validation, normalization and optional-phone compatibility.
 * FLOW: Profile payloads pass through UserProfileEditSchema before the save callback is invoked.
 */
import { UserProfileEditSchema } from './user_settings.schema';

describe('UserProfileEditSchema', () => {
  it('trims valid profile values while allowing an empty optional phone number', () => {
    const parsed = UserProfileEditSchema.safeParse({
      name: '  Alex Kim  ',
      email: '  alex@example.com  ',
      phone: '',
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.name).toBe('Alex Kim');
    expect(parsed.data.email).toBe('alex@example.com');
    expect(parsed.data.phone).toBe('');
  });

  it('rejects an invalid name and email with field-scoped errors', () => {
    const parsed = UserProfileEditSchema.safeParse({
      name: 'A',
      email: 'not-an-email',
      phone: '12345',
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    expect(parsed.error.issues.some((issue) => issue.path[0] === 'email')).toBe(true);
    expect(parsed.error.issues.some((issue) => issue.path[0] === 'phone')).toBe(true);
  });
});
