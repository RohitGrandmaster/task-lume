jest.mock('../src/context/SettingsContext', () => ({useSettings: () => ({language: 'en'})}));

import {translateLiteral} from '../src/i18n/translations';

describe('translateLiteral', () => {
  it('translates known UI labels to Hindi', () => {
    expect(translateLiteral('My Tasks', 'hi')).toBe('मेरे कार्य');
    expect(translateLiteral('Save Task', 'hi')).toBe('कार्य सहेजें');
    expect(translateLiteral('Calendar', 'hi')).toBe('कैलेंडर');
  });

  it('keeps English copy unchanged in English mode', () => {
    expect(translateLiteral('My Tasks', 'en')).toBe('My Tasks');
  });

  it('preserves unknown text instead of showing a missing key', () => {
    expect(translateLiteral('A user-created note', 'hi')).toBe('A user-created note');
  });

  it('preserves leading and trailing whitespace', () => {
    expect(translateLiteral('  Save Task  ', 'hi')).toBe('  कार्य सहेजें  ');
  });

  it('does not translate non-string values', () => {
    expect(translateLiteral(null, 'hi')).toBeNull();
    expect(translateLiteral(42, 'hi')).toBe(42);
  });
});
