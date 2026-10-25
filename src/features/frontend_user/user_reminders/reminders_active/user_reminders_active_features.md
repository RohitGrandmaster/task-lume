# Sub-Module Feature Specification: User Active Reminders (`user_reminders_reminders_active`)

## 1. Scope and Non-Scope (Module Purpose, System Context & Dependencies)
User Active Reminders is a mission-critical, enterprise-grade autonomous sub-module within the `frontend_user` mobile application container. It solves the core productivity needs for end-users by providing isolated, robust, and luxury-styled mobile capabilities. The user persona is the active authenticated mobile user who relies on instant offline capability, deterministic local storage, and responsive UI feedback. This sub-module strictly avoids cross-domain business coupling and adheres to Rule 28 (Strict WET Principle).

### Feature Ownership & System Context
- **Feature / Role Owner:** Mobile Frontend User Experience Team (`frontend_user`)
- **Backend Microservice / API Base:** `/api/v1/user/reminders`
- **Authoritative Database Tables:** Local MMKV / SQLite / Keychain storage and synced REST entities
- **Background / Queued Jobs:** Notifee alarm scheduler, local background audio sessions, secure keychain sync

### Dependency Manifest
- **State Pattern:** TanStack Query v5 (server data) + Zustand client store (`user_reminders.store.ts`)
- **Form & Validation:** React Hook Form v7 + Zod schemas (`user_reminders.schema.ts`)
- **Icons & Native Primitives:** `lucide-react-native` + React Native Bare-Metal / Reanimated
- **Design Tokens:** Pure consumption of Luxury Premium Gold Theme Tokens via `useThemeTokens()`

### Autonomous Sub-Module Directory Structure
| Folder | Responsibility | Key Files |
|---|---|---|
| `screens/` | Thin screen orchestrators (≤80 lines, zero business logic) | `UserRemindersScreen.tsx` |
| `components/` | Presentational UI components and bottom sheets (≤200 lines) | `UserRemindersMainView.tsx`, `UserRemindersSnoozeSheet.tsx`, `UserRemindersSkeleton.tsx`, `UserRemindersEmptyState.tsx`, `UserRemindersErrorFallback.tsx` |
| `hooks/` | Domain query, mutation, and interaction hooks (≤150 lines) | `useUserReminders.ts` |
| `api/` | API endpoints and central query keys registry | `user_reminders.api.ts`, `user_reminders.query_keys.ts` |
| `state/` | Feature-scoped Zustand store for UI state (≤180 lines) | `user_reminders.store.ts` |
| `schemas/` | Zod validation schemas for forms and payloads | `user_reminders.schema.ts` |
| `types/` | TypeScript types and navigation param lists | `user_reminders.types.ts` |
| `config/` | Centralized URL and route config constants | `user_reminders.url_config.ts` |
| `mocks/` | Scenarios, fixtures, and standalone harness bootstrap | `user_reminders.scenarios.ts`, `bootstrap.ts` |
| `tests/` | Integration tests and standalone harness container | `UserRemindersHarness.tsx`, `user_reminders.test.tsx` |

### Approved External Dependencies & Expected Host Contract
- `src/core/theme/useThemeTokens.ts` — Active Luxury Premium Gold tokens (colors, space, typography, radius)
- `src/core/utils/displayValue.ts` — Safe fallback formatter returning en-dash ('—')
- `src/core/utils/maskSensitiveData.ts` — Rule 30 PII and financial masking utility
- `src/core/utils/formatNumber.ts` — Locale-aware number and percent formatters
- `src/core/toast/` — Stable deduplicated toast notifications via `showToast()`
- Zero sibling domain business imports (Rule 28 Strict WET principle)

## 2. Screen Inventory & Component Responsibility Map
| Screen / Sheet | Route / Stack Name | What the User Can Do | Key Components | Main API Calls | Status |
|---|---|---|---|---|---|
| UserRemindersScreen | `USER_REMINDERS_ROUTES.ACTIVE` | View active reminders and reschedule a reminder after selecting a snooze interval | `UserRemindersMainView.tsx`, `UserRemindersSnoozeSheet.tsx` | Local task-store update + native reminder scheduler | Partial — source updated; tests/runtime pending |

