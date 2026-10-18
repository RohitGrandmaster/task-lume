import {useSettings} from '../context/SettingsContext';

const translations = {
  en: {
    // Nav & Common
    tasks: 'Tasks',
    calendar: 'Calendar',
    overview: 'Overview',
    focus: 'Focus',
    reminders: 'Reminders',
    favorites: 'Favorites',
    voiceMemos: 'Voice Memos',
    notes: 'Notes',
    categories: 'Categories',
    trash: 'Trash',
    profile: 'Profile',
    settings: 'Settings',

    // Settings Screen
    appearance: 'APPEARANCE',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchAppearance: 'Switch app appearance',
    themeColor: 'Theme Color',
    themeColorSubtitle: 'Pick your favorite accent color',
    language: 'Language',
    languageSubtitle: 'English / हिन्दी',
    timeFormat: '24-Hour Time',
    timeFormatSubtitle: 'e.g. 14:30 instead of 2:30 PM',
    weekStartsMonday: 'Week Starts on Monday',
    weekStartsMondaySubtitle: 'Sunday is currently the first day',

    notificationsSection: 'NOTIFICATIONS & SOUND',
    taskReminders: 'Task Reminders',
    taskRemindersSubtitle: 'Get notified for upcoming due tasks',
    timerAlerts: 'Timer Notifications',
    timerAlertsSubtitle: 'Sound & vibration when timer finishes',
    hapticFeedback: 'Haptic Feedback',
    hapticFeedbackSubtitle: 'Vibrate on taps and task completion',
    swipeActions: 'Swipe Actions',
    swipeActionsSubtitle: 'Swipe left to delete, swipe right to edit',

    dataPrivacy: 'DATA & SECURITY',
    appLock: 'App Lock (Biometric / PIN)',
    appLockSubtitle: 'Protect app with fingerprint or PIN',
    exportBackup: 'Export Data Backup',
    exportBackupSubtitle: 'Share or save all tasks as JSON',
    importBackup: 'Import Data Backup',
    importBackupSubtitle: 'Restore tasks from a backup file',
    resetData: 'Clear All Data',
    resetDataSubtitle: 'Permanently remove all tasks and data',
  },

  hi: {
    // Nav & Common
    tasks: 'कार्य (Tasks)',
    calendar: 'कैलेंडर (Calendar)',
    overview: 'प्रगति (Overview)',
    focus: 'फोकस (Focus)',
    reminders: 'याद दिलाएं (Reminders)',
    favorites: 'पसंदीदा (Favorites)',
    voiceMemos: 'वॉइस मेमो (Voice)',
    notes: 'नोट्स (Notes)',
    categories: 'श्रेणियाँ (Categories)',
    trash: 'कचरा पेटी (Trash)',
    profile: 'प्रोफाइल (Profile)',
    settings: 'सेटिंग्स (Settings)',

    // Settings Screen
    appearance: 'दिखावट (APPEARANCE)',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    switchAppearance: 'ऐप का रूप बदलें',
    themeColor: 'थीम का रंग',
    themeColorSubtitle: 'अपनी पसंद का रंग चुनें',
    language: 'भाषा (Language)',
    languageSubtitle: 'हिन्दी / English',
    timeFormat: '24 घंटे का समय',
    timeFormatSubtitle: 'उदा. 2:30 PM की जगह 14:30',
    weekStartsMonday: 'सप्ताह सोमवार से शुरू करें',
    weekStartsMondaySubtitle: 'रविवार अभी पहला दिन है',

    notificationsSection: 'सूचनाएं और ध्वनि',
    taskReminders: 'टास्क रिमाइंडर',
    taskRemindersSubtitle: 'आगामी कार्यों के लिए सूचनाएं पाएं',
    timerAlerts: 'टाइमर सूचनाएं',
    timerAlertsSubtitle: 'टाइमर पूरा होने पर रिंग व कंपन',
    hapticFeedback: 'हैप्टिक फीडबैक (कंपन)',
    hapticFeedbackSubtitle: 'बटन टैप और पूर्ण करने पर हल्का कंपन',
    swipeActions: 'स्वाइप एक्शन',
    swipeActionsSubtitle: 'डिलीट के लिए बाएं, एडिट के लिए दाएं स्वाइप',

    dataPrivacy: 'डेटा और सुरक्षा',
    appLock: 'ऐप लॉक (बायोमेट्रिक / पिन)',
    appLockSubtitle: 'फिंगरप्रिंट या पिन से सुरक्षित रखें',
    exportBackup: 'डेटा बैकअप निकालें',
    exportBackupSubtitle: 'सभी टास्क को JSON में सुरक्षित करें',
    importBackup: 'डेटा बैकअप लोड करें',
    importBackupSubtitle: 'पुरानी बैकअप फाइल से टास्क रीस्टोर करें',
    resetData: 'सारा डेटा साफ़ करें',
    resetDataSubtitle: 'सभी टास्क और डेटा हमेशा के लिए हटाएं',
  },
};

export function getTranslation(lang = 'en') {
  return translations[lang] || translations.en;
}

export function useTranslation() {
  const {language} = useSettings();
  const dict = translations[language] || translations.en;

  function t(key, fallback = '') {
    return dict[key] || fallback || key;
  }

  return {t, lang: language, dict};
}

export default translations;
