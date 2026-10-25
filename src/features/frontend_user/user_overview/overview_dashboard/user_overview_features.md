# Sub-Module Feature Specification: User Overview Dashboard (`user_overview_overview_dashboard`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_overview`
- **Sub-module:** `overview_dashboard`
- **Scope:** Task completion analytics, productivity streaks, focus time breakdown, chart visualizations.
- **Non-Scope:** Task CRUD (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserOverviewScreen.tsx`: Thin screen (≤80 lines) composing `UserOverviewMainView`.
- Components:
  - `UserOverviewKPISection.tsx`: Metric cards (streak, completion rate, total tasks).
  - `UserOverviewMainView.tsx`: Overview layout composing sections.

## 3. Navigation Contract & User Flows
- Mounted in bottom tab or drawer.

## 4. API Contract & UI Data Requirements
- Aggregates local todo states and focus session metrics.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'overview']`

## 6. Mutation Inventory & Lifecycle Operations
- Read-only analytics dashboard with refresh action.

## 7. Permissions and Role Rules
- User authenticated context.

## 8. State Ownership & Architecture Flow
- Computes derived data from `useTodos` and `focusService`.

## 9. Offline, Loading, Empty, and Error States
- Works 100% offline with locally cached tasks and sessions.

## 10. Security and PII Rules
- PII-free statistical aggregations.

## 11. Accessibility Requirements (A11y)
- Dynamic type scaling supported; chart data readable with accessible text equivalents.

## 12. Background Tasks & Realtime Events
- None.

## 13. Feature Flags & Tenant Settings
- Standard metrics enabled.

## 14. Cache Invalidation & Consistency
- Recalculates automatically upon task completion or focus session end.

## 15. Migration, Rollback & Edge Cases
- Safe zero-fallbacks when no tasks exist.

## 16. Test Coverage Map & Quality Gates
- Metric computation unit tests.

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
- Mounts standalone with mock task aggregations.

## 21. Module Portability & Host Integration Guide
- Mount `UserOverviewScreen` directly in parent navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
