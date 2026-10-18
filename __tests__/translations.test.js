import translations, {getTranslation} from '../src/i18n/translations';

describe('i18n Translations', () => {
  it('contains English (en) and Hindi (hi) dictionaries', () => {
    expect(translations.en).toBeDefined();
    expect(translations.hi).toBeDefined();
  });

  it('ensures all English translation keys exist in Hindi', () => {
    const enKeys = Object.keys(translations.en);
    const hiKeys = new Set(Object.keys(translations.hi));

    const missingInHindi = enKeys.filter(k => !hiKeys.has(k));
    expect(missingInHindi).toEqual([]);
  });

  it('translates correctly with getTranslation helper', () => {
    const enDict = getTranslation('en');
    const hiDict = getTranslation('hi');

    expect(enDict.tasks).toBe('Tasks');
    expect(hiDict.tasks).toBe('कार्य');
  });

  it('falls back to English when language is not recognized', () => {
    const dict = getTranslation('unknown_lang');
    expect(dict.tasks).toBe('Tasks');
  });
});
