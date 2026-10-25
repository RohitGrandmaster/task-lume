# TaskLume Mobile — Document-Driven Audit & Repair Plan

**Base branch:** `development`  
**Working branch:** `development` (explicit user-approved target; no separate repair branch)  
**Normative documents:** `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md` and `MOBILE_UI_UX_DESIGN.md`  
**Execution status:** IN PROGRESS — no release/compliance PASS is asserted.

## Authority and verification policy
1. Security/privacy and platform accessibility take precedence over implementation conventions.
2. Architecture rules govern module boundaries, API/data contracts, tests, and delivery gates.
3. The UI/UX document governs tokens, touch targets, motion, localization, and accessibility visuals.
4. Runtime/device requirements remain `DEFERRED_TO_HOST_RUNTIME` until emulator/device evidence exists.
5. Missing backend/API/product contracts are recorded as `CONTRACT_MISSING` or `BLOCKED_BY_SUPPLIED_CONTRACT`; behavior will not be invented.
6. The user explicitly requires all code fixes directly on `development`; core-infrastructure changes are called out separately. Do not create or switch to a repair branch.

## Repair batches (Rule 67 RBG sequence)

| Batch | Priority | Scope | Intended closure evidence | Status |
|---|---|---|---|---|
| RBG 1 | P0 | Build/type/API contract blockers; false audit claims; first isolated compile repairs | Source diff review, dependency/lockfile consistency, typecheck where runner exists | IN PROGRESS |
| RBG 2 | P0/P1 | Todo destructive actions and action idempotency/confirmation behavior | Confirm/cancel tests; deletion only after confirmation; observable state update | IN PROGRESS — confirmation source and behavioral tests added; runner unavailable |
| RBG 3 | P1 | Settings/profile hardcoded data, backup/import/export semantics and feedback | Real operation outcome tests; no fabricated success or personal-data fallback | IN PROGRESS |
| RBG 4 | P1 | Overview metric correctness and reminder snooze scheduling | Real completion timestamps now drive activity/streak; focus totals no longer fabricated; reminder snooze sheet updates local schedule. Four source test cases added; execution and device checks remain open. | IN PROGRESS |
| RBG 5 | P1 | Theme token synchronization, touch-target, accessibility and reduced motion | Static token/contrast/accessibility checks and device evidence where needed | IN PROGRESS |
| RBG 6 | P1/P2 | Functional tests, docs and native runtime gates | Source tests added for Todo, Settings, Overview, Reminders, Calendar and Voice; none executed. Device/native scheduler verification deferred. | IN PROGRESS |
| RBG 7 | P1/P2 | Feature boundaries, localization, CI and final cross-check | Canonical documentation trios and en/hi locale resources added; translation provider and Accept-Language wired; localization remains partial; dependencies, feature isolation, executable mocks, CI and Rule 67G tables remain open. | IN PROGRESS |
| Final cross-check | Release gate | All modules, rules, file sizes, 14 delivery gates, Rule 67G reconciliation | Every finding has evidence, resolution, or explicit external/runtime blocker | NOT STARTED |

## RBG 1 — Current finding ledger

| ID | Finding | Source evidence | Repair / disposition | Status |
|---|---|---|---|---|
| P0-001 | Pomodoro hook called timer actions/state missing from its Zustand store interface, while the actual timer screen held a separate local timer implementation. | `src/features/frontend_user/user_pomodoro/pomodoro_timer/hooks/useUserPomodoro.ts`; `components/UserPomodoroTimerMainView.tsx`; `state/user_pomodoro.store.ts` | Moved countdown lifecycle into the module hook and wired the timer view to that hook; no API/session persistence was invented. | SOURCE PATCHED; runtime/typecheck pending |
| P0-002 | Project documents claimed complete compliance despite source evidence of failing contracts and missing gates. | `RE_AUDIT_CHECKLIST_RESULT.md` | Replace unsubstantiated PASS claims with an evidence-backed active ledger. | IN PROGRESS |
| P0-003 | Package manifest omits packages imported by feature code and named as mandatory in the docs; lockfile/build consistency must be checked before changing dependency manifests. | `package.json`; `src/features/**/state/*.store.ts`; `schemas/*.schema.ts`; normative Rules 5, 22 | Resolve with package-manager-generated, lockfile-consistent change; never hand-edit transitive lock entries. | OPEN |
| P0-004 | Canonical API response envelope and pagination shape did not match the normative type contract. | `src/core/network/apiResponse.types.ts`; `src/core/network/networkClient.ts` | Updated the discriminated response union, pagination fields, request IDs/status/error codes, validation-error normalization, safe error messages, timeout cleanup, and optional mutation idempotency header. Base URL and trusted auth/tenant context remain unverified and must not be invented. | SOURCE PATCHED; dependent-consumer/typecheck review OPEN |
| P0-005 | Standalone Todo/Pomodoro harnesses claim scenario bootstrapping but do not wire scenario-driven handlers and can render required-prop components incorrectly. | `user_todos/mocks/standalone/bootstrap.ts`; `user_todos/tests/harness/UserTodosHarness.tsx`; corresponding Pomodoro files | Add functioning harness wiring and props only after dependencies and source contracts are aligned. | OPEN |

## Required closure rules
- Never mark a feature complete because its folder, docs, mocks, or tests merely exist.
- Every API-driven state must be traced from contract → types/schema → fixture/handler → query/mutation → visible UI.
- Test files must assert observable behavior, not just mount/render.
- Update a feature's `_features.md`, `_forbidden.md`, and `_theme_contract.md` when the relevant rule or contract changes.
- Preserve the original product features; no feature removal or broad rewrite without evidence.
- Final compliance status stays `REPAIR_REQUIRED` until all source-level findings are repaired and checked. Runtime-only checks must be explicitly deferred rather than falsely passed.