### Component Responsibility Map
| Component File | Responsibility |
|---|---|
| `UserRemindersMainView.tsx` | Active reminder list with drawer header, snooze CTA, and accessible empty state |
| `UserRemindersSnoozeSheet.tsx` | Modal snooze sheet with 10-minute, 1-hour and tomorrow-morning options |
| `UserRemindersSkeleton.tsx` | Layout-mimicking shimmer for reminder cards |
| `UserRemindersEmptyState.tsx` | Empty state illustration when zero alarms are due |
| `UserRemindersErrorFallback.tsx` | Error fallback with alarm reschedule button |

## 3. Navigation Contract & User Flows
All routes are strongly typed with explicit navigation param lists defined in `types/user_reminders.types.ts` and `config/user_reminders.url_config.ts`. Screen wrappers extract typed params via `RouteProp` without direct business state mutations.

### Key User Flows
1. **Primary Browse & Inspection:** User accesses the sub-module through native stack navigation; screen renders loading skeleton while cache resolves; virtualized list displays items with 44/48dp touch targets.
2. **Interactive Mutation Flow:** User triggers an action (create, edit, or toggle); form validates via Zod schema; submit button shows loading indicator without layout shift; query cache updates pessimistically or authoritatively.
3. **Destructive & Reset Flow:** Destructive actions trigger a confirmation bottom sheet or modal with explicit consequence explanation before proceeding.

## 4. API Contract & UI Data Requirements
| Function | Method | Endpoint | Request Shape | Response `data` type |
|---|---|---|---|---|
| `fetchActiveReminders()` | GET | `/api/v1/user/reminders/active` | `—` | `ReminderItem[]` |
| `snoozeReminder(id, minutes)` | Local update through host TodoContext | Updates `dueDate`, `reminderTime`, and leaves `reminder=true` | Updated task in the current local store |

## 5. Query Key Registry & Server State
All query keys are strictly registered in `api/user_reminders.query_keys.ts` to prevent collisions and support fine-grained invalidation:
```typescript
export const USER_REMINDERS_QUERY_KEYS = {
  all: ['frontend_user', 'user_reminders'] as const,
  lists: () => [...USER_REMINDERS_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...USER_REMINDERS_QUERY_KEYS.all, 'detail', id] as const,
};
```

## 6. Mutation Inventory & Lifecycle Operations
| Mutation Action | HTTP Method | Target Endpoint | Payload DTO | Idempotency Key? | Cache Invalidation Target |
|---|---|---|---|---|---|
| Snooze Alarm | POST | `/api/v1/user/reminders/:id/snooze` | `{ minutes: number }` | No | `USER_REMINDERS_QUERY_KEYS.active()` |
| Dismiss Reminder | DELETE | `/api/v1/user/reminders/:id` | `—` | No | `USER_REMINDERS_QUERY_KEYS.active()` |

## 7. Permissions and Role Rules
- **Role Requirement:** `FRONTEND_USER`
- **Destructive Operations:** Permanent deletion or data wiping requires explicit confirmation dialog.
- **Data Protection:** Personal identification details are masked in list representations via `maskSensitiveData()`.

## 8. State Ownership & Architecture Flow
- **Server Data:** TanStack Query v5 cache.
- **Client Transient UI State:** `user_reminders.store.ts` via Zustand (modal open states, active tab filters).
- **Navigation State:** Native stack params passed via React Navigation.
- **Secure Credentials:** Hardware secure storage via `react-native-keychain` (auth tokens, PIN codes).

## 9. Offline, Loading, Empty, and Error States
| Section | Loading State | Empty State | Error State |
|---|---|---|---|
| Main View | `UserRemindersSkeleton.tsx` (layout-mimicking shimmer) | `UserRemindersEmptyState.tsx` (icon, message, CTA) | `UserRemindersErrorFallback.tsx` (localized retry action) |

## 10. Security and PII Rules (Data Masking & Guards)
- Sensitive contact info and passwords are never logged or stored in plain text.
- Token credentials and app lock PINs utilize iOS Keychain / Android Keystore.
- Telemetry breadcrumbs sanitize all payload bodies before dispatching.

