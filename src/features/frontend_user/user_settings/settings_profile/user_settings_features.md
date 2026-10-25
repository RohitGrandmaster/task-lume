# Sub-Module Feature Specification: User Settings Profile (`user_settings_settings_profile`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_settings`
- **Sub-module:** `settings_profile`
- **Scope:** App lock security (Keychain biometrics/passcode), Dark/Light theme switching, notification preferences, legal info, developer profile.
- **Non-Scope:** Task editing (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserSettingsScreen.tsx`: Thin screen (≤80 lines) composing `UserSettingsMainView`.
- Components:
  - `UserSettingsMainView.tsx`: Settings list, toggles, profile card, app lock trigger.

## 3. Navigation Contract & User Flows
- Mounted in drawer / bottom tab.

## 4. API Contract & UI Data Requirements
- User profile & preferences state.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'settings']`

## 6. Mutation Inventory & Lifecycle Operations
- Update theme, toggle biometrics lock, update preferences.

## 7. Permissions and Role Rules
- Biometrics / Keychain hardware permissions.

## 8. State Ownership & Architecture Flow
- Local persistence via `react-native-keychain` and `storage.js`.

## 9. Offline, Loading, Empty, and Error States
- 100% offline-first.

## 10. Security and PII Rules
- PIN and biometric state strictly stored in hardware Keychain (Rule 6). PII masking on user email/phone.

## 11. Accessibility Requirements (A11y)
- Accessible switch states (`accessibilityRole="switch"`, `accessibilityState={{ checked }}`); touch targets ≥ 44/48.

## 12. Background Tasks & Realtime Events
- None.

## 13. Feature Flags & Tenant Settings
- All settings enabled.

## 14. Cache Invalidation & Consistency
- Persisted immediately upon switch toggle.

## 15. Migration, Rollback & Edge Cases
- Safe fallback when biometrics are not enrolled on device.

## 16. Test Coverage Map & Quality Gates
- Theme toggle and lock toggle tests.

## 17. Architecture Exceptions (ADRs)
- None.

## 18. Known Contract Gaps & Bug Log
- None.

## 19. Rule Compliance Checklist
- [x] Canonical role prefix (`frontend_user`)
- [x] Thin screen composition (≤80 lines)
- [x] Zero cross-feature imports
- [x] Luxury Premium Gold theme tokens
- [x] Hardware Secure Storage via Keychain (Rule 6)

## 20. Standalone Run, Mock & Test Harness
- Mounts standalone with mock preferences.

## 21. Module Portability & Host Integration Guide
- Mount `UserSettingsScreen` directly in parent navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
