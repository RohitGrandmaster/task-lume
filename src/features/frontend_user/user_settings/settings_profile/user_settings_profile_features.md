# Sub-Module Feature Specification: User Settings & Profile (`user_settings_settings_profile`)

## 1. Scope and Non-Scope (Module Purpose, System Context & Dependencies)
User Settings & Profile is a mission-critical, enterprise-grade autonomous sub-module within the `frontend_user` mobile application container. It solves the core productivity needs for end-users by providing isolated, robust, and luxury-styled mobile capabilities. The user persona is the active authenticated mobile user who relies on instant offline capability, deterministic local storage, and responsive UI feedback. This sub-module strictly avoids cross-domain business coupling and adheres to Rule 28 (Strict WET Principle).

### Feature Ownership & System Context
- **Feature / Role Owner:** Mobile Frontend User Experience Team (`frontend_user`)
- **Backend Microservice / API Base:** `/api/v1/user/settings`
- **Authoritative Database Tables:** Local MMKV / SQLite / Keychain storage and synced REST entities
- **Background / Queued Jobs:** Notifee alarm scheduler, local background audio sessions, secure keychain sync

### Dependency Manifest
- **State Pattern:** TanStack Query v5 (server data) + Zustand client store (`user_settings.store.ts`)
- **Form & Validation:** React Hook Form v7 + Zod schemas (`user_settings.schema.ts`)
- **Icons & Native Primitives:** `lucide-react-native` + React Native Bare-Metal / Reanimated
- **Design Tokens:** Pure consumption of Luxury Premium Gold Theme Tokens via `useThemeTokens()`

### Autonomous Sub-Module Directory Structure
| Folder | Responsibility | Key Files |
|---|---|---|
| `screens/` | Thin screen orchestrators (≤80 lines, zero business logic) | `UserSettingsMainScreen.tsx`, `UserProfileScreen.tsx`, `UserSecurityScreen.tsx`, `UserDataManagementScreen.tsx`, `UserFaqScreen.tsx`, `UserFeedbackScreen.tsx`, `UserDeveloperAppsScreen.tsx` |
| `components/` | Presentational UI components and bottom sheets (≤200 lines) | `UserSettingsMainView.tsx`, `UserProfileMainView.tsx`, `UserProfileStatsCards.tsx` |
| `hooks/` | Domain query, mutation, and interaction hooks (≤150 lines) | `useUserSettings.ts` |
| `api/` | API endpoints and central query keys registry | `user_settings.api.ts`, `user_settings.query_keys.ts` |
| `state/` | Feature-scoped Zustand store for UI state (≤180 lines) | `user_settings.store.ts` |
| `schemas/` | Zod validation schemas for forms and payloads | `user_settings.schema.ts` |
| `types/` | TypeScript types and navigation param lists | `user_settings.types.ts` |
| `config/` | Centralized URL and route config constants | `user_settings.url_config.ts` |
| `mocks/` | Scenarios, fixtures, and standalone harness bootstrap | `user_settings.scenarios.ts`, `bootstrap.ts` |
| `tests/` | Integration tests and standalone harness container | `UserSettingsHarness.tsx`, `user_settings.test.tsx` |

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
| UserSettingsMainScreen | `USER_SETTINGS_ROUTES.MAIN` | Master settings navigation menu and category links | `UserSettingsMainView.tsx` | Local / Remote API | Complete |
| UserProfileScreen | `USER_SETTINGS_ROUTES.PROFILE` | User profile details, avatar, and productivity stats | `UserProfileMainView.tsx` | Local / Remote API | Complete |
| UserSecurityScreen | `USER_SETTINGS_ROUTES.SECURITY` | Biometrics and 4-digit App Lock PIN via Keychain | `UserSecurityMainView.tsx` | Local / Remote API | Complete |
| UserDataManagementScreen | `USER_SETTINGS_ROUTES.DATA` | JSON backup export, file import, and reset data | `UserDataManagementMainView.tsx` | Local / Remote API | Complete |
| UserFaqScreen | `USER_SETTINGS_ROUTES.FAQ` | Interactive accordion of frequently asked questions | `UserFaqMainView.tsx` | Local / Remote API | Complete |
| UserFeedbackScreen | `USER_SETTINGS_ROUTES.FEEDBACK` | User feedback form with rating and category selector | `UserFeedbackMainView.tsx` | Local / Remote API | Complete |
| UserDeveloperAppsScreen | `USER_SETTINGS_ROUTES.APPS` | Showcase of apps and portfolio by Rohit Kumar | `UserDeveloperAppsMainView.tsx` | Local / Remote API | Complete |

