# Tasklume

Tasklume is an offline-first React Native productivity app for task management, reminders, focus sessions, notes, and voice memos.

## Features

- Create, edit, complete, pin, favorite, search, and trash tasks.
- Organize tasks with built-in and custom categories.
- Set due dates, reminders, and per-task countdown timers.
- Use a Pomodoro-style focus timer with locally stored session history.
- Browse calendar, productivity statistics, favorites, and reminders.
- Create auto-saved notes and record/share voice memos.
- Configure light/dark appearance, accent color, English/Hindi UI text, and device-based app lock.
- Export tasks as JSON text and restore a validated task backup.

## Storage and account model

Task data, notes, settings, custom categories, voice memo metadata, and focus history are stored locally. This repository does **not** implement server-backed accounts, login/signup, or cloud sync; the Profile screen stores local profile details only.

Optional features use third-party platform services:
- Task text is sent to Google's translation endpoint only after the user chooses the Translate action and confirms the disclosure.
- Voice typing uses the speech-recognition provider available on the device. Processing can vary with device and provider settings.
- Voice memo files are saved in app-local storage. Sharing a memo sends it through the app selected in the system share sheet.

See [privacy-policy.html](./privacy-policy.html) for the current privacy and third-party processing disclosure.

## Requirements

- Node.js **22.21.0 or newer within the React Native-supported release line** (the React Native/Nitro dependencies declare this minimum).
- npm (the repository includes package-lock.json).
- React Native Android tooling for Android builds.
- Xcode and CocoaPods on macOS for iOS builds.

## Setup

    npm ci
    npm start

In a second terminal:

    npm run android

On macOS, install pods when native dependencies change, then run the iOS app:

    bundle install
    bundle exec pod install
    npm run ios

Make sure your Android SDK/JDK or Xcode toolchain matches the installed React Native version. Native changes such as Info.plist permission strings require rebuilding the app; Metro refresh alone is not enough.

## Quality checks

    npm test -- --runInBand
    npm run lint

GitHub Actions runs the same test and lint commands for pull requests and pushes to main and fix/** branches.

## Notes on backups

The current in-app export action shares formatted JSON content through the platform share sheet; it does not yet provide a native “Save as .json file” picker or cloud backup. Restore accepts a JSON task array or an object with a tasks array, validates the data, and asks before replacing the current task list. Export a copy before restoring a backup.

## Project structure

- App.tsx — app composition and foreground notification events.
- src/context/ — task, notes, settings, theme, profile, and device app-lock state.
- src/screens/ — task, calendar, focus, notes, reminders, statistics, profile, settings, and onboarding screens.
- src/utils/dateUtils.js — due-date parsing and local date normalization.
- src/utils/todoTimerNotifications.js — reminder/timer notification scheduling.
- src/i18n/ — English/Hindi translation data and UI text wrapper.
- __tests__/ — Jest regression tests.
- .github/workflows/quality-checks.yml — CI test/lint workflow.
