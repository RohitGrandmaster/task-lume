# Sub-Module Feature Specification: User Overview Dashboard (`user_overview_overview_dashboard`)

## 1. Scope and Non-Scope (Module Purpose, System Context & Dependencies)
User Overview Dashboard is a mission-critical, enterprise-grade autonomous sub-module within the `frontend_user` mobile application container. It solves the core productivity needs for end-users by providing isolated, robust, and luxury-styled mobile capabilities. The user persona is the active authenticated mobile user who relies on instant offline capability, deterministic local storage, and responsive UI feedback. This sub-module strictly avoids cross-domain business coupling and adheres to Rule 28 (Strict WET Principle).

### Feature Ownership & System Context
- **Feature / Role Owner:** Mobile Frontend User Experience Team (`frontend_user`)
- **Backend Microservice / API Base:** `/api/v1/user/overview`
- **Authoritative Database Tables:** Local MMKV / SQLite / Keychain storage and synced REST entities
- **Background / Queued Jobs:** Notifee alarm scheduler, local background audio sessions, secure keychain sync

### Dependency Manifest
- **State Pattern:** TanStack Query v5 (server data) + Zustand client store (`user_overview.store.ts`)
- **Form & Validation:** React Hook Form v7 + Zod schemas (`user_overview.schema.ts`)
- **Icons & Native Primitives:** `lucide-react-native` + React Native Bare-Metal / Reanimated
- **Design Tokens:** Pure consumption of Luxury Premium Gold Theme Tokens via `useThemeTokens()`

### Autonomous Sub-Module Directory Structure
| Folder | Responsibility | Key Files |
|---|---|---|
| `screens/` | Thin screen orchestrators (≤80 lines, zero business logic) | `UserOverviewDashboardScreen.tsx` |
| `components/` | Presentational UI components and bottom sheets (≤200 lines) | `UserOverviewMainView.tsx`, `UserOverviewDailyCompletionRing.tsx`, `UserOverviewWeeklyActivityBarChart.tsx` |
| `hooks/` | Domain query, mutation, and interaction hooks (≤150 lines) | `useUserOverview.ts` |
| `api/` | API endpoints and central query keys registry | `user_overview.api.ts`, `user_overview.query_keys.ts` |
| `state/` | Feature-scoped Zustand store for UI state (≤180 lines) | `user_overview.store.ts` |
| `schemas/` | Zod validation schemas for forms and payloads | `user_overview.schema.ts` |
| `types/` | TypeScript types and navigation param lists | `user_overview.types.ts` |
| `config/` | Centralized URL and route config constants | `user_overview.url_config.ts` |
| `mocks/` | Scenarios, fixtures, and standalone harness bootstrap | `user_overview.scenarios.ts`, `bootstrap.ts` |
| `tests/` | Integration tests and standalone harness container | `UserOverviewHarness.tsx`, `user_overview.test.tsx` |

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
| UserOverviewDashboardScreen | `USER_OVERVIEW_ROUTES.DASHBOARD` | Productivity metrics, completion rings, streaks, and charts | `UserOverviewMainView.tsx` | Local / Remote API | Complete |

### Component Responsibility Map
| Component File | Responsibility |
|---|---|
| `UserOverviewMainView.tsx` | Composes metrics cards, completion ring, and weekly chart |
| `UserOverviewDailyCompletionRing.tsx` | Circular progress ring showing today completed vs pending tasks |
| `UserOverviewWeeklyActivityBarChart.tsx` | 7-day completion velocity bar chart via Gifted Charts |
| `UserOverviewCategoryDistribution.tsx` | Category breakdown progress bars and percentages |
| `UserOverviewStreakCounter.tsx` | Consecutive active productivity streak tracker with badge |
| `UserOverviewSkeleton.tsx` | Layout-mimicking shimmer for dashboard metrics |
| `UserOverviewEmptyState.tsx` | Empty state when no tasks have been created yet |
| `UserOverviewErrorFallback.tsx` | Error card with retry trigger for failed analytics queries |

## 3. Navigation Contract & User Flows
All routes are strongly typed with explicit navigation param lists defined in `types/user_overview.types.ts` and `config/user_overview.url_config.ts`. Screen wrappers extract typed params via `RouteProp` without direct business state mutations.

### Key User Flows
1. **Primary Browse & Inspection:** User accesses the sub-module through native stack navigation; screen renders loading skeleton while cache resolves; virtualized list displays items with 44/48dp touch targets.
2. **Interactive Mutation Flow:** User triggers an action (create, edit, or toggle); form validates via Zod schema; submit button shows loading indicator without layout shift; query cache updates pessimistically or authoritatively.
3. **Destructive & Reset Flow:** Destructive actions trigger a confirmation bottom sheet or modal with explicit consequence explanation before proceeding.

## 4. API Contract & UI Data Requirements
| Function | Method | Endpoint | Request Shape | Response `data` type |
|---|---|---|---|---|
| `fetchOverviewStats(range)` | GET | `/api/v1/user/overview/stats` | `{ range: "7d" | "30d" }` | `OverviewStats` |
| `fetchWeeklyActivity()` | GET | `/api/v1/user/overview/activity` | `—` | `WeeklyActivityDay[]` |

