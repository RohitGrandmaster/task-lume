# Sub-Module Feature Specification: User Voice Memos (`user_voice_voice_memos`)

## 1. Scope and Non-Scope (Module Purpose, System Context & Dependencies)
User Voice Memos is a mission-critical, enterprise-grade autonomous sub-module within the `frontend_user` mobile application container. It solves the core productivity needs for end-users by providing isolated, robust, and luxury-styled mobile capabilities. The user persona is the active authenticated mobile user who relies on instant offline capability, deterministic local storage, and responsive UI feedback. This sub-module strictly avoids cross-domain business coupling and adheres to Rule 28 (Strict WET Principle).

### Feature Ownership & System Context
- **Feature / Role Owner:** Mobile Frontend User Experience Team (`frontend_user`)
- **Backend Microservice / API Base:** `/api/v1/user/voice`
- **Authoritative Database Tables:** Local MMKV / SQLite / Keychain storage and synced REST entities
- **Background / Queued Jobs:** Notifee alarm scheduler, local background audio sessions, secure keychain sync

### Dependency Manifest
- **State Pattern:** TanStack Query v5 (server data) + Zustand client store (`user_voice.store.ts`)
- **Form & Validation:** React Hook Form v7 + Zod schemas (`user_voice.schema.ts`)
- **Icons & Native Primitives:** `lucide-react-native` + React Native Bare-Metal / Reanimated
- **Design Tokens:** Pure consumption of Luxury Premium Gold Theme Tokens via `useThemeTokens()`

### Autonomous Sub-Module Directory Structure
| Folder | Responsibility | Key Files |
|---|---|---|
| `screens/` | Thin screen orchestrators (≤80 lines, zero business logic) | `UserVoiceScreen.tsx` |
| `components/` | Presentational UI components and bottom sheets (≤200 lines) | `UserVoiceMainView.tsx`, `UserVoiceAudioRecorder.tsx`, `UserVoiceMemoCard.tsx`, `UserVoiceSkeleton.tsx`, `UserVoiceEmptyState.tsx`, `UserVoiceErrorFallback.tsx` |
| `hooks/` | Domain query, mutation, and interaction hooks (≤150 lines) | `useUserVoice.ts` |
| `api/` | API endpoints and central query keys registry | `user_voice.api.ts`, `user_voice.query_keys.ts` |
| `state/` | Feature-scoped Zustand store for UI state (≤180 lines) | `user_voice.store.ts` |
| `schemas/` | Zod validation schemas for forms and payloads | `user_voice.schema.ts` |
| `types/` | TypeScript types and navigation param lists | `user_voice.types.ts` |
| `config/` | Centralized URL and route config constants | `user_voice.url_config.ts` |
| `mocks/` | Scenarios, fixtures, and standalone harness bootstrap | `user_voice.scenarios.ts`, `bootstrap.ts` |
| `tests/` | Integration tests and standalone harness container | `UserVoiceHarness.tsx`, `user_voice.test.tsx` |

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
| UserVoiceScreen | `USER_VOICE_ROUTES.MEMOS` | Record/play local voice memos, add manual transcript/notes, convert notes into tasks | `UserVoiceMainView.tsx`, `UserVoiceAudioRecorder.tsx`, `UserVoiceMemoCard.tsx` | Local audio files + local metadata; existing Todo task handler | PARTIAL — local recording/playback restored; automatic speech-to-text and remote sync contract missing |

### Component Responsibility Map
| Component File | Responsibility |
|---|---|
| `UserVoiceMainView.tsx` | Composes recorder controls, transcript preview, and persisted memos list |
| `UserVoiceAudioRecorder.tsx` | Interactive mic button with pulse animation and audio timer |
| `UserVoiceMemoCard.tsx` | Memo card with duration, play/pause, and Convert to Task CTA |
| `UserVoiceSkeleton.tsx` | Layout-mimicking shimmer for voice memos list |
| `UserVoiceEmptyState.tsx` | Empty state illustration when no voice recordings exist |
| `UserVoiceErrorFallback.tsx` | Error state card with mic permission recovery link |

## 3. Navigation Contract & User Flows
All routes are strongly typed with explicit navigation param lists defined in `types/user_voice.types.ts` and `config/user_voice.url_config.ts`. Screen wrappers extract typed params via `RouteProp` without direct business state mutations.

### Key User Flows
1. **Primary Browse & Inspection:** User accesses the sub-module through native stack navigation; screen renders loading skeleton while cache resolves; virtualized list displays items with 44/48dp touch targets.
2. **Interactive Mutation Flow:** User triggers an action (create, edit, or toggle); form validates via Zod schema; submit button shows loading indicator without layout shift; query cache updates pessimistically or authoritatively.
3. **Destructive & Reset Flow:** Destructive actions trigger a confirmation bottom sheet or modal with explicit consequence explanation before proceeding.

## 4. API Contract & UI Data Requirements
| Function | Method | Endpoint | Request Shape | Response `data` type |
|---|---|---|---|---|
| `fetchVoiceMemos()` | GET | `/api/v1/user/voice/memos` | `—` | `VoiceMemoItem[]` |
| `saveVoiceMemo(dto)` | POST | `/api/v1/user/voice/memos` | `SaveVoiceMemoDto` | `VoiceMemoItem` |
| `deleteVoiceMemo(id)` | DELETE | `/api/v1/user/voice/memos/:id` | `—` | `{ success: boolean }` |

