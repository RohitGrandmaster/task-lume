# Tasklume

**Plan Smart. Focus Better.**

A modern, offline-first productivity app built with React Native. Manage tasks, focus sessions, reminders, voice memos, and more — all with a beautiful premium UI, dark mode, and biometric app lock.

---

## Features

### Tasks
- Create, edit, complete, pin, and favorite tasks
- Priority levels (low / medium / high)
- Categories (Personal, Work, Health, custom categories supported)
- Due dates with smart chips (Today, Tomorrow, Overdue)
- Recurring tasks (daily, weekly, monthly)
- Task timers with notifications
- Reminders / Alerts
- Soft delete + 30-day Trash with auto-cleanup
- Swipe actions (Edit / Delete)

### Focus / Pomodoro
- Focus sessions with work / short break / long break modes
- Session history and stats
- Sound alerts on completion

### Other
- Calendar view
- Voice memos + speech recognition
- Statistics & progress tracking
- Full Backup / Import (JSON)
- Biometric + Device PIN/Pattern App Lock
- Multi-accent theme system (Indigo, Ocean, Emerald, Purple, Rose, Sunset, Amber, Crimson, Teal)
- Light & Dark mode
- Haptic feedback
- Onboarding flow

---

## Tech Stack

- **React Native** 0.87
- **React** 19
- **React Navigation** 7 (Drawer + Native Stack)
- **Notifee** – local notifications & exact alarms
- **AsyncStorage** – offline storage
- **React Native Keychain** – secure biometric lock
- **Reanimated / Gesture Handler / Safe Area**
- **Lucide** icons

---

## Getting Started

### Prerequisites

- Node.js `>= 22.11.0`
- JDK 17+
- Android Studio / Xcode
- React Native environment set up ([official guide](https://reactnative.dev/docs/set-up-your-environment))

### Installation

```sh
git clone https://github.com/RohitGrandmaster/todo-app.git
cd todo-app
npm install
```

### Run

```sh
# Start Metro
npm start

# Android
npm run android

# iOS (first time)
bundle install
bundle exec pod install
npm run ios
```

---

## Project Structure

```
src/
├── components/     # Reusable UI (common + todo)
├── context/        # Auth, Todo, Theme, Settings, AppLock
├── screens/        # Feature screens
├── services/       # Sound, focus, API helpers
├── storage/        # AsyncStorage wrapper
├── navigation/     # Root + Drawer navigators
├── theme/          # Theme factory
├── utils/          # Date, recurrence, notifications, helpers
├── types/          # TypeScript definitions
└── constants/      # Colors, routes, app config
```

---

## Security & Privacy

- `android:allowBackup="false"` – protects voice memos and app data from unauthorized backup extraction
- App Lock uses **React Native Keychain** with biometric / device credential protection
- No cloud accounts required – fully offline by default
- Privacy Policy included in the app

---

## Scripts

| Command          | Description              |
|------------------|--------------------------|
| `npm start`      | Start Metro bundler      |
| `npm run android`| Run on Android           |
| `npm run ios`    | Run on iOS               |
| `npm test`       | Run Jest tests           |
| `npm run lint`   | Run ESLint               |

---

## License

Private project.

---

Made with ❤️ by Rohit