## 5. Query Key Registry & Server State
All query keys are strictly registered in `api/user_overview.query_keys.ts` to prevent collisions and support fine-grained invalidation:
```typescript
export const USER_OVERVIEW_QUERY_KEYS = {
  all: ['frontend_user', 'user_overview'] as const,
  lists: () => [...USER_OVERVIEW_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...USER_OVERVIEW_QUERY_KEYS.all, 'detail', id] as const,
};
```

## 6. Mutation Inventory & Lifecycle Operations
| Mutation Action | HTTP Method | Target Endpoint | Payload DTO | Idempotency Key? | Cache Invalidation Target |
|---|---|---|---|---|---|
| Recalculate Metrics | POST | `/api/v1/user/overview/recalculate` | `—` | No | `USER_OVERVIEW_QUERY_KEYS.all` |

## 7. Permissions and Role Rules
- **Role Requirement:** `FRONTEND_USER`
- **Destructive Operations:** Permanent deletion or data wiping requires explicit confirmation dialog.
- **Data Protection:** Personal identification details are masked in list representations via `maskSensitiveData()`.

## 8. State Ownership & Architecture Flow
- **Server Data:** TanStack Query v5 cache.
- **Client Transient UI State:** `user_overview.store.ts` via Zustand (modal open states, active tab filters).
- **Navigation State:** Native stack params passed via React Navigation.
- **Secure Credentials:** Hardware secure storage via `react-native-keychain` (auth tokens, PIN codes).

## 9. Offline, Loading, Empty, and Error States
| Section | Loading State | Empty State | Error State |
|---|---|---|---|
| Main View | `UserOverviewSkeleton.tsx` (layout-mimicking shimmer) | `UserOverviewEmptyState.tsx` (icon, message, CTA) | `UserOverviewErrorFallback.tsx` (localized retry action) |

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
- **Harness:** `tests/harness/UserOverviewHarness.tsx` (standalone mounting)
- **Unit & Integration:** `tests/user_overview.test.tsx` verifying behavioral user journeys
- **Maestro E2E:** `mobile_e2e/user_overview_crud.yaml` covering critical user flows
- **Mock Scenarios:** 5 canonical scenarios in `mocks/user_overview.scenarios.ts` (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)

## 17. Architecture Exceptions (ADRs)
| Decision | Chosen Approach | Rationale | Status |
|---|---|---|---|
| Offline First | Local storage cache + Query syncing | Guarantees instant sub-100ms response time on mobile devices | Approved |
| Token Source | Pure `useThemeTokens()` consumption | Enforces strict Luxury Gold styling without web CSS dependencies | Approved |

## 18. Known Contract Gaps & Bug Log

This feature is **NOT production-verified**. Source-level findings and current repair status:

- [PATCHED ON REPAIR BRANCH] Weekly activity now counts actual completed Todo records from `completedAt` timestamps for the last seven calendar days. Empty days correctly show zero; no sample counts are synthesized.
- [PATCHED ON REPAIR BRANCH] Current streak is derived from consecutive persisted completion dates rather than the total number of completed tasks.
- [PATCHED ON REPAIR BRANCH] Focus-minute KPIs no longer show fabricated values. The current UI displays an en dash until a verified focus-session history source is wired. `user_pomodoro.api.ts` declares `logSession`, but actual session logging/session-history fetch and their server contract still require verification.
- [PATCHED ON REPAIR BRANCH] `userOverviewAnalytics.test.ts` covers recorded streak and weekly activity calculations. This test file has not yet been executed.
- Legacy global `TodoContext` remains a cross-feature dependency (Rule 28); the overview still lacks a verified TanStack Query API data path and query-driven scenario state.
- The five scenario JSON files are not connected to executable MSW handlers; the standalone harness and module behavioral test coverage are incomplete.
- Design-token consistency, dynamic localization, reduced-motion/accessibility, and host runtime behavior remain unverified.

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
- **Harness Entry:** `tests/harness/UserOverviewHarness.tsx`
- **Bootstrap Launcher:** `mocks/standalone/bootstrap.ts` -> `bootstrapUserOverview()`
- **Test Scenarios:** 5 canonical presets (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)
- **Execution Command:** Mount `UserOverviewHarness` inside test runner or preview container in isolation

## 21. Module Portability & Host Integration Guide
1. **Directory Transfer:** Copy `src/features/frontend_user/user_overview/overview_dashboard` directly into any target React Native bare-metal codebase.
2. **Core Plumbing Verification:** Ensure host supplies `src/core/theme/useThemeTokens.ts`, `src/core/utils/displayValue.ts`, and `src/core/utils/maskSensitiveData.ts`.
3. **Route Mounting:** Register screen routes from `config/user_overview.url_config.ts` into the root navigation container.
4. **Standalone Verification:** Invoke `bootstrapUserOverview()` to run the module in 100% offline mock mode before wiring production endpoints.

## 22. Deliverables & Version History (Portability Score — NOT VERIFIED)
- **Version:** 1.0.0
- **Portability Score:** NOT VERIFIED. Legacy context coupling, incomplete API/mock/test wiring, localization and runtime verification remain open.
