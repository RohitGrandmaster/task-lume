# Sub-Module Feature Specification: User Pomodoro Timer (`user_pomodoro_pomodoro_timer`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_pomodoro`
- **Sub-module:** `pomodoro_timer`
- **Scope:** Focus countdown timer, Work/Short Break/Long Break modes, foreground/background notification sounds, vibration trigger.
- **Non-Scope:** Task editing (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserPomodoroScreen.tsx`: Thin screen (≤80 lines) composing `UserPomodoroTimerMainView`.
- Components:
  - `UserPomodoroTimerMainView.tsx`: Focus circle, controls (Play/Pause/Stop), interval chips.

## 3. Navigation Contract & User Flows
- Mounted in drawer / bottom tab.

## 4. API Contract & UI Data Requirements
- Session record logging.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'pomodoro']`

## 6. Mutation Inventory & Lifecycle Operations
- Start timer, pause timer, complete session.

## 7. Permissions and Role Rules
- Notification permission for background alert delivery.

## 8. State Ownership & Architecture Flow
- Local interval state backed by `notifee` timer notifications.

## 9. Offline, Loading, Empty, and Error States
- 100% offline-first.

## 10. Security and PII Rules
- None.

## 11. Accessibility Requirements (A11y)
- Live region / accessibility announcement upon session completion; touch targets ≥ 44/48.

## 12. Background Tasks & Realtime Events
- Timer notification scheduled at completion timestamp.

## 13. Feature Flags & Tenant Settings
- Audio alerts enabled.

## 14. Cache Invalidation & Consistency
- Sessions recorded immediately upon completion.

## 15. Migration, Rollback & Edge Cases
- State restoration on background resume.

## 16. Test Coverage Map & Quality Gates
- Timer interval decrement tests.

## 17. Architecture Exceptions (ADRs)
- None.

## 18. Known Contract Gaps & Bug Log
- None.

## 19. Rule Compliance Checklist
- [x] Canonical role prefix (`frontend_user`)
- [x] Thin screen composition (≤80 lines)
- [x] Zero cross-feature imports
- [x] Luxury Premium Gold theme tokens

## 20. Standalone Run, Mock & Test Harness
- Mounts standalone with local timer state.

## 21. Module Portability & Host Integration Guide
- Mount `UserPomodoroScreen` directly in parent stack navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