### Component Responsibility Map
| Component File | Responsibility |
|---|---|
| `UserSettingsMainView.tsx` | Composes profile card, settings sections, and developer link |
| `UserProfileMainView.tsx` | Profile avatar, name, email, and member since date |
| `UserProfileStatsCards.tsx` | Summary cards for tasks completed and current streak |
| `UserSecurityMainView.tsx` | Biometrics toggle and PIN code manager using Keychain |
| `UserDataManagementMainView.tsx` | JSON backup export, file picker import, and clear data |
| `UserFaqMainView.tsx` | Accordion FAQ items with smooth expansion animations |
| `UserFeedbackMainView.tsx` | Feedback form with satisfaction rating and comments |
| `UserFeedbackCategorySelector.tsx` | Pill selector for Bug, Feature Request, or General feedback |
| `UserDeveloperAppsMainView.tsx` | Showcase cards for Rohit Kumar apps and portfolio links |
| `UserSettingsProfileCard.tsx` | Header summary card tapping through to UserProfileScreen |
| `UserSettingsAppearanceSection.tsx` | Dark/Light/System theme selector with gold accents |
| `UserSettingsNotificationsSection.tsx` | Toggles for task alarms, daily summary, and haptics |
| `UserSettingsAboutDeveloperSection.tsx` | Developer Rohit Kumar profile with WhatsApp/Instagram links |
| `UserSettingsSkeleton.tsx` | Layout-mimicking shimmer for settings menu items |
| `UserSettingsEmptyState.tsx` | Empty state illustration for empty settings lists |
| `UserSettingsErrorFallback.tsx` | Error state card with settings reload button |

## 3. Navigation Contract & User Flows
All routes are strongly typed with explicit navigation param lists defined in `types/user_settings.types.ts` and `config/user_settings.url_config.ts`. Screen wrappers extract typed params via `RouteProp` without direct business state mutations.

### Key User Flows
1. **Primary Browse & Inspection:** User accesses the sub-module through native stack navigation; screen renders loading skeleton while cache resolves; virtualized list displays items with 44/48dp touch targets.
2. **Interactive Mutation Flow:** User triggers an action (create, edit, or toggle); form validates via Zod schema; submit button shows loading indicator without layout shift; query cache updates pessimistically or authoritatively.
3. **Destructive & Reset Flow:** Destructive actions trigger a confirmation bottom sheet or modal with explicit consequence explanation before proceeding.

## 4. API Contract & UI Data Requirements
| Function | Method | Endpoint | Request Shape | Response `data` type |
|---|---|---|---|---|
| `fetchUserProfile()` | GET | `/api/v1/user/settings/profile` | `—` | `UserProfile` |
| `updateUserProfile(dto)` | PATCH | `/api/v1/user/settings/profile` | `UpdateProfileDto` | `UserProfile` |
| `submitFeedback(dto)` | POST | `/api/v1/user/settings/feedback` | `FeedbackDto` | `{ success: boolean }` |

## 5. Query Key Registry & Server State
All query keys are strictly registered in `api/user_settings.query_keys.ts` to prevent collisions and support fine-grained invalidation:
```typescript
export const USER_SETTINGS_QUERY_KEYS = {
  all: ['frontend_user', 'user_settings'] as const,
  lists: () => [...USER_SETTINGS_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...USER_SETTINGS_QUERY_KEYS.all, 'detail', id] as const,
};
```

## 6. Mutation Inventory & Lifecycle Operations
| Mutation Action | HTTP Method | Target Endpoint | Payload DTO | Idempotency Key? | Cache Invalidation Target |
|---|---|---|---|---|---|
| Update Profile | PATCH | `/api/v1/user/settings/profile` | `UpdateProfileDto` | No | `USER_SETTINGS_QUERY_KEYS.profile()` |
| Submit Feedback | POST | `/api/v1/user/settings/feedback` | `FeedbackDto` | Yes (UUIDv4) | `USER_SETTINGS_QUERY_KEYS.feedback()` |

## 7. Permissions and Role Rules
- **Role Requirement:** `FRONTEND_USER`
- **Destructive Operations:** Permanent deletion or data wiping requires explicit confirmation dialog.
- **Data Protection:** Personal identification details are masked in list representations via `maskSensitiveData()`.

## 8. State Ownership & Architecture Flow
- **Server Data:** TanStack Query v5 cache.
- **Client Transient UI State:** `user_settings.store.ts` via Zustand (modal open states, active tab filters).
- **Navigation State:** Native stack params passed via React Navigation.
- **Secure Credentials:** Hardware secure storage via `react-native-keychain` (auth tokens, PIN codes).