## 5. Query Key Registry & Server State
All query keys are strictly registered in `api/user_voice.query_keys.ts` to prevent collisions and support fine-grained invalidation:
```typescript
export const USER_VOICE_QUERY_KEYS = {
  all: ['frontend_user', 'user_voice'] as const,
  lists: () => [...USER_VOICE_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...USER_VOICE_QUERY_KEYS.all, 'detail', id] as const,
};
```

## 6. Mutation Inventory & Lifecycle Operations
| Mutation Action | HTTP Method | Target Endpoint | Payload DTO | Idempotency Key? | Cache Invalidation Target |
|---|---|---|---|---|---|
| Save Recording | POST | `/api/v1/user/voice/memos` | `SaveVoiceMemoDto` | Yes (UUIDv4) | `USER_VOICE_QUERY_KEYS.memos()` |
| Delete Recording | DELETE | `/api/v1/user/voice/memos/:id` | `—` | No | `USER_VOICE_QUERY_KEYS.memos()` |

## 7. Permissions and Role Rules
- **Role Requirement:** `FRONTEND_USER`
- **Destructive Operations:** Permanent deletion or data wiping requires explicit confirmation dialog.
- **Data Protection:** Personal identification details are masked in list representations via `maskSensitiveData()`.

## 8. State Ownership & Architecture Flow
- **Server Data:** TanStack Query v5 cache.
- **Client Transient UI State:** `user_voice.store.ts` via Zustand (modal open states, active tab filters).
- **Navigation State:** Native stack params passed via React Navigation.
- **Secure Credentials:** Hardware secure storage via `react-native-keychain` (auth tokens, PIN codes).

## 9. Offline, Loading, Empty, and Error States
| Section | Loading State | Empty State | Error State |
|---|---|---|---|
| Main View | `UserVoiceSkeleton.tsx` (layout-mimicking shimmer) | `UserVoiceEmptyState.tsx` (icon, message, CTA) | `UserVoiceErrorFallback.tsx` (localized retry action) |

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
- **Harness:** `tests/harness/UserVoiceHarness.tsx` (standalone mounting)
- **Unit & Integration:** `tests/user_voice.test.tsx` verifying behavioral user journeys
- **Maestro E2E:** `mobile_e2e/user_voice_crud.yaml` covering critical user flows
- **Mock Scenarios:** 5 canonical scenarios in `mocks/user_voice.scenarios.ts` (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)

## 17. Architecture Exceptions (ADRs)
| Decision | Chosen Approach | Rationale | Status |
|---|---|---|---|
| Offline First | Local storage cache + Query syncing | Guarantees instant sub-100ms response time on mobile devices | Approved |
| Token Source | Pure `useThemeTokens()` consumption | Enforces strict Luxury Gold styling without web CSS dependencies | Approved |

## 18. Known Contract Gaps & Bug Log

This feature is **PARTIALLY IMPLEMENTED and NOT production-verified**.

- [PATCHED ON DEVELOPMENT] Replaced the fabricated transcript with real `react-native-nitro-sound` recording/playback, app-private audio files, and AsyncStorage metadata. Users can add transcript/notes manually and convert non-empty text into a task.
- [PATCHED ON REPAIR BRANCH] Fixed the screen's undefined `saveVoiceMemo` destructuring; the hook exports `saveAsTask`, validates non-empty input, and only reports success after a task-creation handler is available.
- The existing `@react-native-voice/voice` dependency upstream repository was archived in January 2026; do not re-enable it without a verified New Architecture/host compatibility exception and security/privacy review.
- No approved replacement speech-recognition dependency or centralized microphone/recognition permission contract is present. This product decision is `EXTERNAL_PRODUCT_DECISION_BLOCKED`; a true recording/transcription flow must not be invented.
- `user_voice.api.ts` currently exposes only `fetchMemos`; documented save/delete endpoint functions, server-side idempotency and a verified API schema are absent.
- Automatic speech-to-text is not implemented because there is no approved speech-recognition backend/native engine contract. Manual transcript/notes are explicit, never presented as generated transcription. Remote voice memo API sync/delete remain unimplemented pending verified response contracts.
- Scenario JSON files are not connected to executable MSW handlers; no feature behavior tests or runtime/device verification have passed.
- Token-only styling, localization, complete accessible/testID coverage, native microphone permission-denial UX and audio privacy/retention policy remain open.

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
- **Harness Entry:** `tests/harness/UserVoiceHarness.tsx`
- **Bootstrap Launcher:** `mocks/standalone/bootstrap.ts` -> `bootstrapUserVoice()`
- **Test Scenarios:** 5 canonical presets (ACTIVE, EMPTY, SERVER_ERROR, TIMEOUT, UNAUTHORIZED)
- **Execution Command:** Mount `UserVoiceHarness` inside test runner or preview container in isolation

## 21. Module Portability & Host Integration Guide
1. **Directory Transfer:** Copy `src/features/frontend_user/user_voice/voice_memos` directly into any target React Native bare-metal codebase.
2. **Core Plumbing Verification:** Ensure host supplies `src/core/theme/useThemeTokens.ts`, `src/core/utils/displayValue.ts`, and `src/core/utils/maskSensitiveData.ts`.
3. **Route Mounting:** Register screen routes from `config/user_voice.url_config.ts` into the root navigation container.
4. **Standalone Verification:** Invoke `bootstrapUserVoice()` to run the module in 100% offline mock mode before wiring production endpoints.

## 22. Deliverables & Version History (Portability Score — NOT VERIFIED)
- **Version:** 1.0.0
- **Portability Score:** NOT VERIFIED. Voice capture is blocked, API/mock/test wiring is incomplete, and device/runtime evidence is absent.