## 11. Accessibility Requirements (A11y)
- Minimum touch target size: 44×44pt on iOS, 48×48dp on Android via `getMinTouchTarget()` or `hitSlop`.
- All touchable elements define `accessibilityRole` and `accessibilityLabel`.
- Screen reader announcements wired for asynchronous state transitions.
- High contrast Gold & Charcoal theme palette meets WCAG AA standards.

## 12. Background Tasks & Realtime Events
- Due date alarms and reminders schedule via native notification bridge.
- Foreground resume triggers automatic cache freshness re-evaluation.

## 13. Feature Flags & Tenant Settings
- Single tenant standalone mode with multi-theme support (Dark, Light, System).

## 14. Cache Invalidation & Consistency
- All state-altering mutations execute cache invalidation inside `onSuccess`.
- UI updates remain pessimistic for destructive mutations to prevent inconsistent local state.

## 15. Migration, Rollback & Edge Cases (Mandatory Section 67F Matrix)

### Section 67F — Mandatory Feature Edge Case Matrix
| Category | Documented Handling |
|---|---|
| **API** | Timeout (30s), No internet fallback, 401 token refresh, 403 denied banner, 404 not found, 409 conflict, 429 rate limit, 5xx error fallback card |
| **Data** | Null fields render en-dash (`—`), optional notes omitted safely, long strings truncate with ellipsis, stale cache validated |
| **Mutations** | Double tap disabled with `isSubmitting` button lock, idempotency key injected, app backgrounded mid-flight recovery |
| **Navigation** | Invalid ID route param redirects to default home, expired routes handled gracefully, Android hardware back trapped by active sheets |
| **Forms** | Keyboard overlap prevented via `KeyboardAvoidingView`, dirty exit guard prevents lost edits, field validation mapped from Zod |
| **Permissions** | Denied once shows inline explanation, denied permanently deep links to system Settings app |
| **Offline** | Offline storage serves cached records, offline banner displays sync pending indicator |
| **Accessibility** | 1.5x font scaling supported without text clipping, reduced motion disables bouncy springs, screen reader reads labels |
| **Security** | PII masked in summary cards, clipboard sanitized, zero PINs or tokens in console logs |
| **Platform** | Android back closes bottom sheets first; iOS swipe back enabled; safe area insets applied at screen root |

## 16. Test Coverage Map & Quality Gates
- **Harness:** `tests/harness/UserRemindersHarness.tsx` (standalone mounting)
- **Unit & Integration:** `tests/user_reminders.test.tsx` verifying behavioral user journeys
- **Maestro E2E:** `mobile_e2e/user_reminders_crud.yaml` covering critical user flows
- **Mock Scenarios:** 5 canonical scenarios in `mocks/user_reminders.scenarios.ts` (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)

## 17. Architecture Exceptions (ADRs)
| Decision | Chosen Approach | Rationale | Status |
|---|---|---|---|
| Offline First | Local storage cache + Query syncing | Guarantees instant sub-100ms response time on mobile devices | Approved |
| Token Source | Pure `useThemeTokens()` consumption | Enforces strict Luxury Gold styling without web CSS dependencies | Approved |

## 18. Known Contract Gaps & Bug Log

This feature is **NOT production-verified**. Findings and current status:

- [PATCHED ON REPAIR BRANCH] Snooze no longer emits a toast without a state change. The UI provides 10-minute, 1-hour and tomorrow-morning choices; the hook updates local `dueDate`/`reminderTime`, and existing `TodoContext.updateTodo` invokes the native reminder scheduler.
- [PATCHED ON REPAIR BRANCH] `userRemindersSnooze.test.ts` covers minute arithmetic, day rollover and invalid intervals; `useUserReminders.test.tsx` asserts the interaction calls `updateTodo` and does not show success for a missing reminder. These tests have NOT been executed.
- The UI/hook still rely on legacy `TodoContext`, violating autonomous feature isolation (Rule 28); the mutation is local rather than server-authoritative.
- The documentation's proposed `POST /api/v1/user/reminders/:id/snooze` endpoint is not backed by a verified supplied API contract and remains disconnected. Do not claim backend synchronization.
- The native scheduler may fail silently. Permission, time-zone/DST behavior, background delivery and device notification behavior remain `DEFERRED_TO_HOST_RUNTIME`.
- JSON scenario files are not connected to executable MSW handlers; five-state scenario UI and full E2E behavior are not verified.
- Token cleanup, dynamic localization, reduced-motion, screen-reader focus behavior and complete testID coverage remain open.