## 9. Offline, Loading, Empty, and Error States
| Section | Loading State | Empty State | Error State |
|---|---|---|---|
| Main View | `UserSettingsSkeleton.tsx` (layout-mimicking shimmer) | `UserSettingsEmptyState.tsx` (icon, message, CTA) | `UserSettingsErrorFallback.tsx` (localized retry action) |

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
- **Harness:** `tests/harness/UserSettingsHarness.tsx` (standalone mounting)
- **Unit & Integration:** `tests/user_settings.test.tsx` verifying behavioral user journeys
- **Maestro E2E:** `mobile_e2e/user_settings_crud.yaml` covering critical user flows
- **Mock Scenarios:** 5 canonical scenarios in `mocks/user_settings.scenarios.ts` (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)

## 17. Architecture Exceptions (ADRs)
| Decision | Chosen Approach | Rationale | Status |
|---|---|---|---|
| Offline First | Local storage cache + Query syncing | Guarantees instant sub-100ms response time on mobile devices | Approved |
| Token Source | Pure `useThemeTokens()` consumption | Enforces strict Luxury Gold styling without web CSS dependencies | Approved |

## 18. Known Contract Gaps & Bug Log

This module is **NOT production-verified**. Existing source and the current repair branch evidence these open items:

- [PATCHED ON REPAIR BRANCH] `clearCompleted` no longer calls the legacy `clearTodos('completed')` operation, which ignored the argument and could delete every task. It now targets only completed tasks not already in Trash and requires explicit confirmation at the UI.
- [PATCHED ON REPAIR BRANCH] The previous “Reset All Data” label was inaccurate: the callback only emptied Trash. The UI now calls it “Empty Trash Permanently” and explains the limited scope in a confirmation dialog.
- [PATCHED ON REPAIR BRANCH] Backup uses the native Share UI and no longer reports success if the share operation is dismissed. Restore now accepts JSON backup input, narrows records to task fields, previews accepted record count, and requires confirmation for merge/replace.
- [PATCHED ON REPAIR BRANCH] Sample personal details and fabricated profile statistic fallbacks were removed from the Settings and Profile screens. Current streak derives from persisted task completion dates rather than from the number of completed tasks.
- The Settings feature still imports legacy global Settings/Auth/AppLock/Todo contexts, violating the autonomous-sub-module boundary (Rule 28).
- Restore uses a local structural parser because the mandated Zod dependency is not declared directly and no install/test runner was available. Migrate the validator to the approved RHF + Zod stack after package/lockfile repair.
- The backup/restore and destructive-action source changes have not been executed in Jest, typechecked, or exercised on device. Add behavioral tests for completed-only deletion, restore merge/replace, Share dismissal, parse failures, and profile-update failures.
- Five scenario JSON files exist but are not connected to functioning MSW handlers; module tests/harness and API/query/mutation paths are not demonstrated end-to-end.
- Locale files remain incomplete/misnamed relative to Rule 61, and user-visible strings are still hardcoded.
- Documentation claims about API/query state, offline support, dependency manifest, 8/8 portability and rule compliance must be reconciled against actual source before this feature may be considered complete.

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
- **Harness Entry:** `tests/harness/UserSettingsHarness.tsx`
- **Bootstrap Launcher:** `mocks/standalone/bootstrap.ts` -> `bootstrapUserSettings()`
- **Test Scenarios:** 5 canonical presets (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)
- **Execution Command:** Mount `UserSettingsHarness` inside test runner or preview container in isolation

## 21. Module Portability & Host Integration Guide
1. **Directory Transfer:** Copy `src/features/frontend_user/user_settings/settings_profile` directly into any target React Native bare-metal codebase.
2. **Core Plumbing Verification:** Ensure host supplies `src/core/theme/useThemeTokens.ts`, `src/core/utils/displayValue.ts`, and `src/core/utils/maskSensitiveData.ts`.
3. **Route Mounting:** Register screen routes from `config/user_settings.url_config.ts` into the root navigation container.
4. **Standalone Verification:** Invoke `bootstrapUserSettings()` to run the module in 100% offline mock mode before wiring production endpoints.

## 22. Deliverables & Version History (Portability Score — NOT VERIFIED)
- **Version:** 1.0.0
- **Portability Score:** NOT VERIFIED. Legacy host contexts remain imported, declared dependencies and API/query wiring are incomplete, scenario handlers/tests are not demonstrated, and host runtime verification has not been run.
