# Sub-Module Feature Specification: User Calendar Agenda (`user_calendar_calendar_agenda`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_calendar`
- **Sub-module:** `calendar_agenda`
- **Scope:** Calendar date grid, scheduled task agenda, day selection.
- **Non-Scope:** Task creation (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserCalendarScreen.tsx`: Thin screen (≤80 lines) composing `UserCalendarMainView`.
- Components:
  - `UserCalendarMainView.tsx`: Date grid, agenda list, selected date indicator.

## 3. Navigation Contract & User Flows
- Mounted in bottom tab or drawer.

## 4. API Contract & UI Data Requirements
- Aggregates tasks mapped by `dueDate`.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'calendar']`

## 6. Mutation Inventory & Lifecycle Operations
- Date selection, task inspection.

## 7. Permissions and Role Rules
- User authenticated context.

## 8. State Ownership & Architecture Flow
- Local date selection state.

## 9. Offline, Loading, Empty, and Error States
- 100% offline-first.

## 10. Security and PII Rules
- None.

## 11. Accessibility Requirements (A11y)
- Accessible calendar date cells; touch targets ≥ 44/48.

## 12. Background Tasks & Realtime Events
- None.

## 13. Feature Flags & Tenant Settings
- Standard calendar enabled.

## 14. Cache Invalidation & Consistency
- Recalculates on task due date change.

## 15. Migration, Rollback & Edge Cases
- Handles multi-month navigation.

## 16. Test Coverage Map & Quality Gates
- Calendar date selection tests.

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
- Mounts standalone with mock task agenda.

## 21. Module Portability & Host Integration Guide
- Mount `UserCalendarScreen` directly in parent navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
