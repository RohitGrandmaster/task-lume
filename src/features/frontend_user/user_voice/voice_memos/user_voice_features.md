# Sub-Module Feature Specification: User Voice Memos (`user_voice_voice_memos`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_voice`
- **Sub-module:** `voice_memos`
- **Scope:** Speech-to-text recording, audio playback, converting memos to tasks.
- **Non-Scope:** Text task storage (owned by `user_todos`).

## 2. Screen Inventory & Component Responsibility Map
- `UserVoiceScreen.tsx`: Thin screen (≤80 lines) composing `UserVoiceMainView`.
- Components:
  - `UserVoiceMainView.tsx`: Microphone button, transcript preview, convert-to-task CTA.

## 3. Navigation Contract & User Flows
- Mounted in drawer / bottom tab.

## 4. API Contract & UI Data Requirements
- Voice transcript state.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'voice']`

## 6. Mutation Inventory & Lifecycle Operations
- Start speech recognition, stop recognition, convert to task.

## 7. Permissions and Role Rules
- Microphone & Speech recognition permissions via `react-native-permissions` / `@react-native-voice/voice`.

## 8. State Ownership & Architecture Flow
- Local speech recognition event stream.

## 9. Offline, Loading, Empty, and Error States
- On-device speech recognition where supported.

## 10. Security and PII Rules
- Audio recordings stored locally; zero telemetry egress of voice audio.

## 11. Accessibility Requirements (A11y)
- Live speech-to-text preview with accessible announcements; touch targets ≥ 44/48.

## 12. Background Tasks & Realtime Events
- Real-time speech result callbacks.

## 13. Feature Flags & Tenant Settings
- Voice input enabled.

## 14. Cache Invalidation & Consistency
- Resets transcript on save.

## 15. Migration, Rollback & Edge Cases
- Handles microphone permission denial with informative fallback.

## 16. Test Coverage Map & Quality Gates
- Transcript conversion tests.

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
- Mounts standalone with mock transcript feed.

## 21. Module Portability & Host Integration Guide
- Mount `UserVoiceScreen` directly in parent navigator.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
