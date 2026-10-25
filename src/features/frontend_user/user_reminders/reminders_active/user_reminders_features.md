# Sub-Module Feature Specification: User Reminders Active (`user_reminders_reminders_active`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_reminders`
- **Sub-module:** `reminders_active`
- **Scope:** Active task reminders, snooze dialogs, audio alert triggers.
- **Non-Scope:** Task creation (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserRemindersScreen.tsx`: Thin screen (≤80 lines) composing `UserRemindersMainView`.
- Components:
  - `UserRemindersMainView.tsx`: Reminder items list with snooze and dismiss actions.

## 3. Navigation Contract & User Flows
- Mounted in drawer / bottom tab.

## 4. API Contract & UI Data Requirements
- Filter tasks with `reminder === true` and future `reminderTime`.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'reminders']`

## 6. Mutation Inventory & Lifecycle Operations
- Snooze reminder, dismiss reminder.

## 7. Permissions and Role Rules
- Notification permission.

## 8. State Ownership & Architecture Flow
- Backed by `notifee` local notification triggers.

## 9. Offline, Loading, Empty, and Error States
- 100% offline-first.

## 10. Security and PII Rules
- None.

## 11. Accessibility Requirements (A11y)
- Accessible labels on snooze and dismiss buttons; touch targets ≥ 44/48.

## 12. Background Tasks & Realtime Events
- Reschedules background triggers on app state resume.

## 13. Feature Flags & Tenant Settings
- Reminders enabled.

## 14. Cache Invalidation & Consistency
- Updated on task reminder toggle.

## 15. Migration, Rollback & Edge Cases
- Auto-cancels obsolete notifications when tasks are deleted.

## 16. Test Coverage Map & Quality Gates
- Reminder snooze tests.

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
- Mounts standalone with mock active reminder items.

## 21. Module Portability & Host Integration Guide
- Mount `UserRemindersScreen` directly in parent navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