## 19. Rule Compliance Checklist (35+ Verification Items)
- [ ] Rule 0A: Universal Day-1 Sub-Module Architecture (autonomous depth = 1)
- [ ] Rule 1: Micro-modularization (Screen ≤80, Component ≤200, Hook ≤150, Store ≤180, Util ≤120 lines)
- [ ] Rule 1: Role isolation (zero cross-role imports)
- [ ] Rule 2: Navigation uses typed params (`ParamList` defined)
- [ ] Rule 3: All styles use design tokens via `useThemeTokens()`
- [ ] Rule 4: State placed per Server/Client decision matrix
- [ ] Rule 4: Pessimistic UI for destructive operations
- [ ] Rule 5: Forms use React Hook Form + Zod validator
- [ ] Rule 6: Auth credentials in hardware secure storage (`react-native-keychain`)
- [ ] Rule 7: Typed API calls with error envelopes
- [ ] Rule 7A: Mock responses cover 100% of UI fields
- [ ] Rule 8A: Virtualized lists for collections
- [ ] Rule 8B: Search inputs debounced ≥300ms
- [ ] Rule 10A: KeyboardAvoidingView on forms
- [ ] Rule 10B: Pull-to-refresh on scrollable lists
- [ ] Rule 11: Haptic tactile feedback on key transitions
- [ ] Rule 17: Behavioral testing proof and standalone harness
- [ ] Rule 22: Locked package registry respected
- [ ] Rule 24: Non-generic `_features.md` with all 22 canonical sections
- [ ] Rule 25: 44/48dp touch targets on interactive controls
- [ ] Rule 28: Zero cross-feature imports (Strict WET principle)
- [ ] Rule 29: `_forbidden.md` present with specific negative rules
- [ ] Rule 30: Sensitive data masked via `maskSensitiveData()`
- [ ] Rule 31: Double verification bottom sheet for deletes
- [ ] Rule 35: Centralized routes in `url_config.ts`
- [ ] Rule 36: Type-only imports use `import type`
- [ ] Rule 38: En-dash fallback via `displayValue()`
- [ ] Rule 39: Submit buttons have fixed `minWidth`
- [ ] Rule 40: Toast deduplication with stable key
- [ ] Rule 44: Responsibility & Flow Header comment on all files
- [ ] Rule 53: Idempotency keys on mutating API calls
- [ ] Section 67F: Mandatory Edge Case Matrix populated

## 20. Standalone Run, Mock & Test Harness
- **Harness Entry:** `tests/harness/UserRemindersHarness.tsx`
- **Bootstrap Launcher:** `mocks/standalone/bootstrap.ts` -> `bootstrapUserReminders()`
- **Test Scenarios:** 5 canonical presets (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)
- **Execution Command:** Mount `UserRemindersHarness` inside test runner or preview container in isolation

## 21. Module Portability & Host Integration Guide
1. **Directory Transfer:** Copy `src/features/frontend_user/user_reminders/reminders_active` directly into any target React Native bare-metal codebase.
2. **Core Plumbing Verification:** Ensure host supplies `src/core/theme/useThemeTokens.ts`, `src/core/utils/displayValue.ts`, and `src/core/utils/maskSensitiveData.ts`.
3. **Route Mounting:** Register screen routes from `config/user_reminders.url_config.ts` into the root navigation container.
4. **Standalone Verification:** Invoke `bootstrapUserReminders()` to run the module in 100% offline mock mode before wiring production endpoints.

## 22. Deliverables & Version History (Portability Score — NOT VERIFIED)
- **Version:** 1.0.0
- **Portability Score:** NOT VERIFIED. Legacy context dependency, unverified server API contract, incomplete mock/test wiring and deferred runtime checks remain open.
