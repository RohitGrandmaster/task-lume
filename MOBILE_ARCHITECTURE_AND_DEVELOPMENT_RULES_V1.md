# React Native Mobile Development Instructions — Enterprise / Industry Scale

## Master Cross-Document Precedence Order

When instructions conflict across documents, apply this exact order of authority:

1. Security, privacy, legal, authorization, tenant isolation, and data-protection rules
2. Accessibility and platform-native safety requirements
3. Explicit user-approved scope and verified API contracts
4. `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md`
5. `MOBILE_UI_UX_DESIGN.md` for visual/token decisions
6. Execution workflow documents (when supplied: `FRONTEND_ROLE_MODULE_CREATE_AUDIT_REPAIR_V2_11.md` or standalone execution mode; when unsupplied, `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md` Section 67 serves as the self-contained authority) for audit sequencing, delivery artifacts, and reporting
7. Sub-module documentation trio (`[role]_[submodule]_features.md`, `[role]_[submodule]_forbidden.md`, `[role]_[submodule]_theme_contract.md`)
8. Existing implementation conventions

A lower-priority rule MUST NOT override a higher-priority rule.
Any unresolved conflict MUST be recorded as `BLOCKED_BY_SUPPLIED_CONTRACT` rather than resolved through invention.

## Canonical Rule Reference Policy

When a rule is repeated for convenience:
- The first named canonical section is authoritative;
- Repeated copies must link to or reference the canonical rule;
- Repeated copies must not redefine, weaken, or conflict with the canonical wording;
- Any conflicting duplicate wording is obsolete and must be removed during the next document revision.

---

> ⛔⛔⛔ **AI AGENT — MANDATORY ENFORCEMENT & INTEGRITY DIRECTIVE — READ FIRST** ⛔⛔⛔
>
> **COMPLIANCE FAILURE HANDLING (EVIDENCE-BASED REPAIR):**
> A compliance violation triggers a mandatory stop only for the affected workstream or file.
> The violation must be recorded, repaired, and rechecked before continuation.
> Non-dependent compliant workstreams MUST continue without interruption.
> Missing runtime/host capability is NEVER an architectural violation and MUST NOT cause execution to pause or stall (mark as `DEFERRED_TO_HOST_RUNTIME`).
> Previously verified and unaffected work remains valid and must not be discarded.
>
> On detecting a violation of any rule in this document, the AI MUST:
> 1. Stop the affected implementation path immediately;
> 2. Record the violated rule, affected file, and concrete evidence;
> 3. Repair the violation in source code before continuing downstream work;
> 4. Re-run relevant static compliance checks;
> 5. Mark the final status as compliant ONLY after file-level evidence is established.
> The AI MUST NOT silently continue after detecting a violation, and MUST NOT claim compliance without verifiable file evidence.
>
> This document is the **absolute normative authority for all mobile architectural, design system, and code repair behavior**.
>
> ⛔ **ARCHITECTURAL & UI COMPLETENESS MANDATE (MUST REPAIR & COMPLETE):**
> When mobile source code has incomplete forms, missing Zod validation schemas, missing modals, raw alerts (`Alert.alert`, `window.alert`), missing loading skeletons, missing empty states, unstyled buttons, or unhandled UI flows:
> - The AI **MUST ACTIVELY REPAIR, IMPLEMENT, AND COMPLETE THEM** using the Mobile Design System (`MOBILE_UI_UX_DESIGN.md`) and Architecture Rules.
> - Inappropriate alerts (`Alert.alert()`, single-click deletes) MUST be replaced with the mandated luxury `useConfirm()` dialogs or bottom sheets.
> - Forms MUST be fully wired with React Hook Form v7 + Zod v3 schemas and backend 400 validation error mapping.
> - UI modals, empty states, error boundaries, and loading skeletons MUST be fully authored and completed.
>
> ⛔ **ANTI-DESTRUCTION & PARTIAL FEATURE COMPLETION LAW (ZERO FEATURE EVICTION):**
> When mobile source code contains partially implemented, half-built, or incomplete features (e.g., an unfinished filter drawer, an unwired export button, a half-implemented modal, a partially authored API hook, or an incomplete multi-step form flow):
> - **ZERO FEATURE EVICTION (DO NOT DELETE):** The AI **MUST NOT** delete, remove, comment out, or strip away existing features, UI elements, buttons, form fields, modals, or business flows simply because they are half-built, incomplete, or currently causing type/test errors. Deleting half-built features to get a "clean audit pass" is strictly prohibited as DESTRUCTIVE MALPRACTICE.
> - **MANDATORY ADDITIVE COMPLETION (ADD & CORRECT):** The AI **MUST actively COMPLETE the missing half**: add missing types, wire up API queries/mutations, implement missing Zod schemas, author missing loading/empty/error states, connect handlers, and correct all syntax or architectural violations until the feature is 100% functional and architecture-compliant.
>
> ⛔ **STRICT BOUNDARY OF `CONTRACT_MISSING` (EXTERNAL DOMAIN SPECS ONLY):**
> `CONTRACT_MISSING` applies STRICTLY to **external business contracts that cannot be known from the code or architecture** (e.g., an unprovided external 3rd-party webhook secret, an unprovided backend API endpoint URL that has no specification, or an unknown financial tax formula).
> `CONTRACT_MISSING` **MUST NEVER BE USED AS AN EXCUSE** to leave source code incomplete, leave crude `Alert.alert()` calls in place, skip form validation, or fail to build proper UI dialogs/modals!
>
> ⛔ **DETERMINISTIC CONFIDENCE TAXONOMY & EVIDENCE STANDARD:**
> Every implementation decision, contract assertion, and audit claim MUST be classified into one of:
> - `VERIFIED`: Proven by supplied source file path, exact line reference, verified API contract, schema, or explicit architecture rule.
> - `DERIVED`: Deterministically derived from verified types/interfaces or architecture-mandated patterns (e.g. deriving a `useConfirm` modal from a raw `Alert.alert` violation).
> - `CONTRACT_MISSING`: External backend/business behavior or requirement not provided in supplied scope. The AI MUST NOT infer or guess external backend behaviors.
> - `ASSUMED`: Strictly PROHIBITED. Speculative guessing without architectural or contract foundation is an ARCHITECTURE FAILURE.
>
> **Valid Evidence:** Source file path, exact line reference, API contract, schema, mock fixture, repository config, or normative architecture rule.
> **Invalid Evidence (FORBIDDEN):** Speculative AI guessing, naming assumptions, generic industry patterns, or prior project habits.
>
> The following words in this document carry their STRICTEST possible meaning:
>
> | Word | Meaning |
> |------|---------|
> | **MUST** | Absolute requirement — no exception, no omission, no interpretation |
> | **MUST NOT** | Absolute prohibition — no exception under any circumstance |
> | **FORBIDDEN** | Same as MUST NOT — harder emphasis |
> | **REQUIRED** | Same as MUST — mandatory deliverable |
> | **encouraged** / **preferred** | Still a **default requirement** — deviations require explicit documented justification |
> | **Optional** (sub-folders) | Only optional when the feature **genuinely has no such artifact** — omitting when the artifact exists = VIOLATION |
> | **except** / **unless** | Only a valid escape when ALL stated conditions for the exception are explicitly met and documented |
>
> **RULES APPLY TO THE ENTIRE DOCUMENT.** An AI that reads only the first half of this document and produces output is producing INCOMPLETE and INVALID output. Audit against all currently numbered rules in `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md`, including the Mobile Delivery Freeze Gate and Definition of Done.
>
> ⛔ **BEFORE WRITING ANY CODE OR AUDIT FINDING, CONFIRM:**
> ```text
> [ ] Read complete MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md (all numbered rules, Delivery Freeze Gate, and Definition of Done)
> [ ] Read complete MOBILE_UI_UX_DESIGN.md (all 22 sections)
> [ ] Confirmed TECHNOLOGY BASELINE — React Native Bare-Metal (New Architecture / Fabric + TurboModules)
> [ ] CRITICAL MOBILE STRUCTURE GATE passed — folder tree verified before any deeper rule
> [ ] Canonical feature structure confirmed (src/features/frontend_{role}/{role}_{module}/)
> [ ] WET PRINCIPAL confirmed — zero cross-feature business imports, zero DRY shortcuts for business logic
> [ ] File size ceilings verified (Screen 80 lines, Component 200 lines, Hooks/API 150 lines, Store 180 lines, Util 120 lines)
> [ ] MOBILE DELIVERY FREEZE GATE & DEFINITION OF DONE loaded into context
> [ ] EXECUTIVE DIAMOND PROTOCOLS CONFIRMED (Anti-Deception ZIP Naming, 3-Table Cross-Check Gate, 1-Click Buttons, Clarification Modals, Roman Hinglish Telemetry, Workload Density)
> [ ] COMMUNICATION LANGUAGE CONFIRMED: Roman Hinglish (Strictly NO pure English conversational text/telemetry, NO Devanagari)
> ```
> **Failure to complete the above = mandatory compliance stop until evidence is established.**
>
> ⛔ **NO-PAUSE ON MISSING RUNTIME / HOST CAPABILITY (MANDATORY ANTI-STALL RULE):**
> Unavailability of a physical mobile device, Android/iOS emulator, Metro bundler, or Maestro E2E test runner is NEVER a reason to pause, stall, abort, or declare mobile code creation, audit, or repair "BLOCKED". The AI MUST fix every issue that can be resolved in source files (screens, components, custom hooks, Zustand stores, Zod schemas, URL configs, query key factories, MSW mock fixtures, documentation trio) in this session. Only live device/emulator execution or live Maestro runner execution is designated as `DEFERRED_TO_HOST_RUNTIME`. Missing runtime is strictly forbidden as a reason to pause.
> ⛔ **OFFLINE / STATIC SCORING DIRECTIVE:** When live mobile device or simulator execution is unavailable in the execution environment, ratings (1 to 10) MUST evaluate **Static Architecture & Code Completeness**. The AI MUST NOT penalize, artificially deduct points, or refuse to rate simply because a physical device or emulator is absent. State the Static Compliance Rating directly (up to 10.0), noting dynamic execution separately as `DEFERRED_TO_HOST_RUNTIME`.
> ⛔ **AI HALLUCINATION REDUCTION DISCIPLINE (80% TO <5% GOAL):**
> AI hallucination is never eliminated by wishful thinking; it is driven down from 80% to <5% strictly through immutable verified contracts, explicit Zod validation schemas, deterministic testIDs, exact typed API response envelopes, and strict forbidden boundaries. When an AI lacks verified contract evidence, guessing is strictly FORBIDDEN — mark as `CONTRACT_MISSING` or `BLOCKED_BY_SUPPLIED_CONTRACT`.
> ⛔ **THE 5-SECOND COMPREHENSION INVARIANT:**
> A new engineer or AI agent MUST understand the exact responsibility, dependencies, and boundary of any file or folder within 5 seconds of opening it. If understanding requires tracing spaghetti dependencies, inspecting sibling business folders, or decoding ambiguous abbreviations, the architectural isolation has FAILED.
>
> ⛔⛔⛔ **EXECUTIVE CANONICAL DIAMOND PROTOCOLS (MOBILE ARCHITECTURE)** ⛔⛔⛔
> The following diamond protocols are active from TURN 1 across ALL Mobile workflows:
> 1. **Anti-Deception ZIP Naming:** Intermediate archives MUST be labeled `mobile-{role}-v{N}-PARTIAL-rbg{X}.zip`. The label `mobile-{role}-v{N}-ALL-RBGS-COMPLETE.zip` is strictly forbidden unless 100% of RBGs (RBG 1..N) are closed and verified.
> 2. **Pre-Delivery Cross-Check Gate (Zero-Excuse Law):** Must execute and output the 3 physical verification tables (Section 67G) before packaging. Post-delivery excuses ("Oh sorry, cross-check nahi kiya") are strictly banned as P0 audit fraud.
> 3. **1-Click Interactive Button Priority:** Publish RBG Plans and Checkpoints as actionable artifacts (`RequestFeedback: true`) or modals (`ask_question`) so user can approve via 1-click button instead of manual typing.
> 4. **Interactive Clarification Modal with (Recommended) Default:** All questions/decisions MUST use structured modals/checkboxes with Option 1 marked `(Recommended)`. Zero open-ended technical essay questions.
> 5. **Live Progress Heartbeat Telemetry in Roman Hinglish (STRICT ZERO-ENGLISH BAN):** Output real-time non-blocking progress lines (`✓ [Done]: ... ⚙️ [In Progress]: ...`) strictly in Roman Hinglish (English letters, NO Devanagari). PURE ENGLISH CHAT/TELEMETRY IS STRICTLY BANNED AS A FORMAT VIOLATION. (Example: `✓ [Done]: Mobile screen touch targets aur hook-form Zod mapping complete ho gaya. ⚙️ [In Progress]: Abhi Maestro E2E test suite verify kar raha hoon.`). Code identifiers, file paths, and syntax remain in English.
> 6. **Substantive Workload Density:** Calibrate RBGs by workload floor (min 8 findings / 4 files) and safety ceiling (max 25 findings / 18 files) for a balanced ~5–8 min sprint without token blowouts or hallucinations.

## CRITICAL MOBILE STRUCTURE GATE (NON-NEGOTIABLE)

> ⛔ **STRUCTURE INVARIANT & REPAIR PROTOCOL:**
> - **In Audit Mode:** Failing ANY item = ARCHITECTURE FAILURE. Record `NON_COMPLIANT` with file and line evidence.
> - **In Repair Mode:** Structural violations (folder layout, thin screens, component naming, missing documentation trio) **MUST BE ACTIVELY REPAIRED FIRST (in RBG 1)** before repairing inner feature code.
> - **ANTI-STALL DIRECTIVE:** Structural non-compliance is the reason repair is required — it is **STRICTLY FORBIDDEN** to use structural violations as an excuse to halt, stall, refuse to repair, or declare code repair impossible.

Before generating, auditing, or repairing ANY mobile feature module, verify ALL of the following:

| Verification Item | Requirement | Consequence of Failure |
|---|---|---|
| **Role Container & Canonical Path** | Must be `src/features/frontend_{role}/` (e.g., `src/features/frontend_admin/`), containing `{role}_{domain}/{domain}_{capability}/`. React Native mobile modules reside strictly under `src/features/frontend_{role}/`, NEVER under `src/app/mobile_{role}/` or root `src/screens/`. | Unprefixed role container or wrong root path = ARCHITECTURE VIOLATION. In repair: move to canonical prefix in RBG 1. |
| **Canonical Feature Module** | Must be `src/features/frontend_{role}/{role}_{module}/` (e.g., `src/features/frontend_manager/manager_members/`) — path MUST start with `src/features/` and module MUST be prefixed with role name | Unprefixed or wrong-path placement = NON_COMPLIANT. In repair: relocate and rename in RBG 1. |
| **Thin Screen Composition** | Screens in `screens/` MUST only compose components; hard ceiling **80 lines** (zero exceptions); ZERO business logic, state calculations, or direct API calls. Screen renders `<SafeAreaView>`, `<StatusBar>`, extracts route params, and renders ONE `[Role][Module][Screen]MainView.tsx` component. | Heavy screen or logic in screen = ARCHITECTURE VIOLATION. In repair: extract to MainView component in RBG 1. |
| **Prefixed Component Files** | Components in `components/` MUST use PascalCase with **Role+Module** prefix (e.g., `ManagerMembersMemberCard.tsx`, NOT `MembersMemberCard.tsx`). Hard ceiling **200 lines** (exceeding requires `// architecture-exception: <reason>` and entry in `_features.md`). | Unprefixed component or undocumented >200 lines = NON_COMPLIANT. In repair: rename to Role+Module prefixed in RBG 1. |
| **Feature Custom Hooks** | Hooks in `hooks/` MUST use camelCase with `use` + **Role+Module** name (e.g., `useManagerMembers.ts`, `useManagerMembersFilters.ts`). Hard ceiling **150 lines** (exceeding requires `// architecture-exception: <reason>` and entry in `_features.md`). | Generic hook name or undocumented >150 lines = NON_COMPLIANT. In repair: rename to Role+Module hook in RBG 1. |
| **Root Quarantine** | Feature domain root (`src/features/frontend_{role}/{role}_{module}/`) contains ONLY `screens/Manager[Domain]Navigator.tsx` (pure navigation shell) and autonomous sub-module directories `{submodule}/`. 100% of feature business code lives inside autonomous sub-modules. Inside each autonomous sub-module, the sub-module root contains ONLY canonical subfolders (`screens/`, `components/`, `hooks/`, `api/`, `state/`, `types/`, `schemas/`, `mocks/`, `utils/`, `tests/`, `_locales/`, `config/`) and the Documentation Trio (`[role]_[submodule]_features.md`, `[role]_[submodule]_forbidden.md`, `[role]_[submodule]_theme_contract.md`). Route screens live strictly inside `screens/`, never loose at sub-module root. | Any business code in domain root or loose screen/code file at sub-module root = NON_COMPLIANT. In repair: move to correct subfolder in RBG 1. |
| **Central Hardware Secure Storage** | Auth tokens, refresh tokens, biometric keys MUST use iOS Keychain / Android Keystore via `react-native-keychain`. NEVER `AsyncStorage`. | Tokens in AsyncStorage = CRITICAL SECURITY AUDIT FAILURE. In repair: replace with `react-native-keychain` wrapper in RBG 1. |
| **Sub-Module Documentation Trio** | Every autonomous sub-module MUST contain `[role]_[submodule]_features.md` (with all 22 canonical sections, Section 20 Standalone Harness, Section 21 Portability Guide), `[role]_[submodule]_forbidden.md`, and `[role]_[submodule]_theme_contract.md`. | Missing doc artifact = INCOMPLETE MODULE. In repair: generate missing docs from source in RBG 1. |
| **Centralized URL Config** | `config/[role]_[submodule].url_config.ts` MUST exist inside each sub-module and define all routes and API endpoints as `as const`. | Missing URL config = HARDCODED ROUTE RISK. In repair: generate centralized URL config in RBG 1. |
| **Query Key Registry** | `api/[role]_[submodule].query_keys.ts` or `config/[role]_[submodule].query_keys.ts` MUST exist and namespace all TanStack Query keys with resource identity. | Missing query key factory = CACHE INCONSISTENCY RISK. In repair: create query key registry in RBG 1. |
| **Zero Cross-Feature Imports** | A feature MUST NOT import business components, hooks, or state from sibling features. | Sibling import = VIOLATION OF RULE 28 (WET PRINCIPAL). In repair: duplicate the required business artifact locally inside the owning feature module (Strict WET Principal) in RBG 1. Moving business logic to `src/core/` is STRICTLY FORBIDDEN. |
| **No Barrel Files** | Runtime business code barrel files (`index.ts`, `*Export.ts`, re-export facades) are strictly prohibited across all feature sub-modules. All imports must be direct paths (`@/...`). (Ambient type definitions like `host-stubs.d.ts` are declarations, not runtime business barrels). | Barrel file = CIRCULAR DEPENDENCY RISK. In repair: remove barrel files and update imports in RBG 1. |

> ⛔ **ANTI-INVENTION LAW FOR SUB-MODULE DOCUMENTATION TRIO (22 CANONICAL SECTIONS):**
> Generated documentation (`[role]_[submodule]_features.md`, `_forbidden.md`, `_theme_contract.md`) MUST describe ONLY verified source code, supplied API contracts, or verified fixtures. For any unverified, unprovided, or missing business requirement, the AI MUST explicitly mark that section as `CONTRACT_MISSING` or `DEFERRED_TO_HOST_SPECIFICATION`. Hallucinating or inventing imaginary API endpoints, mock schemas, or role permissions to make documentation look "complete" is strictly prohibited as P0 Audit Fraud.
>
> ⛔ **Skipping this gate invalidates all downstream compliance results.**

---

This document defines the canonical architecture and development rules for a React Native bare-metal application. React Native is the normative implementation target for this project. Use React Native New Architecture (Fabric + TurboModules). No alternative framework is part of the normative implementation rules. React Native bare-metal is the only supported implementation target.

---

## BARE-METAL REACT NATIVE — LOCKED NPM PACKAGE REGISTRY

> ⛔ **AI AGENTS: Only packages listed in this registry may be directly imported.**
>
> Any package not listed requires explicit human approval before installation or import.
>
> The feature's `_features.md` MUST document:
> - the approval reference;
> - business justification;
> - New Architecture compatibility impact;
> - security review outcome;
> - intended scope.
>
> Documentation alone does not authorize a dependency.
>
> Expo packages (`expo-*`, `@expo/*`) are STRICTLY FORBIDDEN in bare-metal projects unless the specific package is listed below.

| Category | Approved Package | Notes |
|---|---|---|
| **Navigation** | `@react-navigation/native` | Core navigation |
| **Navigation** | `@react-navigation/native-stack` | Native stack navigator |
| **Navigation** | `@react-navigation/bottom-tabs` | Bottom tab navigator |
| **Navigation** | `@react-navigation/drawer` | Drawer navigator |
| **Safe Area** | `react-native-safe-area-context` | SafeAreaView + useSafeAreaInsets |
| **Screens** | `react-native-screens` | Required by React Navigation |
| **Lists** | `@shopify/flash-list` | Virtualized lists (preferred over FlatList for >20 items) |
| **Images** | `react-native-fast-image` | Cached, optimized image loading |
| **Haptics** | `react-native-haptic-feedback` | Haptic feedback (NOT expo-haptics) |
| **Permissions** | `react-native-permissions` | All device permissions (NOT expo-permissions) |
| **Icons** | `lucide-react-native` | 100% icon symmetry with Web (lucide-react) |
| **Bottom Sheet** | `@gorhom/bottom-sheet` | Native bottom sheets |
| **Date Picker** | `@react-native-community/datetimepicker` | Platform-native date/time picker |
| **Secure Storage** | `react-native-keychain` | iOS Keychain / Android Keystore — auth tokens ONLY |
| **Fast Storage** | `react-native-mmkv` | Non-sensitive prefs and cache |
| **Charts** | `react-native-gifted-charts` | All charts — canonical library |
| **Animations** | `react-native-reanimated` | UI-thread animations |
| **Gestures** | `react-native-gesture-handler` | Swipe/pan/pinch gestures |
| **Server State** | `@tanstack/react-query` | TanStack Query v5 |
| **Client State** | `zustand` | Feature-scoped stores |
| **Forms** | `react-hook-form` | v7 only |
| **Validation** | `zod` | Schema validation |
| **HTTP Client** | `axios` | Central network client |
| **Mocking** | `msw` | MSW for React Native |
| **Testing** | `@testing-library/react-native` | Component tests |
| **Testing** | `jest` | Unit tests |
| **E2E** | `maestro` | E2E YAML test runner |
| **Clipboard** | `@react-native-clipboard/clipboard` | Copy to clipboard |
| **Status Bar** | `react-native` (built-in StatusBar) | Use built-in StatusBar component |
| **Fonts** | `react-native` font linking | Link fonts via native build — no expo-font |
| **Crash Reporting** | `@sentry/react-native` | Crash monitoring |
| **i18n** | `react-i18next` + `i18next` | Internationalization |
| **Date & Time** | `date-fns` | Locale-aware date and time formatting |
| **Native SVG** | `react-native-svg` | Allowed only for approved native libraries or explicit direct SVG requirements |

### Dependency Classification Contract

#### A. Directly Approved Dependencies
Only packages listed in the locked package registry above may be directly imported by application source code.

#### B. Transitive Dependencies
Packages installed only because an approved package depends on them MUST NOT be directly imported by application source code unless they are explicitly promoted to Category A.

#### C. Approval-Required Dependencies
Any package not in the locked registry requires:
1. Explicit human approval before installation or import;
2. New Architecture compatibility evidence (Fabric / TurboModules);
3. Security and vulnerability review;
4. Entry in `docs/decisions/approved-dependencies.md`;
5. Formal update to the locked registry table;
6. `_features.md` justification if feature-specific.

A `_features.md` justification alone does NOT authorize a dependency.

> ⛔ **FORBIDDEN packages (common AI hallucination traps):**
> `expo-font`, `expo-status-bar`, `expo-haptics`, `expo-permissions`, `expo-date-picker`, `@expo/vector-icons`, `react-native-vector-icons` (use `lucide-react-native` instead), `react-native-elements`, `native-base`

### Package Version Authority & Dependency Precedence Hierarchy

When determining package validity and versions, the AI MUST apply this strict authority order:
1. **Existing Repository `package.json` & Lockfile (Highest Authority):** If the supplied repository already contains and actively uses a dependency not listed in the locked reference registry table, the existing repository `package.json` takes precedence. The AI classifies it as `LEGACY_REPOSITORY_APPROVED` and MUST NOT flag it as an unauthorized violation.
2. **Locked Architecture Dependency Registry:** Authoritative for all new feature additions, scaffolding, or clean-slate modules.
3. **AI Speculative Package Hallucination:** STRICTLY PROHIBITED. The AI MUST NOT invent, guess, or install unapproved packages.

AI MUST:
- use only APIs compatible with the installed version;
- never assume the newest package API;
- never upgrade, downgrade, or add dependencies unless explicitly approved;
- update lockfile only when an approved dependency change is part of the task;
- document the reason and compatibility impact in the feature `_features.md` when an approved dependency is added or changed.

### Native Project Boundary

Changes to native project files are infrastructure changes, not feature-local changes.

This includes:
- `android/` Gradle files, AndroidManifest permissions, Proguard/R8 rules;
- `ios/` Podfile, Info.plist usage descriptions, privacy manifests, entitlements;
- React Native codegen, Fabric, TurboModule, Hermes, build scripts;
- push notification, deep-link, biometric, camera, location, and file-access setup.

AI MUST NOT modify these files unless the task explicitly authorizes native work.
Every approved native change requires:
1. iOS and Android impact assessment;
2. required permission/privacy declaration;
3. rollback plan;
4. device validation evidence;
5. update to the relevant feature documentation.

## CODE & COMPONENT ISOLATION DECISION MATRIX (STRICT WET PRINCIPAL)

> ⛔ **AI AGENTS: Before deciding whether to share or duplicate any component, hook, utility, or constant across roles or modules, you MUST consult this matrix. Guessing is PROHIBITED.**
>
> **THE WET PRINCIPAL:** "Write Everything Twice" (WET) is the mandatory default for all business-aware code. Traditional DRY principles MUST NOT override the project's AI isolation requirement. Over-isolation is always compliant; sharing business logic is NEVER permitted.

### Non-Negotiable DRY Exceptions

WET applies to business-aware feature code only.

The following MUST remain centralized and MUST NEVER be duplicated per feature:
- authentication, session restoration, token refresh, logout;
- secure storage and encryption adapters;
- API transport, retry, timeout, cancellation, and error normalization;
- permission request and Settings redirection infrastructure;
- telemetry, PII redaction, crash reporting, audit logging;
- global theme/token resolution, shadow/touch-target/motion helpers;
- i18n initialization and locale handling;
- generic accessibility primitives;
- navigation shell and deep-link authorization guard;
- global offline/network status service;
- generic date/currency/number formatting utilities.

Business-specific formatting, status mapping, field validation, workflow rules,
and feature UI remain WET and feature-local.

## WET vs Shared Primitive Decision Matrix

| Artifact | Can live in src/core/? | Must remain feature-local? | Examples |
|---|---:|---:|---|
| Visual primitive with no business semantics | Yes | No | AppButton, AppText, AppCard, AppDivider |
| Theme helper / token resolver | Yes | No | useThemeTokens, getMinTouchTarget, getShadowStyle |
| Security / transport / permission infrastructure | Yes | No | networkClient, secureStorage, permissionService |
| Generic formatting with no business rules | Yes, if explicitly approved | No | formatDate, displayValue |
| Business status badge | No | Yes | MemberPaymentStatusBadge, TrainerTierBadge |
| Feature filter with business presets | No | Yes | ManagerMembersDateFilter, AttendanceStatusFilter |
| Entity card / list item | No | Yes | ManagerMembersMemberCard, TrainerClientCard |
| Domain API hook / mutation | No | Yes | useManagerMembersCreate, useDeleteTrainerClient |
| Domain Zustand store | No | Yes | useManagerMembersStore, useTrainerClientsStore |
| Domain enum / business mapping | No | Yes | membershipStatusLabelMap, planDurationEnum |
| Feature-specific test helper / fixture | No | Yes | manager_members.fixtures.ts, trainer_clients.handlers.ts |

> ⛔ **STRICT BOUNDARY TEST:** If an artifact contains a business noun, role name, module name, API endpoint, permission rule, business status, domain enum, feature-specific copy, or domain transformation, it MUST remain inside the owning feature folder.

**Decision Invariants:**
- If the code contains ANY reference to a business entity, status, label, or domain type → it is `BUSINESS_AWARE` → it MUST be duplicated per feature. Sharing is a CRITICAL ISOLATION VIOLATION.
- **When in doubt, CLASSIFY:**
  * **Business-aware logic** (domain workflows, statuses, permissions, entity transforms) → **DUPLICATE / Feature-Local (WET)**.
  * **Pure stateless deterministic helpers** (pure math, regex validators, string clamps, date format primitives) → **CENTRALIZED in `src/core/utils/` (DRY)**.
  * **Unclassified artifacts** → Record `ARCHITECTURE_REVIEW_REQUIRED` before duplicating or sharing.
- **Currency & Formatting Distinction:**
  * Generic number formatting primitives (`formatNumber`, `displayValue`) = **Centralized** in `src/core/utils/`.
  * Business-aware currency presentation (`[module]FormatCurrency.ts` with minor-unit divisors, currency metadata, and domain fallback labels) = **Feature-Local (WET)**.
- Over-isolation is always compliant; sharing business logic is NEVER permitted.

### WET vs DRY Governance Boundary

| Code Category | Rule | Location |
|---|---|---|
| Business workflows, feature statuses, filters, cards, mutations, forms | **WET / feature-local** | Owning feature only |
| Security-sensitive logic | **DRY / central only** | `src/core/security`, `auth`, `storage` |
| Network client, token refresh, retry policy | **DRY / central only** | `src/core/network` |
| Permissions and notification registration | **DRY / central only** | `src/core/permissions`, `notifications` |
| Theme/token resolver, animation presets, haptic adapter | **DRY / central only** | `src/core/theme`, `src/core/interaction` |
| Generic UI primitives with zero business meaning | **DRY allowed** | `src/core/ui` |
| Generic type-safe utilities such as `displayValue`, formatting, debounce | **DRY / central only** | `src/core/utils` |
| Feature formatters involving business rules (`formatCurrency`) | **WET / local** | Owning feature `utils/` |

> ⛔ **MANDATORY BOUNDARY RULE:** WET applies strictly to business-aware code. It MUST NOT duplicate security, authentication, authorization, token refresh, storage, privacy redaction, telemetry sanitization, network transport, permissions, notification infrastructure, or generic accessibility primitives. Those are centralized because inconsistency creates security, compliance, and regression risk.

---

## NO ROLE-WIDE BUSINESS BUCKETS

The project MUST NOT create role-wide business folders such as:

```text
frontend_manager_components/
frontend_manager_hooks/
frontend_manager_store/
frontend_manager_api/
```

when those files contain business behavior belonging to individual features. Feature-specific responsibilities MUST remain inside the owning feature's autonomous sub-modules:

```text
src/features/
└── frontend_manager/
    ├── manager_members/
    │   └── members_directory/
    │       ├── components/
    │       ├── hooks/
    │       ├── api/
    │       └── ...
    ├── manager_attendance/
    │   └── attendance_dashboard/
    │       ├── components/
    │       ├── hooks/
    │       ├── api/
    │       └── ...
    └── manager_billing/
        └── billing_invoices/
            └── ...
```

The same principle applies to every role and every domain.

---

## Mandatory vs Conditionally Required Artifacts

> ⛔ **NO OMISSION OF REQUIRED ARTIFACTS:**
> AI agents MUST NOT use "only required folders need to exist" as an excuse to omit tests, mocks, schemas, or documentation.

| Artifact | Requirement Level | Mandatory Trigger Condition | Consequence of Omission |
|---|---|---|---|
| `[role]_[submodule]_features.md` (or `_features.md`) | **MANDATORY FOR ALL SUB-MODULES** | Every single autonomous sub-module (all 22 canonical sections) | `NON_COMPLIANT` — Sub-module lacks architectural map |
| `[role]_[submodule]_forbidden.md` (or `_forbidden.md`) | **MANDATORY FOR ALL SUB-MODULES** | Every single autonomous sub-module | `NON_COMPLIANT` — Sub-module lacks safety boundaries & WET rules |
| `[role]_[submodule]_theme_contract.md` (or `_theme_contract.md`) | **MANDATORY FOR ALL SUB-MODULES** | Every single autonomous sub-module | `NON_COMPLIANT` — Visual portability contract unverified |
| `config/[role]_[submodule].url_config.ts` | **MANDATORY FOR ALL SUB-MODULES** | Every sub-module with routes or API calls | `NON_COMPLIANT` — URL centralization contract broken |
| `api/[role]_[submodule].query_keys.ts` (or `config/`) | **MANDATORY FOR ALL MODULES** | Every module with API calls | `NON_COMPLIANT` — Cache key consistency broken |
| `screens/` | **MANDATORY FOR ALL MODULES** | Every feature module with UI | `NON_COMPLIANT` — Missing screen entry points |
| `components/` | **MANDATORY FOR ALL MODULES** | Every feature module with UI | `NON_COMPLIANT` — Missing view layer |
| `hooks/` | **MANDATORY FOR ALL MODULES** | Any component with logic/state | `NON_COMPLIANT` — Logic coupled to view |
| `api/` | **MANDATORY FOR ALL MODULES** | Any API call | `NON_COMPLIANT` — API centralization broken |
| `types/` | **MANDATORY FOR ALL MODULES** | Every feature module | `NON_COMPLIANT` — Type isolation contract broken |
| `schemas/` | **MANDATORY FOR ALL MODULES** | Every module with forms/API responses | `NON_COMPLIANT` — Runtime validation missing |
| `mocks/` | **MANDATORY FOR ALL MODULES** | Every feature module (scenarios/ registry, mutable fixtures, and MSW handlers) | `NON_COMPLIANT` — Untestable/unmocked module |
| `_locales/` | **MANDATORY FOR ALL MODULES** | Every feature module (`_en.json` + active languages) | `NON_COMPLIANT` — Hardcoded strings in JSX |
| `state/` | **Conditionally Required** | MUST exist when module has shared client state | `NON_COMPLIANT` if client state is stored in global or component state |
| `utils/` | **Conditionally Required** | MUST exist when module has formatters/helpers | `NON_COMPLIANT` if helpers are placed in global `src/core/` |
| `tests/` | **MANDATORY FOR ALL MODULES** | Every feature module (harness/ bootstrap, [Submodule]Harness.tsx, and integration tests) | `NON_COMPLIANT` — Zero integration test verification |

---

## AI PORTABILITY CONTRACT

A feature module is considered AI-portable only when an AI can receive the feature directory as its primary context and understand the feature's purpose, user flows, UI, state ownership, API contract, schemas, business constants, mock behavior, tests, error handling, loading/empty behavior, permissions, and documented external dependencies — without receiving unrelated sibling business modules.

The canonical workflow is:

```text
FEATURE BUG
   ↓
PROVIDE ONLY THE FEATURE MODULE FOLDER
   ↓
AI READS _features.md FIRST, THEN _forbidden.md
   ↓
AI UNDERSTANDS THE FEATURE
   ↓
AI REPAIRS THE FEATURE
   ↓
AI RUNS FEATURE TESTS
   ↓
ONLY FEATURE FILES ARE CHANGED
```

For example, if a bug exists in the directory flow within manager members:

```text
src/features/frontend_manager/manager_members/members_directory/
```

the preferred AI context under the Sub-Module ZIP Guarantee is ONLY that autonomous sub-module folder — NOT the parent domain container `manager_members/`, NOT the role container `frontend_manager/`, and NOT the entire application.

---

## DUPLICATION IS ALLOWED AND PREFERRED WHEN IT IMPROVES ISOLATION

Traditional DRY principles MUST NOT override the project's AI isolation requirement.

If two independent features need similar business behavior, they MAY contain duplicated implementations. This is intentional when duplication prevents cross-feature business coupling.

The primary optimization target is:
```text
AI CONTEXT ISOLATION
+
BOUNDED CHANGE BLAST RADIUS
+
FEATURE PORTABILITY
```
not minimum source-code duplication.

**FEATURE-LOCAL SINGLE SOURCE OF TRUTH:** The phrase "single source of truth" applies ONLY within the owning feature module. Two modules may contain similar or even identical business constants. Cross-feature consolidation is NOT required and is FORBIDDEN for business-aware code.

---

## Rule 0A — Autonomous Sub-Module Is the AI Repair Boundary (The Sub-Module ZIP Guarantee)

```text
APPLICATION
  └── ROLE CONTAINER (Prefixed with frontend_)
        └── FEATURE DOMAIN CONTAINER (e.g., manager_members/, manager_attendance/)
              └── AUTONOMOUS SUB-MODULE (e.g., members_directory/, attendance_dashboard/)
```

- **Primary Granular AI Repair Boundary = AUTONOMOUS SUB-MODULE** (`{domain}_{capability}/`).
- **Parent Navigation / Orchestration Boundary = FEATURE DOMAIN CONTAINER** (`{role}_{domain}/`).
- **Role Container = NOT the repair boundary.**

## Rule 0A.1 — FRONTEND NAMESPACE PREFIXING (MANDATORY)

Because the project contains a 1-to-1 mapping of frontend and backend roles, the AI MUST explicitly separate frontend folders from backend folders.
- **The Rule:** EVERY top-level frontend role container or domain folder MUST be prefixed with `frontend_`.
- **Primary Examples:** `frontend_admin/`, `frontend_manager/`, `frontend_superadmin/`.
- **Why?** If an AI is told to "fix the manager billing bug" and the context contains `manager/billing/`, it may hallucinate and write backend NestJS code inside a frontend /React Native file. By strictly enforcing `frontend_manager/billing/`, there is zero ambiguity for the AI or the human developer.

Examples of ROLE CONTAINERS:
```text
features/frontend_admin/
features/frontend_manager/
features/frontend_superadmin/
features/frontend_trainer/
```
The exact names will differ by project, but the `frontend_` prefix is non-negotiable for root containers.

## Rule 0A.2 — MOBILE CONTEXT ISOLATION (MANDATORY)

For every mobile create, audit, repair, or implementation task, the AI MUST use only:

1. This mobile architecture/development document.
2. `MOBILE_UI_UX_DESIGN.md` when the design system is supplied as a separate document.
3. The supplied target feature/requirements document and its API contract.

The AI MUST NOT require, import, infer, or reference rule numbers from:
- Web frontend architecture documents
- Web frontend UI/UX documents
- Backend architecture documents
- Backend create/audit/repair prompts

Mobile rules are authoritative for mobile.

If a required mobile behavior is not defined by these mobile documents or the supplied feature contract, the AI MUST mark the requirement as `CONTRACT_MISSING` / `BLOCKED_BY_SUPPLIED_SCOPE` rather than inventing behavior.

---

## Rule 0A.3 — PRIMARY NAVIGATION 1-TO-1 FEATURE MODULE MAPPING & ISOLATED REPAIR HAND-OFF (MANDATORY)

> ⛔ **UNIVERSAL APPLICABILITY ACROSS ALL ROLES: This law applies globally, equally, and strictly to EVERY mobile role application (e.g., `frontend_admin`, `frontend_manager`, `frontend_trainer`, `frontend_member`, and any future mobile role). Any specific module names (such as `manager_attendance`, `trainer_schedule`, or `member_workouts`) referenced below are non-exhaustive concrete illustrations.**

To guarantee that any AI agent or mobile developer can repair, test, or expand a mobile feature without app-wide regression, the mobile architecture enforces strict 1-to-1 isomorphism between primary navigation destinations and filesystem feature modules:

1. **The 1:1 Navigation Law & Mobile Domain Grouping Principle (Bottom Tabs / Drawer Items):**
   - **Domain Container as Primary Navigation Destination & Self-Evident UI Label:** Every primary destination present in ANY mobile role's primary navigation (Bottom Tab Bar or Role Drawer: e.g., in Manager: Dashboard, Members, CRM, Attendance, Accounting, Inventory, Staff, Settings; in Admin: Dashboard, Gyms, Billing, Staff, Seats • Shifts • Lockers, Reports, Settings; in Superadmin: Dashboard, Tenants, Plans, Billing, Analytics, Audit, Settings; in Trainer: Dashboard, Schedule, Clients, Workouts, Earnings, Settings; in Member: Dashboard, Membership, Attendance, Bookings, Payments, Profile) MUST map strictly 1-to-1 to an autonomous Tier 3 Domain Container directly under that role container: `src/features/frontend_{role}/{role}_{domain}/` (e.g., `src/features/frontend_manager/manager_crm/`). Furthermore, its **human-facing Navigation Display Label (Bottom Tab / Drawer Title) MUST be 100% self-evident, descriptive, and polished Title Case** (e.g., 🪑 `"Seats, Shifts & Lockers"`, 💰 `"Assets & Maintenance"`). Vague umbrella labels (`"Facilities"`, `"Operations"`, `"Resources"`, `"Others"`) are **STRICTLY BANNED**.
   - **Mobile Domain Grouping Principle (Zero Flat Submodule Dumping — NO Numeric Lock):** Top-level primary navigation MUST represent cohesive, high-level Business Domains (Tier 3 Domain Containers). Flat-dumping granular screens, sub-modules, or actions directly into primary navigation or bottom tabs is a **CRITICAL UX & ARCHITECTURE VIOLATION**. On mobile devices, bottom tabs hold primary core domains with remaining domains accessible via the Role Drawer or a "More" domain hub. The domain count is NOT locked to any artificial number — roles may have as few or as many domains as their authentic business aggregate roots demand.
   - **Sub-Modules as Secondary Navigation:** Autonomous sub-modules inside a domain container (e.g., inside `manager_crm/`: `crm_enquiries/`, `crm_leads/`, `crm_pipeline/`; inside `manager_accounting/`: `accounting_assets/`, `accounting_ledgers/`, `accounting_maintenance/`) MUST be accessed via Secondary Navigation:
     - **Pattern A (Mobile Secondary Top Tab / Segmented Bar):** Rendered by `Manager[Domain]Navigator.tsx` across the top of the screen (`[ Enquiries ] [ Leads ] [ Pipeline ]`) using `@react-navigation/material-top-tabs` or custom segmented bar.
     - **Pattern B (Domain Hub / Stack Screen Navigation):** The domain navigator mounts stack screens where the domain index screen presents operational cards or list links to sub-modules.
   - **STRICT PROHIBITION ON ACTION NANO-MODULES (THE ANTI-ACTION BAN):**
     - Creating a sub-module or navigation tab for a single action, form, or modal (e.g. `crm_enquiry_add/`, `crm_enquiry_edit/`, `accounting_asset_maintenance_add/`, `member_add/`) is an immediate **P0 ARCHITECTURE FAILURE (NANO-MODULE VIOLATION)**.
     - Creation forms, edit sheets, detail screens, and wizard steps MUST live strictly INSIDE their parent sub-module (`components/` as `@gorhom/bottom-sheet` panels or child stack screens), NEVER as independent sub-modules or primary navigation items.
   - **Grouping multiple distinct primary navigation destinations into a single mega-folder (e.g., merging `manager_finance` and `manager_expenses`, or `admin_billing` and `admin_plans`) is STRICTLY FORBIDDEN.**
   - **Creating ad-hoc top-level folders outside the owning feature for sub-views or detail pages is STRICTLY FORBIDDEN.** All sub-screens and secondary workflows must be owned by that feature module.

### Deterministic 3-Question AI Domain Grouping Decision Tree (Mobile Native)

Before writing ANY code or creating ANY folder in mobile, the AI MUST run this 3-question filter for every screen or feature requirement:

```text
Q1: Is this a core high-level Business Domain (e.g., CRM, Accounting, Members, Attendance)?
    ├── YES ──> Create Tier 3 Domain Container: src/features/frontend_{role}/{role}_{domain}/
    │           (Mounts in primary Bottom Tab / Drawer; contains screens/Manager[Domain]Navigator.tsx)
    └── NO  ──> Proceed to Q2

Q2: Is this a distinct operational capability with its own entity lifecycle, list/card views, and filters (5–20 files)?
    ├── YES ──> Create Tier 4 Autonomous Sub-Module: {domain}_{capability}/ inside {role}_{domain}/
    │           (Exposed as secondary top-tab or domain stack screen; e.g., crm_enquiries/, accounting_assets/)
    └── NO  ──> Proceed to Q3

Q3: Is this a single action, form, bottom sheet, modal, detail view, or sub-step (e.g., "Add Enquiry", "Edit Asset")?
    └── YES ──> Place inside parent sub-module: components/ (e.g., ManagerCrmEnquiryCreateSheet.tsx using @gorhom/bottom-sheet)
                or child stack screen inside sub-module screens/.
                ⛔ STRICTLY FORBIDDEN to create a separate sub-module or primary navigation item!
```

### Mobile Sub-View & Action Routing Decision Matrix

Use React Navigation route parameters (`route.params: { mode, filter, status }`) ONLY for state that modifies the view of the SAME resource:
- Filter criteria, date range selections, search queries
- Segmented mode toggles (e.g. list view vs calendar view of the same records)
- Tab selection when it does not represent an independent resource lifecycle

Use nested Stack screens or `@gorhom/bottom-sheet` inside the SAME sub-module for:
- Entity detail screens (e.g. `ManagerMembersDetailScreen.tsx`)
- Create / add / edit sheets and screens (e.g. `ManagerCrmEnquiryCreateSheet.tsx`)
- Multi-step onboarding or checkout wizards
- Workflows requiring distinct permission checks or independent navigation headers
- Deep-linkable resource targets

Allowed hierarchical structure following Universal Day-1 Sub-Module Architecture (Illustrated with CRM & Accounting for Mobile):
```text
src/features/frontend_manager/
├── manager_crm/                                       ← PRIMARY NAV DESTINATION: "CRM" (Tier 3 Domain Container)
│   ├── screens/
│   │   └── ManagerCrmNavigator.tsx                    ← Pure Nav Shell mounting secondary tabs: [Enquiries | Leads | Pipeline]
│   ├── manager_crm_features.md                        ← Master domain specification
│   ├── manager_crm_forbidden.md                       ← Master domain forbidden rules
│   ├── manager_crm_theme_contract.md                  ← Master domain theme tokens
│   │
│   ├── crm_enquiries/                                 ← Autonomous Sub-Module 1 (AI Repair Unit)
│   │   ├── screens/
│   │   │   ├── ManagerCrmEnquiriesScreen.tsx          ← Thin orchestrator (< 80 lines)
│   │   │   └── ManagerCrmEnquiriesMainView.tsx
│   │   ├── components/
│   │   │   ├── ManagerCrmEnquiriesCardList.tsx
│   │   │   ├── ManagerCrmEnquiriesFilterSheet.tsx
│   │   │   └── ManagerCrmEnquiryCreateSheet.tsx       ← "Add Enquiry" lives HERE as Bottom Sheet! NOT a submodule!
│   │   ├── hooks/                                     ← useManagerCrmEnquiriesList.ts
│   │   ├── api/                                       ← manager_crm_enquiries.api.ts
│   │   ├── state/                                     ← useManagerCrmEnquiriesStore.ts
│   │   ├── types/ & schemas/
│   │   ├── mocks/                                     ← Mutable MSW handlers & fixtures
│   │   ├── tests/
│   │   ├── config/manager_crm_enquiries.url_config.ts
│   │   ├── _locales/manager_crm_enquiries_en.json
│   │   ├── manager_crm_enquiries_features.md          ← ALL 22 Canonical Sections
│   │   ├── manager_crm_enquiries_forbidden.md
│   │   └── manager_crm_enquiries_theme_contract.md
│   │
│   ├── crm_leads/                                     ← Autonomous Sub-Module 2 (Secondary Tab)
│   └── crm_pipeline/                                  ← Autonomous Sub-Module 3 (Secondary Tab)
│
└── manager_accounting/                                ← PRIMARY NAV DESTINATION: "Accounting" (Tier 3 Domain Container)
    ├── screens/
    │   └── ManagerAccountingNavigator.tsx             ← Pure Nav Shell mounting secondary tabs: [Assets | Maintenance | Ledgers]
    ├── manager_accounting_features.md
    │
    ├── accounting_assets/                             ← Autonomous Sub-Module 1 (Secondary Tab)
    │   ├── screens/
    │   │   └── ManagerAccountingAssetsScreen.tsx
    │   ├── components/
    │   │   ├── ManagerAccountingAssetsCardList.tsx
    │   │   └── ManagerAccountingAssetCreateSheet.tsx  ← "Add Asset" lives HERE!
    │   └── ...
    │
    ├── accounting_maintenance/                        ← Autonomous Sub-Module 2 (Secondary Tab)
    └── accounting_ledgers/                            ← Autonomous Sub-Module 3 (Secondary Tab)
```

**Rule:** One primary navigation destination = one feature domain container (Tier 3). All business implementation code MUST live inside autonomous child sub-modules (`{domain}_{capability}/`). Internal actions and forms MUST live inside sub-module `components/` (using `@gorhom/bottom-sheet` or nested stack screens).

### CANONICAL ERP DOMAIN TAXONOMY & ANTI-HALLUCINATION GROUPING INVARIANT (NON-NEGOTIABLE)

To prevent AI agents from arbitrarily inventing nonsensical parent groups (e.g. creating `manager_operations/` or merging `CRM` and `Members`), all mobile domain grouping MUST adhere strictly to Domain-Driven Design (DDD) Bounded Contexts and the Canonical Domain Taxonomy below.

#### 1. The Bounded Context Affinity Rule (Zero Cross-Domain Smuggling):
Two capabilities may ONLY reside in the same Tier 3 Domain Container if they share:
1. **The exact same primary Aggregate Root & Entity Lifecycle** (e.g., all submodules in `manager_crm` operate on Leads/Prospects/Inquiries; all submodules in `manager_members` operate on Active Enrolled Members).
2. **The same business domain boundary.**
- ❌ **CROSS-DOMAIN SMUGGLING IS STRICTLY FORBIDDEN:**
  - An AI MUST NOT put active member subscription management inside `CRM` (Members is post-sale; CRM is pre-sale).
  - An AI MUST NOT put financial invoices or payment gateways inside `Attendance` or `Members` (Invoices belong to `Billing` / `Accounting`).
  - An AI MUST NOT merge `Staff` and `Accounting` merely because staff gets paid (Staff manages shifts/profiles; Accounting manages financial ledger disbursements).

#### 2. The Anti-Junk-Drawer Law & Self-Evident Domain Naming Invariant (Zero Mystery Buckets):
AI agents are **ABSOLUTELY PROHIBITED** from creating generic, ambiguous, or dumping-ground domain names. 

- **The Self-Evident Navigation Naming Invariant:** Every Tier 3 Domain Container (`src/features/frontend_{role}/{role}_{domain}/`) and its Primary Mobile Navigation label (Bottom Tab or Drawer) MUST be **100% self-evident and descriptive**. A user or developer looking at the navigation name MUST know within 1 second exactly what capabilities exist inside without opening folders or tapping destinations.
- **Explicit Composite Domain Naming (Canonical for Multi-Resource Domains):**
  - In business verticals where multiple operational resources form a single cohesive lifecycle (e.g., Study Library / Co-working Space / Facility ERPs where Seats, Shifts, and Lockers are allocated together):
    - ✅ **APPROVED & CANONICAL:** Explicit composite naming where internal capabilities are directly telegraphed in the name:
      - Domain Container: `src/features/frontend_{role}/{role}_seat_shift_locker/` (e.g., `admin_seat_shift_locker/`)
      - Navigation Title: `"Seats, Shifts & Lockers"` or `"Seat • Shift • Locker"`
      - Secondary Nav Tabs (Top Segmented Bar or Domain Hub): `[ 🪑 Seats ]  [ ⏱️ Shifts ]  [ 🔒 Lockers ]`
      - Autonomous Child Sub-Modules: `seat_allocation/`, `shift_timings/`, `locker_assignments/`
    - Why this is superior: Reading `"Seats, Shifts & Lockers"` instantly communicates the entire feature scope, eliminating any ambiguity on mobile screens.
- **Permanently Banned Generic Junk-Drawer Names:**
  The following domain names are **PERMANENTLY BANNED**:
  - ❌ `*_operations/`
  - ❌ `*_management/`
  - ❌ `*_general/`
  - ❌ `*_facilities/` (vague black-box — must be explicit like `*_seat_shift_locker/` or `*_equipment_and_rooms/`)
  - ❌ `*_resources/` (vague black-box — must explicitly name what resources)
  - ❌ `*_miscellaneous/` or `*_misc/`
  - ❌ `*_tools/` or `*_actions/`
  - ❌ `*_hub/` or `*_portal/` or `*_workspace/`
  - ❌ `*_services/` or `*_data/`
  - ❌ Unrelated domain mergers: `*_crm_and_members/` (merging pre-sale CRM with post-sale Members is banned), `*_finance_and_expenses/`

Creating ANY domain with a banned generic name or hidden mystery bucket is an immediate **P0 ARCHITECTURE FAILURE & MERGE BLOCKER**. Every domain container MUST be either a recognized business noun or an explicit self-descriptive composite from the Canonical Domain Taxonomy below.

#### 3. Canonical ERP Domain Taxonomy (Extensible Baseline Matrix):
The domain containers below represent the canonical baseline for Smart Gym 360 Mobile. 
- **NO RIGID FIXED COUNT OR ARTIFICIAL CEILING:** Roles are NOT locked to any rigid number of domains (neither 5, nor 6–10, nor any fixed count). A role may contain as few or as many business domains as its authentic business aggregate roots require.
- **Pure Hierarchical Invariant:** The architecture requires that top-level primary navigation represents cohesive **High-Level Business Domains (Tier 3 Domain Containers)**, while granular operational capabilities live inside domains as autonomous sub-modules. The violation is flat-dumping submodules/actions, NOT the number of domains.
- **Extensibility:** New legitimate business domains (e.g., `manager_pos`, `manager_nutrition`, `manager_marketing`) MAY be introduced as long as they represent independent Aggregate Roots and avoid banned junk-drawer names.

| Role Container | Approved Baseline Domain Containers (Canonical Reference) | Permitted Autonomous Sub-Modules (`{domain}_{capability}`) |
|---|---|---|
| **`frontend_manager`** | 1. `manager_dashboard`<br>2. `manager_members`<br>3. `manager_crm`<br>4. `manager_attendance`<br>5. `manager_accounting`<br>6. `manager_inventory`<br>7. `manager_staff`<br>8. `manager_settings` | • `crm` → `crm_enquiries`, `crm_leads`, `crm_pipeline`<br>• `members` → `members_directory`, `members_plans`, `members_detail`<br>• `attendance` → `attendance_dashboard`, `attendance_history`, `attendance_biometrics`<br>• `accounting` → `accounting_assets`, `accounting_ledgers`, `accounting_maintenance`<br>• `inventory` → `inventory_equipment`, `inventory_supplements`, `inventory_lockers`<br>• `staff` → `staff_directory`, `staff_roster`, `staff_payroll` |
| **`frontend_superadmin`** | 1. `superadmin_dashboard`<br>2. `superadmin_tenants`<br>3. `superadmin_plans`<br>4. `superadmin_billing`<br>5. `superadmin_analytics`<br>6. `superadmin_audit`<br>7. `superadmin_settings` | • `tenants` → `tenants_directory`, `tenants_onboarding`, `tenants_branches`<br>• `plans` → `plans_tiers`, `plans_features`, `plans_pricing`<br>• `billing` → `billing_invoices`, `billing_payouts`, `billing_gateways`<br>• `audit` → `audit_logs`, `audit_security`, `audit_compliance` |
| **`frontend_admin`** | 1. `admin_dashboard`<br>2. `admin_gyms`<br>3. `admin_billing`<br>4. `admin_staff`<br>5. `admin_reports`<br>6. `admin_settings` | • Standard enterprise branch and administrative capabilities |
| **`frontend_trainer`** | 1. `trainer_dashboard`<br>2. `trainer_schedule`<br>3. `trainer_clients`<br>4. `trainer_workouts`<br>5. `trainer_earnings`<br>6. `trainer_settings` | • Personal trainer schedule, member workout logs, and PT commission logs |
| **`frontend_member`** | 1. `member_dashboard`<br>2. `member_membership`<br>3. `member_attendance`<br>4. `member_bookings`<br>5. `member_payments`<br>6. `member_profile` | • Gym member portal views, QR check-in, class bookings, payment receipts |

#### 4. The Aggregate Root Boundary Test (Dispute Resolution):
If an AI agent is uncertain which domain owns a feature (e.g. "Trainer Payouts: does it belong in Staff or Accounting?"), apply the **Aggregate Root Mutation Test**:
- *"Which core business entity's authoritative state is being created or modified?"*
  - If the operation creates an accounting transaction, tax entry, or ledger disbursement → It belongs to **`accounting`**.
  - If the operation updates trainer employee profiles, hourly rates, or roster status → It belongs to **`staff`**.
  - Cross-references are resolved strictly via read-only API calls across gateway endpoints, NEVER by combining domain folders!

2. **100% Domain Self-Containment Inside the Feature Folder:**
   - When a user taps a navigation tab (e.g. Attendance ➔ `AttendanceScreen`, Schedule ➔ `ScheduleScreen`), **100% of the UI, state, and logic for that capability MUST reside INSIDE that single folder**:
     - Screen entries: `*Screen.tsx` (Thin orchestrators under 80 lines)
     - Components / Widgets: Feature-specific cards, list items, bottom sheets, headers, modals (under 200 lines)
     - Custom Hooks / Controllers: Feature data-fetching, mutation, and UI state hooks (under 150 lines)
     - Domain contracts: Types (`.types.ts`), Zod schemas (`.schemas.ts`), constants, formatting utilities
     - State management: Atomic Zustand stores or context providers (under 180 lines)
     - API services: REST/GraphQL queries and mutations (`.api.ts`)
     - Testing & Mocks: Unit/widget tests and mock fixtures
     - Local contract documentation: `[role_module]_features.md`, `[role_module]_forbidden.md`, `[role_module]_theme_contract.md`
   - ZERO cross-feature business imports: It is STRICTLY PROHIBITED for any feature module to import business components, hooks, stores, or types from any sibling feature (Rule 28).

3. **Isolated AI Repair Hand-Off & AI Repair Context Boundary:**
   - The editable scope remains one owning feature module by default (`src/features/frontend_{role}/{role}_{feature}/`).
   - However, every AI repair hand-off MUST include a read-only **Core Contract Pack**:
     - `src/core/contracts/` public type contracts
     - `src/core/network/networkClient.ts` public API surface only
     - `src/core/theme/` public token and theme API surface only
     - `src/core/navigation/` route registration interface only
     - `src/core/auth/` session and authorization public interface only
     - `src/core/permissions/` public permission API only
     - `src/core/i18n/` translation API and locale setup only
     - approved dependency manifest
     - TypeScript path alias configuration
   - The AI MUST NOT modify Core Contract Pack files unless the task explicitly authorizes an infrastructure change and CODEOWNERS review is required.
   - The AI MUST NOT request sibling feature business code by default.

4. **Feature-Owned Route Config & Stack Navigator (AI Zip Principle):**
   - Every feature module MUST own its internal screen route names and param types inside `config/{role_module}.url_config.ts` (e.g., `config/manager_members.url_config.ts`). This file exports both internal `SCREEN_ROUTES` constants and the feature's `ParamList` type.
   - Every primary tab/drawer feature module MUST own a thin **`[Role][Module]Navigator.tsx`** (e.g., `ManagerMembersNavigator.tsx`) inside its `screens/` folder. This navigator orchestrates the internal stack (List → Detail → Add screens) and any feature-level modals/bottom sheets.
   - `src/core/navigation/` (Root/BottomTab/Drawer Navigator) mounts ONLY the top-level tab/drawer entries. It consumes the feature navigator component — it MUST NOT define internal screen routes for individual features.
   - Global `src/core/navigation/routes.ts` defines ONLY top-level tab/drawer route names. Feature-internal screen names live exclusively in the feature's own `config/{role_module}.url_config.ts`.
   - **Why:** If a developer needs to add a new sub-screen to `manager_members`, they ZIP only `src/features/frontend_manager/manager_members/` and hand it to the AI. The AI finds all route definitions, param types, and the stack navigator inside that single folder — zero dependency on global files.

5. **Navigation Shell Isolation:**
   - Root navigation orchestrators (`RootNavigator`, `BottomTabNavigator`, `DrawerNavigator`) reside in `src/core/navigation/`.
   - Navigation orchestrators consume ONLY top-level route constants from `src/core/navigation/routes.ts` and feature navigator components. They MUST NOT import business state, business components, or domain hooks from feature modules.
   - If an issue occurs with tab switching, deep linking config, or drawer presentation, the repair context is STRICTLY `src/core/navigation/`, NEVER individual feature modules.

6. **Universal Day-1 Sub-Module Architecture (Zero Exceptions, Zero Refactoring):**
   - **Maximum File Ceiling:** 100 source files per feature module.
   - **Maximum Line-of-Code Ceiling:** 15,000 LOC per feature module.

   > ⛔ **UNIVERSAL LAW: EVERY MOBILE FEATURE IS ORGANIZED INTO SUB-MODULES FROM DAY 1**
   >
   > There are NO special cases, NO file-count thresholds, and NO hardcoded exceptions based on whether a feature has "one screen" or "multiple screens".
   >
   > **Every single mobile feature domain across the entire application — whether `manager_profile`, `manager_settings`, `manager_attendance`, `manager_notifications`, or `manager_billing` — MUST be structured as an autonomous Sub-Module Container right from Day 1.**
   >
   > An engineer or AI agent is STRICTLY FORBIDDEN from creating loose `screens/`, `components/`, `hooks/`, `api/`, `mocks/`, or `utils/` at the domain root level. 100% of executable source code, mocks, and tests MUST live inside a dedicated `{sub_module}/` folder.

   #### The Universal Mobile 4-Tier Hierarchy:

   ```text
   APPLICATION
     └── ROLE CONTAINER (e.g., src/features/frontend_manager/)
           └── FEATURE DOMAIN CONTAINER (e.g., manager_profile/, manager_attendance/, manager_settings/)
                 ├── screens/                                      # Pure Navigational Shell
                 │    └── Manager[Domain]Navigator.tsx             # Stack/TopTab navigator mounting sub-screens
                 │
                 ├── {sub_module_1}/                               # 100% Autonomous Sub-Feature (AI Repair Unit)
                 │    ├── screens/                                 # [Role][Submodule][Screen]Screen.tsx
                 │    ├── components/                              # [Role][Submodule][Name].tsx
                 │    ├── hooks/                                   # use[Role][Submodule][Name].ts
                 │    ├── api/                                     # [role]_[submodule].api.ts, [role]_[submodule].query_keys.ts
                 │    ├── state/                                   # use[Role][Submodule]Store.ts
                 │    ├── types/ & schemas/                        # Zod schemas & types
                 │    ├── mocks/                                   # scenarios/, fixtures, MSW handlers
                 │    │    ├── scenarios/[role]_[submodule].scenarios.ts # Scenario registry (active, empty, error, timeout)
                 │    │    ├── [role]_[submodule].fixtures.ts      # Mutable in-memory seed data
                 │    │    └── [role]_[submodule].handlers.ts      # MSW handlers that mutate state
                 │    ├── utils/                                   # Local WET formatters
                 │    ├── tests/                                   # Integration & Harness tests
                 │    │    ├── harness/
                 │    │    │    ├── bootstrap.ts                   # Standalone harness bootstrap
                 │    │    │    └── [Role][Submodule]Harness.tsx   # Standalone isolated test harness
                 │    │    └── [role]_[submodule].integration.test.ts
                 │    ├── config/[role]_[submodule].url_config.ts
                 │    ├── _locales/[role]_[submodule]_en.json
                 │    ├── [role]_[submodule]_features.md
                 │    ├── [role]_[submodule]_forbidden.md
                 │    └── [role]_[submodule]_theme_contract.md
                 │
                 └── {sub_module_2}/                               # Additional Sub-Features (Day 1 or Future)
                      └── ... (identical canonical micro-structure)
   ```

   #### Concrete Proof Across ALL Domains (No Exceptions):

   | Feature Domain | Day-1 Initial Sub-Module | Future / Additional Sub-Modules |
   |---|---|---|
   | **Profile** (`manager_profile/`) | `profile_overview/` | `profile_security/`, `profile_preferences/` |
   | **Settings** (`manager_settings/`) | `settings_general/` | `settings_notifications/`, `settings_integrations/` |
   | **Attendance** (`manager_attendance/`) | `attendance_dashboard/` | `attendance_history/`, `attendance_analytics/`, `attendance_biometrics/` |
   | **Billing** (`manager_billing/`) | `billing_invoices/` | `billing_subscriptions/`, `billing_payment_methods/` |
   | **Members** (`manager_members/`) | `members_directory/` | `members_profile/`, `members_attendance/` |
   | **Notifications** (`manager_notifications/`) | `notifications_inbox/` | `notifications_preferences/`, `notifications_templates/` |

   #### Why the Universal Day-1 Rule Kills 100% of AI Hallucinations:
   1. **Zero Guesswork:** An AI NEVER has to ask *"Is this 1 screen or 2 screens? Should I put mocks at root or in a subfolder?"* The answer is ALWAYS: **All code lives inside `{sub_module}/`. The domain root contains only the Navigator.**
   2. **Zero Refactoring Forever:** When `manager_profile` gets a `profile_security` tab in month 6, nobody breaks or moves existing files. `profile_overview/` remains completely untouched. You simply add a new sibling folder `profile_security/`!
   3. **Predictable AI ZIP Guarantee:** The AI repair unit is ALWAYS `frontend_{role}/{role}_{domain}/{sub_module}/`. An engineer zips only that sub-module, giving any AI a clean 10-15 file context with 100% working mocks and tests.

   #### ⛔ The Forbidden Root Code Monolith (Zero Root Code In Domain Folder):
   It is **STRICTLY FORBIDDEN** to create loose `mocks/`, `utils/`, `api/`, `components/`, or business screens at the feature domain root:
   ```text
   ❌ FORBIDDEN ROOT POLLUTION:
   manager_profile/
   ├── mocks/                  <-- ❌ FORBIDDEN! Mocks must live inside profile_overview/mocks/!
   ├── components/             <-- ❌ FORBIDDEN! Components must live inside profile_overview/components/!
   └── profile_overview/
   ```
   The domain root contains ONLY `screens/Manager[Domain]Navigator.tsx` (navigation wrapper). 100% of feature code lives inside sub-modules.

   #### Meaningful Domain-Prefixed Submodule Naming Standard & The Clarity-Over-Brevity Law:
   Every mobile submodule folder MUST follow the exact semantic formula: `{domain}_{capability}` or `{domain}_{screen_intent}`:
   - **The Clarity-Over-Brevity Law (Zero Penalty for Long Descriptive Names):** Clarity is King; Brevity is strictly subordinated. Never artificially shorten, compress, or truncate mobile module or submodule folder names. There is **ZERO PENALTY for long descriptive names**. If a submodule needs multiple descriptive words to convey 100% of its internal capabilities and business purpose (e.g. `seat_allocation_and_booking/`, `shift_timings_and_slot_management/`, `locker_assignment_and_key_tracking/`, `attendance_biometric_device_synchronization/`, `accounting_asset_depreciation_and_maintenance/`), **IT MUST BE FULLY EXPANDED**. A developer or AI inspecting the directory tree MUST instantly know 100% of what is inside without opening a single file.
   - ✅ **Compliant Examples:** `attendance_dashboard/`, `attendance_history/`, `attendance_biometrics/`, `seat_allocation_and_booking/`, `shift_timings_and_slot_management/`, `locker_assignment_and_key_tracking/`, `profile_overview/`, `billing_invoices/`, `members_directory/`, `members_detail/`.
   - **The 5-Second Comprehension Invariant:** Anyone (developer or AI agent) inspecting ONLY the submodule folder name MUST instantly know within 5 seconds its parent domain and exact business capability/screen intent.
   - ❌ **Strictly Banned Cryptic Abbreviations & Truncations:** Never use lazy truncated shorthands (e.g., `seat_alloc/`, `crm_enq/`, `acc_ast/`, `stf_rost/`, `inv_eqp/`, `bio_sync/`).
   - ❌ **Strictly Banned Lazy/Ambiguous Names:** Never use generic or lazy names such as `tab1/`, `tab2/`, `main/`, `default/`, `home/`, `view/`, `details/` (must be `members_detail`), `common/`, `shared/`, `temp/`, or `misc/`. Lazy names are treated as **Critical Naming Violations**.

   - **Zero Cross-Sub-Module Imports (Absolute Decoupling):**
     - Sibling sub-folders within the same parent domain MUST NEVER import components, hooks, state, types, mocks, or utils from each other.
     - `attendance_dashboard` MUST NEVER import from `attendance_history`.
     - `attendance_history` MUST NEVER import from `attendance_analytics`.
   - **100% Self-Contained Sub-Module Directory:**
     - Each sub-navigation folder is an autonomous micro-modular unit containing its own screens, components, hooks, stores, types, schemas, mocks, tests, and Documentation Trio (`[submodule]_features.md`, `[submodule]_forbidden.md`, `[submodule]_theme_contract.md`).
   - **Parent Shared Folders Strictly Forbidden:**
     - Creating `attendance/common/` or `attendance/shared/` is STRICTLY PROHIBITED. All shared code must either be pure domain-agnostic UI primitives in `src/core/ui/` or duplicated locally (Strict WET).
   - **The Sub-Module ZIP Guarantee:**
     - If an engineer or AI needs to fix a bug in `attendance_history`, they ZIP ONLY `src/features/frontend_{role}/attendance/attendance_history/`. The AI repairs the sub-module without ever needing the parent or sibling sub-modules.
   - **Sub-Module Deletion Safety:**
     - Completely deleting `attendance_analytics` MUST leave `attendance_dashboard` and `attendance_history` compiling and passing tests with ZERO missing imports.
   - **Inter-Sub-Module Navigation:**
     - Communication between sub-modules happens exclusively via React Navigation route dispatch with typed route params (`navigation.navigate('AttendanceHistory', { employeeId: 'EMP001' })`), never via shared stores or in-memory cross-references.
   - **Sub-Module Role+Submodule Naming Invariant (AI Anti-Hallucination):**
     - To eliminate AI naming hallucinations across split sub-modules, all mobile artifacts MUST carry the full `[Role][Submodule]` prefix:
       - Screens: `[Role][Submodule][Screen]Screen.tsx` (e.g., `ManagerAttendanceDashboardScreen.tsx`, `ManagerAttendanceHistoryScreen.tsx`).
       - Main Views: `[Role][Submodule][Screen]MainView.tsx`.
       - Components: `[Role][Submodule][Name].tsx` (e.g., `ManagerAttendanceDashboardMetricCard.tsx`, `ManagerAttendanceHistoryFilterBar.tsx`).
       - Custom Hooks: `use[Role][Submodule][Name].ts` (e.g., `useManagerAttendanceDashboardMetrics.ts`).
       - Local Stores: `use[Role][Submodule]Store.ts` (e.g., `useManagerAttendanceDashboardStore.ts`).
       - URL Config: `config/[role]_[submodule].url_config.ts`.
       - Query Keys: `api/[role]_[submodule].query_keys.ts`.
       - Documentation Trio: `[role]_[submodule]_features.md`, `[role]_[submodule]_forbidden.md`, `[role]_[submodule]_theme_contract.md`.
   - **Zero Root Code in Parent Domain Folder (Parent Quarantine):**
     - The parent grouping folder (e.g., `attendance/`) MUST NOT contain loose screens, components, hooks, or stores.
     - It serves exclusively as a filesystem directory containing the self-contained sub-modules. Any top-level tab or stack navigator mounts the sub-module screens directly from their respective sub-folders.
   - **Query Key & MSW Mock Namespace Separation:**
     - Each mobile sub-module MUST isolate its TanStack Query keys with its own distinct sub-module namespace:
       ```typescript
       export const managerAttendanceDashboardKeys = { all: ['manager', 'attendance', 'dashboard'] as const }
       export const managerAttendanceHistoryKeys = { all: ['manager', 'attendance', 'history'] as const }
       ```
     - MSW mock handlers MUST mock distinct sub-feature REST endpoints. Cross-sub-module query invalidation or shared cache keys are STRICTLY FORBIDDEN.
    - **Strict Maximum Nesting Depth Law (The Depth Limit Invariant — Sub-Submodules Strictly BANNED):**
      - Mobile hierarchy depth below `{role}_{domain}/` is **STRICTLY BOUNDED TO EXACTLY 1 LEVEL** (`{domain}_{capability}/`).
      - Tier 4 (`src/features/frontend_{role}/{role}_{domain}/{domain}_{capability}/`) is the **absolute terminal leaf feature execution unit**.
      - **Sub-submodules are STRICTLY FORBIDDEN:** Creating nested folders inside a sub-module that act as child sub-modules (e.g., `attendance_history/details/` or `attendance_history/table/`) is a **CRITICAL P0 ARCHITECTURE VIOLATION**.
      - All decomposition inside a mobile sub-module happens PURELY via standard canonical category folders (`screens/`, `components/`, `hooks/`, `api/`, `state/`, `types/`, `schemas/`, `mocks/`, `utils/`, `tests/`).
      - Multi-step wizards, bottom sheets, modals, detail sub-screens, and secondary tabs MUST live inside that sub-module's `screens/` or `components/` folders (e.g., `ManagerAttendanceHistoryDetailSheet.tsx`), orchestrated via typed React Navigation params, NEVER via nested sub-submodule folders.
    - **Deterministic 5-Gate Sub-Module Qualification Decision Matrix (Mobile):**
      - **Gate 1 (Navigation Invariant):** Does this capability map to a secondary tab in the domain navigator or a distinct top-tab/stack screen? If YES → **Autonomous Sub-Module** (`{domain}_{capability}/`). If it is opened as a bottom sheet, modal, action sheet, or wizard step → **Internal Component/Widget** in `components/`.
      - **Gate 2 (State & Lifecycle Independence):** Can this capability be refreshed or navigated to directly via deep-link without live in-memory state of another screen? If YES → **Autonomous Sub-Module**. If it depends on live uncommitted multi-step form memory → **Internal Screen/Component** inside the SAME sub-module.
      - **Gate 3 (File Count & Granularity Bounds — The Goldilocks Rule: 5–20 Files):**
        - Target Range: 5 to 20 files per sub-module.
        - Nano-Module BANNED: Creating a sub-module for a single widget, button, or simple bottom sheet (< 3 files) is STRICTLY FORBIDDEN. Keep it in `components/`.
        - Mega-Submodule BANNED: Cramming 3+ distinct operational mobile workflows into one sub-module (> 25 files) is STRICTLY FORBIDDEN; split into sibling sub-modules under that domain container.
      - **Gate 4 (Standalone Testability & Mockability — ZIP Guarantee):** Can this capability run in isolation with its own MSW handlers, mock fixtures, and test harness? If YES → **Autonomous Sub-Module**.
      - **Gate 5 (Backend Entity Lifecycle Alignment):** Sub-modules map 1:1 to cohesive backend sub-module API contracts.

---

## Rule 0B — Hard Feature Write Boundary

For a feature-specific task:
Default writable scope = `[owning-feature]/**`

AI MUST NOT modify:
- a sibling feature
- another role's feature
- another domain's business code
- global business folders

Only explicitly approved core/infrastructure files may be changed.

CI Mechanical Gate: The CI pipeline MUST include a mechanical diff gate (e.g., a script or tool) that explicitly fails the build if changes leak outside `[owning-feature]/**` without an authorized infrastructure exception. Import linting is insufficient; file modifications themselves must be constrained.

---

## Rule 0C — Explicit Expected-Product-Surface Audit Procedure

When the AI is tasked with auditing or repairing an existing mobile codebase (e.g., an existing ZIP), it MUST execute the following completeness protocol before generating code:

1. **EXPECTED MOBILE UI:** Analyze the supplied product requirements, API contract, and UI/UX design to discover the exact expected product surface. This includes discovering all necessary screens, modals, bottom sheets, navigation flows, forms, buttons, dropdowns, list views, and error states required by the feature.
2. **ACTUAL MOBILE UI:** Compare the `EXPECTED MOBILE UI` against the actual UI elements implemented in the supplied mobile codebase.
3. **MISSING:** Document any elements present in the `EXPECTED MOBILE UI` that are missing from the `ACTUAL MOBILE UI` (e.g., "The API contract expects a Superadmin chart and role-selection dropdown, but the existing codebase only implements a list view without a dropdown").
4. **REPAIR:** Implement the missing UI elements, integrating them correctly into the existing feature using the Mobile Architecture and Mobile UI/UX Design System. Do not merely report the missing elements — repair them.

The AI is explicitly forbidden from inventing missing features that are not defined by the supplied product requirements, API contract, or UI/UX design. The AI must preserve existing compliant functionality during the repair.

## Rule 0D — Change Scope Failure Condition

If an AI repair attempts to modify business logic in a sibling feature module to fulfill a requirement of the current feature module, the architecture gate FAILS. Feature isolation is absolute.

## Rule 1 — Micro-Modularization (One Feature = One Self-Contained Folder)

This is the most important structural rule. **One feature = one self-contained folder.**
If there is a bug in `manager_members`, you drag ONLY the `src/features/frontend_manager/manager_members/` folder to the AI.
Everything the AI needs — components, hooks/controllers, schemas, types, API, state,
tests, and the context file — lives inside that single folder. Zero need to open any other folder.

- One component/widget = one file. One file = one responsibility — never mix
  data-fetching, business logic, and presentation in the same file.
- Every feature lives ENTIRELY inside its own feature folder. Nothing feature-specific
  exists outside it.
- **The 5-Second Comprehension Invariant:** A new engineer or AI agent MUST understand the exact responsibility and boundary of any file or folder within 5 seconds of opening it. If understanding requires tracing spaghetti dependencies, inspecting sibling business folders, or decoding ambiguous abbreviations, the architectural isolation has FAILED.
- **Screen + MainView Pattern (80-line ceiling compliance):** `*Screen.tsx` (≤80 lines) renders ONLY `<SafeAreaView>`, `<StatusBar>`, route param extraction, and ONE `[Role][Module][Screen]MainView.tsx` component (inside `components/`, ≤200 lines). The MainView orchestrates all hooks, loading/empty/error states, and child components. This is the mobile equivalent of Web's `page.tsx` + `[ModuleName]Main.tsx` pattern.

### File Size Governance

The following are hard architectural ceilings and decomposition limits:

- **Screens (≤80 lines — HARD CEILING, ZERO EXCEPTIONS):** Screen files in `screens/` MUST NOT contain direct API calls, state management, or business/state calculation beyond route-param extraction. They render `<SafeAreaView>`, `<StatusBar>`, and compose the single `[Role][Module][Screen]MainView.tsx` component.
- **Components (≤200 lines — HARD CEILING):** Presentational widgets and bottom sheets in `components/`. If a component exceeds 200 lines, it MUST be decomposed into sub-components unless granted a documented exception (`// architecture-exception: <reason>`) and cataloged in Section 17 of `_features.md`.
- **Hooks & API Modules (≤150 lines — HARD CEILING):** Custom hooks and API service files. Exceeding 150 lines requires splitting query, mutation, and UI state concerns unless covered by a documented exception.
- **State Stores (≤180 lines — HARD CEILING):** Zustand stores in `state/`. Monolithic stores are banned; stores must be decomposed into atomic domain slices.
- **Utilities & Schemas (≤120 lines / ≤150 lines — HARD CEILING):** Single-purpose pure functions and Zod schemas.

A file may exceed its ceiling only where it has one coherent responsibility, extraction would worsen coupling, and the reason is explicitly documented with an inline `// architecture-exception: <specific reason>` comment and listed in the feature `_features.md` under Section 17 (Architecture Exceptions).

## File-Size Exception Process

File-size ceilings are default architectural limits. They MUST NOT cause artificial
fragmentation of one cohesive responsibility.

An exception is allowed only when all conditions are met:
1. The file has one clear responsibility;
2. Splitting it would introduce prop drilling, duplicate logic, circular imports,
   or reduce readability;
3. The file has a top-level comment:
   `// architecture-exception: <specific reason>`
4. The exception is documented in `[feature]_features.md` under
   `## Architecture Exceptions`;
5. The file remains independently testable.

Exceptions are forbidden for:
- Screens that directly call APIs;
- Screens containing business transformations;
- Components managing server state;
- API modules containing UI logic;
- stores importing components or screens.

| File Type | Hard Ceiling | Decompose Strategy | Enforcement Nature |
|---|---|---|---|
| Screen / Route entry point (`*Screen.tsx`) | **≤80 lines** | Route orchestrator only; zero business logic or direct API calls | **HARD STOP — ZERO EXCEPTIONS** |
| Feature Component / Widget | **≤200 lines** | Extract sub-components when owning multiple visual concerns | **HARD CEILING (Exception requires `// architecture-exception`)** |
| Custom Hook / Controller | **≤150 lines** | Split query, mutation, and UI state concerns | **HARD CEILING (Exception requires `// architecture-exception`)** |
| Validation Schema (`.schemas.ts`) | **≤150 lines** | Split by sub-step or domain entity | **HARD CEILING (Exception requires `// architecture-exception`)** |
| API service file (`.api.ts`) | **≤150 lines** | Separate queries from mutations or sub-resources | **HARD CEILING (Exception requires `// architecture-exception`)** |
| State Store (`.store.ts`) | **≤180 lines** | Decompose into atomic domain slices | **HARD CEILING (Exception requires `// architecture-exception`)** |
| Type file (`.types.ts`) | **≤150 lines** | Split payload, entity, and UI types | **HARD CEILING (Exception requires `// architecture-exception`)** |
| Utility file (`.utils.ts`) | **≤120 lines** | Extract pure single-purpose functions | **HARD CEILING (Exception requires `// architecture-exception`)** |

If a file exceeds its ceiling: split by **feature responsibility**, not randomly by line count.
Never create dumping folders named `helpers/`, `common/`, or `misc/`.
Keep all split files inside the **same feature folder**.

### Canonical Architecture & Folder Structure

```text
src/
  core/
    auth/
      authSession.ts
      authRefresh.ts
    network/
      networkClient.ts
      apiResponse.types.ts
      timeoutConfig.ts
    navigation/
      RootNavigator.tsx
      routeRegistry.ts
    permissions/
      permissionsService.ts
    storage/
      secureStorage.ts
      appStorage.ts
    theme/
      tokenDefinitions.ts
      lightTheme.ts
      darkTheme.ts
      ThemeProvider.tsx
      useThemeTokens.ts
      getMinTouchTarget.ts
      getShadowStyle.ts
      animationConfig.ts
    interaction/
      haptics.ts
      toast.ts
    i18n/
      i18n.ts
      useTranslation.ts
    hooks/
      useDebounce.ts
      useUnsavedChangesGuard.ts
      useConfirm.ts
    utils/
      displayValue.ts
      formatNumber.ts
      handleValidationErrors.ts
    observability/
      sentry.ts
      sanitizeTelemetry.ts

  features/
├── frontend_admin/
│   └── admin_members/
├── frontend_manager/
│   └── manager_members/
└── frontend_trainer/
    └── trainer_members/                  ← domain container
        ├── screens/                      ← Pure Navigational Shell
        │   └── TrainerMembersNavigator.tsx   ← feature-owned stack navigator
        │
        └── members_directory/            ← autonomous sub-module (AI repair unit)
            ├── screens/                  ← thin composition only (≤80 lines each)
            │   ├── TrainerMembersListScreen.tsx      ← renders <SafeAreaView>+<StatusBar>+<TrainerMembersListMainView/>
            │   ├── TrainerMembersDetailScreen.tsx    ← renders <SafeAreaView>+<StatusBar>+<TrainerMembersDetailMainView/>
            │   └── TrainerMembersAddScreen.tsx       ← renders <SafeAreaView>+<StatusBar>+<TrainerMembersAddMainView/>
            ├── components/
            │   ├── TrainerMembersListMainView.tsx    ← ≤200 lines — main orchestrator for list screen
            │   ├── TrainerMembersDetailMainView.tsx  ← ≤200 lines — main orchestrator for detail screen
            │   ├── TrainerMembersAddMainView.tsx     ← ≤200 lines — main orchestrator for add screen
            │   ├── TrainerMembersMemberCard.tsx      ← Role+Module prefixed
            │   ├── TrainerMembersMemberCard.test.tsx
            │   ├── TrainerMembersMemberListItem.tsx
            │   └── TrainerMembersEmptyState.tsx
            ├── hooks/
            │   ├── useTrainerMembers.ts             ← Role+Module prefixed
            │   ├── useTrainerMembers.test.ts
            │   ├── useTrainerMembersFilters.ts
            │   └── useTrainerMembersFilters.test.ts
            ├── schemas/
            │   └── trainer_members.schema.ts
            ├── types/
            │   └── trainer_members.types.ts
            ├── api/
            │   ├── trainer_members.api.ts
            │   └── trainer_members.query_keys.ts
            ├── config/
            │   ├── trainer_members.url_config.ts   ← internal routes + API endpoints
            │   └── trainer_members.navigation.ts   ← feature navigation descriptor
            ├── mocks/
            │   ├── scenarios/
            │   │   └── trainer_members.scenarios.ts ← scenarios registry (active, empty, error, timeout)
            │   ├── trainer_members.fixtures.ts    ← initial seed data (mutable in-memory)
            │   └── trainer_members.handlers.ts    ← MSW handlers that mutate in-memory state
            ├── state/
            │   └── trainer_members.store.ts
            ├── tests/
            │   ├── harness/
            │   │   ├── bootstrap.ts               ← standalone harness bootstrap
            │   │   └── TrainerMembersHarness.tsx  ← isolated zero-business test harness
            │   └── trainer_members.integration.test.ts
            ├── utils/
            │   └── trainerMembersFormatCurrency.ts  ← feature-local currency formatter (WET)
            ├── _locales/
            │   ├── trainer_members_en.json
            │   └── trainer_members_hi.json
            ├── trainer_members_features.md
            ├── trainer_members_forbidden.md
            └── trainer_members_theme_contract.md
```

### Hyper-Descriptive, Module-Prefixed Naming (AI Context Guarantee)

Every file name MUST make the feature identity immediately explicit. When you tag a file
in an AI prompt (e.g. `@MembersMemberCard.tsx`), the AI instantly knows which module
it belongs to — zero ambiguity, zero cross-module hallucination risk.

**Canonical filename grammar for the `trainer_members` feature (role = `trainer`, module = `members`):**

```
Screens (thin, ≤80 lines, Role+Module prefixed):
  TrainerMembersListScreen.tsx      ← renders SafeAreaView + StatusBar + TrainerMembersListMainView
  TrainerMembersDetailScreen.tsx
  TrainerMembersAddScreen.tsx
  TrainerMembersNavigator.tsx       ← feature-owned stack navigator

Main View Orchestrators (inside components/, ≤200 lines):
  TrainerMembersListMainView.tsx    ← Web equivalent of [ModuleName]Main.tsx
  TrainerMembersDetailMainView.tsx
  TrainerMembersAddMainView.tsx

Components / Widgets (PascalCase, Role+Module-prefixed):
  TrainerMembersMemberCard.tsx      ← Role+Module prefix MANDATORY
  TrainerMembersMemberListItem.tsx
  TrainerMembersEmptyState.tsx
  TrainerMembersListSkeleton.tsx

Hooks (camelCase with required `use` prefix + Role+Module name):
  useTrainerMembers.ts              ← Role+Module prefix MANDATORY
  useTrainerMembersFilters.ts
  useTrainerMembersSearch.ts

API / Types / Schema / Store / Config (dot-notation, role_module-prefixed, lowercase):
  trainer_members.api.ts
  trainer_members.types.ts
  trainer_members.schema.ts
  trainer_members.store.ts
  trainer_members.url_config.ts     ← lives inside config/ sub-folder
  trainer_members.query_keys.ts     ← lives inside api/ sub-folder

Mocks (mutable in-memory state & scenarios):
  mocks/scenarios/trainer_members.scenarios.ts ← scenarios registry (ACTIVE_RECORDS, EMPTY_DATA, SERVER_500_ERROR, NETWORK_TIMEOUT, UNAUTHORIZED_401)
  trainer_members.fixtures.ts       ← initial seed data array
  trainer_members.handlers.ts       ← MSW handlers that READ/MUTATE in-memory state

Tests (isolated integration & harness):
  tests/harness/bootstrap.ts        ← standalone harness bootstrap
  tests/harness/TrainerMembersHarness.tsx ← isolated zero-business test harness
  tests/trainer_members.integration.test.ts ← integration tests

Feature-local utilities (WET — never shared to src/core/):
  trainerMembersFormatCurrency.ts   ← inside utils/ sub-folder

Locale files (co-located, NOT in global src/i18n/):
  _locales/trainer_members_en.json
  _locales/trainer_members_hi.json

Mandatory documentation files (feature root level):
  trainer_members_features.md
  trainer_members_forbidden.md
  trainer_members_theme_contract.md
```

**Why Role+Module prefix on EVERY file?** When you tag a file in an AI prompt (e.g. `@TrainerMembersMemberCard.tsx`), the AI instantly knows which role AND module it belongs to — zero ambiguity, zero cross-role hallucination risk. Without the role prefix, `useMembers.ts` in `frontend_admin/admin_members/` and `useMembers.ts` in `frontend_manager/manager_members/` are indistinguishable in AI context.

| Pattern | Example | Why permitted |
|---|---|---|
| `use` prefix on hooks | `useTrainerMembers.ts` | React/RN framework convention; Role+Module name follows immediately |
| dot-notation API/type files | `trainer_members.api.ts` | Role+Module name IS the prefix, separated by dot |
| `*.integration.test.ts` suffix | `trainer_members.integration.test.ts` | Test type suffix is structural, Role+Module still prefixed |
| `*_features.md`, `*_forbidden.md` | `trainer_members_features.md` | Mandatory doc format — Role+Module name leads |
| `_locales/{feature}_{lang}.json` | `_locales/trainer_members_en.json` | Explicitly prefixed with Role+Module per Rule 61 |

**What is forbidden regardless:**
```
❌ BAD:  Card.tsx, hook.ts, api.ts, store.ts, types.ts
❌ BAD:  useData.ts, useMembers.ts, loadItems.ts, getData.ts   ← missing role+module identity
✅ GOOD: TrainerMembersMemberCard.tsx, useTrainerMembers.ts, trainer_members.api.ts
```

**AI warning:** Do NOT rename `useTrainerMembers.ts` to `trainerMembersUseHook.ts` or similar to "fix" the prefix. `useTrainerMembers.ts` is the correct, compliant filename.

- **No abbreviations:** Never `Btn`, `Nav`, `Util`. Use `Button`, `Navigation`, `Utility`.
- **Suffix by type:** `...Card`, `...List`, `...Form`, `...Modal`, `...Sheet`, `...EmptyState`.
- **Exported name = filename:** `TrainerMembersMemberCard.tsx` must export `TrainerMembersMemberCard`.
  No default exports with a different name — this prevents AI hallucination.
- **Props interfaces prefixed:** `export interface TrainerMembersMemberCardProps` — never generic `Props`.

### Role Isolation

Mobile role containers MUST remain isolated from one another.

A feature inside `frontend_admin/` MUST NOT be imported into
`frontend_manager/`, `frontend_superadmin/`, or `frontend_trainer/`.

Duplicate business-aware components when required for isolation.
Global UI primitives are permitted only when they contain zero business logic.

> **CRITICAL WARNING TO AI AGENTS:**
> Do NOT attempt to "DRY up" business components by moving them to global folders like `src/components/ui/` or `widgets/common/`.
> Components that contain domain-specific data/constants MUST be duplicated per feature, NEVER globalized.
> Global folders are strictly for dumb, zero-business primitives (like raw Buttons, Inputs, Dialogs).

```
features/
├── frontend_admin/
│   └── members/      ← AdminMembers — completely isolated
├── frontend_manager/
│   └── members/      ← ManagerMembers — isolated, even if visually similar
└── frontend_trainer/
    └── members/      ← TrainerMembers — isolated
```

## Rule 1A — Architectural Dependency & Interaction Rules

- **NO FAKE INTERACTION RULE:** A visible user interaction MUST produce its documented downstream behavior. Empty `onPress` handlers, `console.log`-only handlers, TODO handlers, fake success messages, and filters that do not affect data are explicitly **forbidden**. A user interaction is complete only when it triggers a handler → state change → API/domain action → success/error feedback → UI update.

### Interaction Verification Requirements
For every interactive control, the feature documentation must record:
- `testID`
- Triggering event (e.g. `onPress`)
- Expected state/API/navigation outcome
- Success feedback (toast, haptic, visual state transition)
- Error feedback (inline validation, error banner, fallback)
- Test file and test case name verifying the interaction

Critical interactions must have:
1. A component/integration test proving tap → expected result;
2. A Maestro E2E flow where the user journey is critical;
3. Zero `console.log`, TODO, placeholder alert, or no-op callback in production code.
- **Circular Dependency Rule:** The following architectural loops are forbidden: `A -> B -> A`, `Hooks -> Store -> Hooks`, `Components -> Components -> Parent`, and `API -> Hook -> API`. Every dependency chain MUST remain acyclic.
- **Dependency Direction Rule:** Dependency flow within a module MUST be unidirectional: `Screen -> Hooks -> API` OR `Screen -> Store`. Forbidden flows: `API -> Component`, `Store -> Component`, `Schema -> Component` (bypassing the hook).
- **Separation of Logic and UI:** Do not mix complex React logic (`useEffect`, data transformations) with JSX markup. Extract all heavy logic into a custom hook. The `Screen.tsx` or `Component.tsx` acts purely as a View layer consuming the hook.

## Rule 2 — Navigation

- Navigation MUST be declarative and centrally configured — a single navigation
  graph/router definition, not ad-hoc imperative pushes scattered across files.
- Every route takes typed parameters — no passing full objects through navigation;
  pass IDs and re-fetch inside the destination screen (see Rule 4).
- Deep linking must resolve through the SAME central route definition used for
  in-app navigation — never a second, separately maintained linking map.
- React Navigation is the canonical navigation framework for this React Native project.
  All navigation requirements in this document apply to React Navigation.
- Modals, bottom sheets, and nested tab/stack navigators must be defined once at
  the top of the navigation tree, not re-implemented per screen.

### Navigation Ownership Contract

Feature modules MUST NOT edit the root navigation graph unless explicit authorization is granted.

Each feature may expose one read-only navigation descriptor:
`src/features/frontend_{role}/{role}_{module}/config/{role}_{module}.navigation.ts`

The descriptor may contain only:
- route names owned by the feature;
- typed route-param definitions;
- deep-link path fragments;
- screen registration metadata;
- feature-local navigation labels/icons.

The central navigation module (`src/core/navigation/`) is the sole owner of:
- root stack/tab/drawer composition;
- authentication gates;
- role gates;
- app-wide deep-link prefixes;
- global modal registration;
- navigation container configuration.

A feature may request registration through its descriptor, but may not modify sibling
navigation declarations or global navigation behavior.

### Android Hardware Back Button Governance

Android hardware back behavior MUST work correctly across all flows.

Do NOT register `BackHandler` on ordinary screens where React Navigation's default stack behavior is correct. Register a custom `BackHandler` ONLY for documented interception cases, such as:
- Dirty/unsaved form flow (triggers `useUnsavedChangesGuard`)
- Open bottom sheet or modal (closes sheet before popping screen)
- Temporary selection mode / multi-select action bar
- Custom nested multi-step wizard requiring explicit exit confirmation

Every custom back interception must be removed on cleanup and tested for:
- First back press behavior
- Repeated back press
- Modal/sheet dismissal
- App-root exit behavior

## Rule 3 — Styling & Design Tokens (No Magic Values, Anywhere)

- `MOBILE_UI_UX_DESIGN.md` serves as the single source of truth for both design specification and the executable token contract. Every color, spacing value, font size, radius, and shadow used in the code MUST come from the tokens defined in `MOBILE_UI_UX_DESIGN.md`. No raw hex codes, no arbitrary pixel/dp values typed directly into a component.
- Implementation uses React Native theme objects/configuration.
  The values and "no magic values" discipline are universal within the React Native application.
- There is no hover state on touch devices.
  React Native press/active states are allowed and MUST use the canonical press/active interaction tokens.
  Design and implement only press/active and disabled states, never hover-dependent interactions.
- Dark mode must use the SAME token names in light and dark variants so no
  component ever branches manually on "is dark mode" — the token resolves itself.

## Rule 4 — State Management (Server State vs Client State — Explicit Matrix)

### Query Status Standard (TanStack Query v5)

Use the status flags exposed by the installed and approved TanStack Query v5 version. The codebase standard is:
- Initial query state: `isPending`
- Background refresh: `isFetching` / `isRefetching`
- Failure: `isError`
- Mutation in progress: `isPending` on the mutation result

Do not create parallel `isLoading` booleans in Zustand or local state for server requests. A local variable named `isLoading` is permitted only when it derives directly from the query/mutation result (e.g., `const isLoading = query.isPending || mutation.isPending;`) and does not become a second source of truth.

**Two state ownership categories exist: Server State and Client State.**
Client state may be further subdivided into shared or local depending on scope.
Server state may optionally be persisted to local storage for offline use — persistence
is a *storage characteristic* of server state, not a third independent state category.
Do not invent a fourth ad-hoc pattern.

```text
State Ownership
├── Server State
│   └── optionally persisted to local storage (offline cache)
└── Client State
    ├── Shared (2+ components in one feature)
    └── Local (exactly one component)
```

| State Type | Category | Rule |
|---|---|---|
| Anything from an API (lists, details, counts, status) | **Server state** | Managed by TanStack Query v5 for React Native. Never duplicated into a separate "client" state container. **AI BAN:** `isLoading` is banned (use `isPending`). `onSuccess` inside `useQuery` is banned. For `useMutation`, `onSuccess: () => queryClient.invalidateQueries(...)` is **REQUIRED** inside the dedicated mutation hook — this is the canonical cache invalidation pattern (see Rule 60). |
| UI-only state shared across 2+ components in one feature | **Client state (shared)** | A lightweight, feature-scoped state container (e.g. Zustand). One container per feature — never one giant global store. |
| UI-only state used by exactly one component | **Client state (local)** | Local component state (`useState`/`useReducer` equivalent, or `React Component` local fields). |
| Data that must survive app restart offline | **Server state — persisted** | Only when explicitly required — server-state cache persisted to local storage. Must be documented in the feature's `_features.md` (Rule 24), including conflict-resolution strategy. Persistence does not make this a new category; it is still server state, stored locally. |

**Hard rule:** never copy API response data into the shared client-state
container "just in case." Components read server state directly through the
data-fetching layer, which handles request de-duplication and caching itself.

## Rule 4A — Derived Data Ownership Rule
Derived calculations (e.g., `fullName`, `membershipStatus`, `expiryIndicator`) MUST have exactly one owner.
- ✅ **Allowed:** Centralized in one place (a specific hook, model, or formatter).
- ❌ **Forbidden:** The same derivation logic repeated across multiple components, hooks, and list items.

## Rule 5 — Forms & Validation

- All non-trivial forms use a form-management library + a schema-validation
  library, kept separate from each other.
- **Enforced Stack:** React Hook Form (v7) + Zod. 
- **AI BAN:** The v6 `import { useForm, FormProvider }` without proper v7 register patterns is STRICTLY BANNED. Do not hallucinate legacy v6 patterns.
- Validation schema/rules live in the feature's `schemas/` (or `validators/`)
  folder — never written inline inside the widget/component.
- Client-side validation messages are for immediate UX feedback only. The
  backend's validation response (see Rule 7) is the final source of truth for
  what's actually accepted — never assume client validation alone is sufficient.

## Rule 5A — Interface, Schema, & TypeScript Strictness

- **Type Isolation (No Inline String Type Unions):** Never hardcode string type unions (e.g., `'idle' | 'loading' | 'success' | 'error'`) inline inside interfaces or component definitions. Always extract these into a named type in the module's `types/` folder.
- **Absolute Imports Mandate:** Every import across the mobile codebase MUST use the `@/...` path alias (e.g., `@/features/frontend_manager/manager_members/hooks/useManagerMembers`). Relative imports (`./` or `../`) are STRICTLY FORBIDDEN except within the same file's immediate test co-location. Configure `tsconfig.json` with `"paths": { "@/*": ["src/*"] }`.
- **No Barrel Files:** Place schemas and constants strictly in their respective folders (`schemas/`, `config/`). Do NOT create barrel files (`index.ts`) to re-export them. Import the specific file directly using absolute imports.
- **TypeScript Strictness:**
  - `any` is strictly forbidden. Use `unknown` and narrow safely.
  - `@ts-ignore` and `@ts-nocheck` are forbidden.

## Rule 6 — Secure Storage & Credential Handling

There is no browser `localStorage`/cookies on mobile. Classify every piece of
stored data and route it accordingly:

| Data type | Storage requirement |
|---|---|
| Auth tokens (JWT, refresh token), biometric keys, any credential | Hardware-backed secure storage ONLY — iOS Keychain / Android Keystore, accessed via a secure-storage library (e.g. `react-native-keychain`). Never anywhere else. |
| App preferences, non-sensitive cached data | Fast key-value or embedded database storage (e.g. `react-native-mmkv`). |
| Temporary session-only data | In-memory state only — cleared on app kill, never persisted. |

- Create exactly ONE central storage-access module per app. No other file may
  call the underlying secure-storage or key-value APIs directly — always go
  through this one module.
- Never log tokens, PII, or full request/response bodies containing sensitive
  fields — sanitize before any log line or crash-report breadcrumb.

## Rule 7 — API Layer & Error Handling

### API Contract and Query Consistency Standard

Every feature API contract MUST define:
- HTTP method and endpoint;
- request schema (Zod);
- response schema (Zod + TypeScript interface);
- nullable fields;
- pagination strategy (cursor-based or offset/page-based — exactly one per endpoint);
- sort/filter parameters;
- error-code mapping;
- authorization and permission requirements;
- idempotency behavior (`Idempotency-Key` header on all POST/PATCH/PUT/DELETE mutations).

### Contract Finding and Delivery Status Taxonomy

#### Finding Codes
- `CONTRACT_NOT_FOUND_IN_WEB_ZIP` — Requested endpoint or data field is completely absent from supplied source evidence.
- `CONTRACT_AMBIGUOUS` — Evidence contains conflicting, contradictory, or multiple plausible definitions.
- `CONTRACT_CONFLICT` — Explicit contradiction between supplied contract and normative architecture/security rules.
- `CONTRACT_INCOMPLETE` — Contract declares an operation but omits required parameters, payload schema, or response model.

#### Final Delivery / Blocking Statuses
- `SOURCE_COMPLETE_AND_ARTIFACT_GENERATED` — All source code is written, verified, and packaged into the requested ZIP artifact.
- `SOURCE_COMPLETE_ARTIFACT_PENDING_HOST_PACKAGING` — All source code is completely written and verified, but archive creation CLI is unavailable.
- `SOURCE_COMPLETE_RUNTIME_VERIFICATION_DEFERRED` — Source code is complete, but live runtime (Metro, simulator, device) verification is deferred to host.
- `BLOCKED_BY_SUPPLIED_CONTRACT` — Module cannot safely proceed because a core business invariant or contract is ambiguous or contradictory.
- `BLOCKED_BY_EXPLICIT_SCOPE_RESTRICTION` — Requested changes lie strictly outside granted writable boundaries.

A finding code explains the issue.
A delivery/blocking status explains the final execution outcome.

The API layer MUST normalize server failures into a shared typed error shape:
```typescript
export interface NormalizedApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  retryable: boolean;
  requestId?: string;
}
```

Features MUST NOT parse Axios/fetch error objects directly inside screen components.

### User Message Source Rule

- Backend-originated success, validation, error, or business-result messages MUST display the verified server `response.message` when supplied.
- Client-owned static UI labels, button text, offline messages, empty states, permission instructions, confirmations, and accessibility labels MUST use `t('namespace.KEY')`.
- Backend response messages MUST NOT be passed through `t()` unless the API contract explicitly sends translation keys instead of final display text.
- Components MUST NOT invent hardcoded business-success or backend-error text.

### Mutation Execution Standards

Financial, destructive, identity, role, permission, and tenant-changing mutations:
- MUST be pessimistic (UI updates ONLY after receiving a 2xx response);
- MUST require explicit confirmation via `useConfirm()` + `ConfirmBottomSheet`;
- MUST prevent duplicate submission by locking button width (`minWidth: 120`) and disabling button during in-flight state (`disabled={isPending}`);
- MUST reconcile state against authoritative server response;
- MUST invalidate or update only affected query keys via `onSuccess: () => queryClient.invalidateQueries(...)`;
- MUST NOT be queued for silent offline replay unless explicitly approved.

- ONE central network-client module for the whole app — one HTTP client
  instance, one place where auth headers, tenant headers (`x-tenant-id`), and
  correlation IDs are attached. No feature creates its own separate HTTP client.
- Every response is normalized into ONE canonical `ApiResponse<T>` discriminated union shape:
  ```typescript
  export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

  export interface ApiSuccess<T> {
    success: true;
    message: string;
    data: T;
    meta?: PaginationMeta;
    requestId: string;
    statusCode?: number;
  }

  export interface ApiFailure {
    success: false;
    message: string;
    data: null;
    error?: string;
    errorCode: string;
    statusCode: number;
    requestId: string;
    validationErrors?: ValidationErrorItem[];
  }
  ```
  This matches the backend and web canonical envelope exactly. There is NO second or partial mobile version.
  Every feature's API layer returns this shape — never raw, un-normalized responses.
- User-facing error messages: Client-authored UI text MUST use i18n keys (`t('...')`).
  Backend `ApiResponse.message` may be shown directly only when the backend
  contract guarantees it is safe for users and localized according to the active
  request locale. If this guarantee is absent, show a translated feature fallback
  and send sanitized diagnostic context to observability only. Never expose raw Axios
  errors, JavaScript errors, stack traces, or unvalidated server text.
- Authentication expiry (401) is handled by ONE centralized
  logout/token-refresh interceptor — never ad-hoc inside individual screens.

**Typed API Verb Contract:** Every function in a feature's `*.api.ts` MUST follow
the same explicit verb naming defined by the supplied feature API contract:
- `fetchMembers(params)` — paginated list
- `fetchMemberById(id)` — single entity
- `createMember(dto)` — POST creation
- `updateMember(id, dto)` — PATCH/PUT update
- `deleteMember(id)` — DELETE
- `exportMembersReport(params)` — report/export

**Non-CRUD Domain Action Verbs:** For domain actions that are not standard CRUD operations,
use the **exact operation name defined by the supplied feature/API contract**. Mobile architecture
MUST remain decoupled from server-side implementation details.
Only the external API operation/contract is authoritative.

```typescript
// Domain action verb examples — match the external API contract exactly:
renewMembership(memberId, dto)      // POST /api/v1/members/:id/renew
suspendMember(memberId, dto)        // POST /api/v1/members/:id/suspend
restoreMember(memberId)             // POST /api/v1/members/:id/restore
activateMember(memberId)            // POST /api/v1/members/:id/activate
assignTrainer(memberId, trainerId)  // POST /api/v1/members/:id/assign-trainer
```

AI agents must never invent arbitrary function names like `loadData()`, `getData()`,
`handleAction()`, or `doMemberThing()`. The mobile API function MUST strictly mirror the documented endpoint operation intent — no arbitrary aliasing.

### Request Lifecycle and Cancellation

Every fetch/mutation hook must use the cancellation mechanism supported by the central network client and TanStack Query.

Requirements:
- Query functions receive and forward `AbortSignal` to `networkClient`.
- Screen unmount, parameter change, and replaced searches must not update stale UI.
- Debounced search must cancel the prior scheduled request before issuing the next one.
- Aborted requests must not show an error toast or error fallback.
- Retry policy must NOT retry 400 validation errors, 401/403 authorization errors, or user-cancelled requests.

## Rule 7A — Complete API Contract & UI Data Coverage

This rule defines the complete API-to-UI data coverage contract for mobile.
It closes the gap where incomplete API/mock responses cause mobile UI fields,
cards, lists, KPIs, charts, or relationships to render empty or undefined.

### The Required Chain

For every data-consuming feature, the following chain MUST be fully aligned before
the feature is considered complete:

```text
UI Requirement
      ↓
Feature API Contract (_features.md § API Contract)
      ↓
Type / Model (*.types.ts / models/*.)
      ↓
Schema / Validator (Zod schema or validator class)
      ↓
Mock / Stub Response (test boundary mock or API/server stub)
      ↓
Server-State Cache (TanStack Query)
      ↓
UI Rendering
```

### UI Data Coverage Requirement

Before creating or modifying a feature's API function or mock response, the AI agent
MUST inspect the complete consuming UI and identify the exact data required by:

- Every card and list-item field
- Every KPI / count / statistic widget
- Every chart and chart series
- Every filter, search, and sort parameter
- Every dropdown or picker option source
- Every detail-screen field
- Every modal / bottom-sheet field
- Every badge / status indicator
- Every relationship or reference displayed (e.g. plan name, owner name)
- Every pagination control
- Loading, empty, and error states

### Mutable In-Memory Mock State Mandate

When the backend is unavailable, the `mocks/` folder MUST maintain an in-memory mutable state store so that Create/Update/Delete operations produce real visible changes:

- **Create** → subsequent list refetch shows the new record
- **Update** → subsequent detail/list refetch shows changed values
- **Delete** → record disappears from subsequent list refetch

A toast-only mutation success that leaves the mock list unchanged is **FORBIDDEN**. The mock handlers MUST mutate the in-memory array so that when TanStack Query invalidates and refetches, the updated list is returned.

Structure inside `mocks/`:
- `[role_module].fixtures.ts` — initial seed data (exported mutable array)
- `[role_module].handlers.ts` — MSW handlers that read/mutate the in-memory state

```typescript
// mocks/manager_members.fixtures.ts
export let memberFixtures: Member[] = [
  { id: '1', name: 'Rahul Sharma', status: MemberStatus.ACTIVE, ... },
  { id: '2', name: 'Priya Singh', status: MemberStatus.EXPIRED, ... },
];

// mocks/manager_members.handlers.ts
http.post(MANAGER_MEMBERS_URLS.CREATE, async ({ request }) => {
  const dto = await request.json();
  const newMember = { id: uuid(), ...dto };
  memberFixtures.push(newMember); // ✅ MUTATES in-memory state
  return HttpResponse.json({
    success: true,
    message: 'Member created successfully',
    data: newMember,
    requestId: 'req-mock-create-01',
    statusCode: 201,
  });
}),
http.delete(MANAGER_MEMBERS_URLS.DELETE(':id'), ({ params }) => {
  memberFixtures = memberFixtures.filter(m => m.id !== params.id); // ✅ MUTATES
  return HttpResponse.json({
    success: true,
    message: 'Member deleted successfully',
    data: null,
    requestId: 'req-mock-delete-01',
    statusCode: 200,
  });
}),
```

During the **feature-first development phase** (before a real API endpoint exists),
the mock response used in tests and development MUST:

1. Contain **every field** that the UI actually consumes — not just the fields
   convenient for initial development.
2. Include realistic value variation across multiple records:
   - Different statuses
   - Different plan/category combinations
   - Different dates and numeric values
   - Nullable/optional fields present and absent
   - Long text values where truncation is expected
   - Enough records to exercise pagination
3. Support an **empty-result scenario** (zero records) that visibly triggers the
   `EmptyState` component.
4. Support an **error scenario** that visibly triggers the error fallback.

### Mock Scenarios Registry (`mocks/scenarios/[role_module].scenarios.ts`)

Every mobile feature module's mock suite MUST define a canonical scenarios registry at `mocks/scenarios/[role_module].scenarios.ts`.
This ensures any engineer or AI agent can immediately switch scenarios and verify all mobile UI states deterministically without manual mocking hacks.

Standard mandatory scenario keys:
1. `ACTIVE_RECORDS` (Default): Standard populated dataset for normal list/card rendering.
2. `EMPTY_DATA`: Zero records array (`data: []`, `total: 0`) to verify the module's `EmptyState` component.
3. `SERVER_500_ERROR`: Simulated 500 error response to verify the module's `ErrorFallback` boundary and retry button.
4. `NETWORK_TIMEOUT`: Simulated high latency (15,000ms delay) to verify loading skeletons, button disabled states, and offline alerts.
5. `UNAUTHORIZED_401` / `FORBIDDEN_403`: Session expiry or permission denial to verify auth recovery and session expiry toast.

```typescript
// Example: mocks/scenarios/manager_members.scenarios.ts
export const MANAGER_MEMBERS_SCENARIOS = {
  ACTIVE_RECORDS: {
    status: 200,
    envelope: {
      success: true,
      message: "OK",
      data: memberFixtures,
      meta: mockPaginationMeta,
      requestId: "req-mock-active-01",
      statusCode: 200,
    }
  },
  EMPTY_DATA: {
    status: 200,
    envelope: {
      success: true,
      message: "No members found",
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      requestId: "req-mock-empty-01",
      statusCode: 200,
    }
  },
  SERVER_500_ERROR: {
    status: 500,
    envelope: {
      success: false,
      message: "Internal server error occurred",
      data: null,
      errorCode: "ERR_INTERNAL_500",
      statusCode: 500,
      requestId: "req-mock-err-500",
    }
  },
  NETWORK_TIMEOUT: {
    delayMs: 15000,
    status: 504,
    envelope: {
      success: false,
      message: "Gateway timeout",
      data: null,
      errorCode: "ERR_TIMEOUT",
      statusCode: 504,
      requestId: "req-mock-err-504",
    }
  },
  UNAUTHORIZED_401: {
    status: 401,
    envelope: {
      success: false,
      message: "Session expired",
      data: null,
      errorCode: "ERR_UNAUTHORIZED",
      statusCode: 401,
      requestId: "req-mock-err-401",
    }
  }
} as const;
```

### Standalone Module Harness / Bootstrap (`tests/harness/bootstrap.ts` / `[Feature]Harness.tsx`)

To guarantee absolute **Feature ZIP Portability**, every mobile feature module MUST include a self-contained mounting harness located inside `tests/harness/` (e.g., `MembersHarness.tsx` or `bootstrap.ts`).

The Harness MUST:
1. Initialize the module's MSW worker with the active scenario;
2. Wrap the primary screen/component with necessary zero-business providers (`QueryClientProvider`, `SafeAreaProvider`, `NavigationContainer`, mock theme tokens);
3. Allow standalone rendering of the feature inside React Native / Expo Go / Storybook in total isolation from the rest of the application.

### Forbidden: Minimal Mock / Stub

```text
❌ INVALID — UI needs all of these:
name, phone, membershipPlan, status, expiryDate, paymentStatus

Mock returns only:
id, name, status
→ Remaining fields render empty or undefined. FORBIDDEN.

✔ REQUIRED — Mock returns:
id, name, phone, membershipPlan, status, expiryDate, paymentStatus
→ Every rendered field has a source in the mock response.
```

### Byte-for-Byte Mock & Real API Envelope Symmetry (CRITICAL)

Mock responses and Real API responses MUST share an identical, byte-for-byte schema envelope. A divergent mock shape is a critical defect that guarantees a production crash:

```text
❌ CRITICAL RUNTIME CRASH HAZARD — ASYMMETRIC MOCK CONTRACT:
Mock handler returns unwrapped data:
{
  "id": "1",
  "name": "Rahul Sharma"
}

Real Backend returns canonical ApiResponse<T> envelope:
{
  "success": true,
  "message": "Member fetched successfully",
  "data": {
    "id": "1",
    "name": "Rahul Sharma"
  },
  "requestId": "req-12345",
  "statusCode": 200
}
Consequence: Code written against the mock reads `response.name`, which passes mock tests but crashes instantly in production with `TypeError: Cannot read properties of undefined (reading 'name')`!

✔ MANDATORY CONTRACT LOCK:
Every MSW mock handler MUST return the canonical 6-field/8-field ApiResponse<T> envelope:
HttpResponse.json({
  success: true,
  message: 'Success',
  data: memberData,
  meta: paginationMeta,
  requestId: 'req-mock-123',
  statusCode: 200,
})
```

### Mandatory Mobile API Response Envelope Contract (`ApiResponse<T>`)

Every mobile API service function (`api/*.api.ts`), custom query/mutation hook, central network client (`networkClient.ts`), and MSW mock handler MUST consume and return this exact discriminated union:

```typescript
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
  requestId: string;
  statusCode?: number;
}

export interface ApiFailure {
  success: false;
  message: string;
  data: null;
  error?: string;
  errorCode: string;
  statusCode: number;
  requestId: string;
  validationErrors?: ValidationErrorItem[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

This guarantees that:
1. When checking `if (response.success)`, TypeScript narrows to `ApiSuccess<T>` where `response.data` is guaranteed to exist.
2. In error states (`else`), `response.message`, `response.statusCode`, and `response.validationErrors` are strictly accessible.
3. MSW mock responses and live backend responses remain 100% byte-for-byte symmetric with zero runtime property mismatches.

### Forbidden: Component-Level Hardcoded Fallback Data

This pattern is **forbidden**:


```typescript
// ❌ React Native — FORBIDDEN
const planName = member.planName ?? 'Basic Plan';
const revenue = stats.revenue ?? 125000;
```

when those values are required fields of the API contract. Hardcoded fallback
business data hides an incomplete mock/API response. The correct fix is:

```text
UI requires field
→ update API contract in _features.md
→ update Type / Model
→ update Schema / Validator
→ update mock/stub response
→ render from response
```

### API Endpoint Transition Rule

When the real API endpoint becomes available:
- The UI MUST continue consuming the same API contract — no screen rewrites.
- The feature API client MUST remain the same unless the backend contract
  legitimately changes (see the supplied feature API contract).
- Any contract change MUST update the corresponding Type/Model, Schema/Validator,
  mock response, `_features.md` API Contract, and tests in the same change.

### AI Verification Requirement

Before declaring a mobile feature complete, the AI MUST verify:

1. Every displayed data field has a documented source in `_features.md § API Contract`.
2. Every source field exists in the feature's Type/Model.
3. Every required field is present in the mock/stub response.
4. Every mock field is consumed correctly by the UI.
5. Cards and list items display populated values in all intended fields.
6. KPI and count widgets display non-placeholder values.
7. Charts receive complete series data.
8. Filters/search/sort/pagination produce different mocked results where applicable.
9. Empty state can actually be triggered.
10. Error state can actually be triggered.
11. No component contains hidden hardcoded business fallback data.
12. The feature works using the same API path that will be used with the real backend.

A feature MUST NOT be marked complete merely because the app builds or the screen
visually renders with placeholder values.

## Rule 7B — URL Config Contract

Every feature module MUST have exactly one `[role]_[submodule].url_config.ts` (e.g., `manager_members.url_config.ts`).

**Placement:** This file lives inside the feature's `config/` sub-folder (e.g., `src/features/frontend_manager/manager_members/config/manager_members.url_config.ts`), NOT in the feature root.

**Separation of Concerns (no conflict with Rule 20):**
- **Base URL** (e.g., `https://api.example.com`) lives in Rule 20 infrastructure — defined per environment via native build configuration and set centrally in the network client. Feature modules MUST NOT define or read the base URL.
- **Endpoint paths** (e.g., `/api/v1/manager/members`) are feature-owned and MUST live in this file.

This file MUST export:
1. All API endpoint path strings as named constants.
2. A typed `MODULE_URLS` object grouping all endpoints.
3. NO hardcoded base URLs — only paths relative to the API base.
4. NO business logic — only URL path string definitions.

Example export shape:
```typescript
// src/features/frontend_manager/manager_members/config/manager_members.url_config.ts
export const MANAGER_MEMBERS_URLS = {
  LIST:   '/api/v1/manager/members',
  DETAIL: (id: string) => `/api/v1/manager/members/${id}`,
  CREATE: '/api/v1/manager/members',
} as const;
```
This guarantees a single source of truth for endpoints and prevents scattered hardcoded URL strings inside the `*.api.ts` file.

## Rule 7C — Query Key Registry (Canonical Factory Pattern)

Every feature module MUST contain a dedicated query key registry file inside its `api/` or `config/` folder (e.g., `manager_members.query_keys.ts`). This prevents the AI from inventing inconsistent, uncoordinated query keys like `['members']`, `['member']`, or `['member-list']`.

```typescript
// src/features/frontend_manager/manager_members/api/manager_members.query_keys.ts
export const MANAGER_MEMBERS_QUERY_KEYS = {
  all:     ['manager_members'] as const,
  lists:   () => [...MANAGER_MEMBERS_QUERY_KEYS.all, 'list'] as const,
  list:    (filters: Record<string, unknown>) =>
             [...MANAGER_MEMBERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...MANAGER_MEMBERS_QUERY_KEYS.all, 'detail'] as const,
  detail:  (id: string) =>
             [...MANAGER_MEMBERS_QUERY_KEYS.details(), id] as const,
};
```

### Resource Identity Preservation Rule

Whenever data belongs to a specific resource, query keys MUST include the resource identity.

```
❌ Forbidden:
  ['member']
  ['members']
  ['profile']

✅ Required:
  ['manager_members', 'detail', memberId]
  ['admin_attendance', 'list', { page: 1 }]
  ['manager_members', 'detail', gymId]
```

Two different resources MUST NOT share the same cache entry. Resource identity must remain consistent across:
```
Route → Selected Resource → Query Key → Request Parameter → API Response → Rendered UI
```
A route representing Resource A MUST NOT display cached data from Resource B. This is a **CRITICAL architectural violation**.

### Dedicated Mutation Hook Rule

Mutations MUST be orchestrated through dedicated, named mutation hooks (e.g., `useCreateMember.ts`, `useDeleteMember.ts`).
Screens and components MUST NEVER call `useMutation` directly or mix mutation logic inside JSX or Screen components.

```typescript
// ❌ BAD — mutation logic inlined in screen
function ManagerMembersAddScreen() {
  const { mutate } = useMutation({ mutationFn: createMember });
  // ...
}

// ✅ GOOD — dedicated mutation hook with onSuccess cache invalidation
// hooks/useCreateManagerMember.ts
export function useCreateManagerMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // onSuccess IS REQUIRED here for cache invalidation — this is the canonical pattern
      queryClient.invalidateQueries({ queryKey: MANAGER_MEMBERS_QUERY_KEYS.lists() });
    },
  });
}
```

Cross-reference: Rule 60 (cache invalidation), Rule 7C (query key registry).

## Rule 8 — Lists & Rendering Performance

### Rule 8A — Virtualization Threshold & List Performance (> 50 Items)
- Any list rendering more than ~20 items MUST use a virtualization-aware list component.
- For collections with potential **> 50 items**, Shopify's `@shopify/flash-list` (or optimized `FlatList` with `windowSize={5}`, `initialNumToRender={10}`, and `removeClippedSubviews={true}`) is **MANDATORY**.
- Naively mapping arrays inside a `ScrollView` or wrapping hundreds of dynamic items in raw `<View>` containers is STRICTLY FORBIDDEN (causes memory bloat and frame drops).
- List item components must be render-stable (memoized with `React.memo` or `useMemo`) with stable `keyExtractor={(item) => item.id}` to avoid unnecessary re-renders.

### Rule 8B — Live Search & Filter Debounce Standard (≥ 300ms)
- All live search inputs, query text bars, and rapid filter selectors MUST be debounced by a minimum of **300ms** (recommended: 300ms–500ms) using a dedicated `useDebounce` hook before triggering TanStack Query key updates or API network requests.
- Firing an API request or cache invalidation on every single keystroke is STRICTLY FORBIDDEN (prevents mobile battery drain, UI stutter, and backend request flooding).

```typescript
// ✅ REQUIRED — Canonical search debounce pattern in mobile hooks/screens
const [rawSearchQuery, setRawSearchQuery] = useState('');
const debouncedSearch = useDebounce(rawSearchQuery, 300);

// TanStack Query consumes the debounced value only
const { data, isPending } = useManagerMembersList({ search: debouncedSearch, page: 1 });
```

## Rule 9 — Images & Media Assets

- Use React Native's optimized image-loading mechanism exclusively — one that
  supports caching, placeholders, and format negotiation (e.g., `react-native-fast-image`
  — never the bare core `Image` or Expo Image).
- Always specify explicit dimensions or aspect ratio for network images to
  prevent layout shift while loading.
- Bundled assets are referenced statically — never construct a dynamically
  computed asset path at runtime; bundlers cannot resolve those reliably.

## Rule 10 — Iconography

- Use ONE icon library/family for the entire app — `lucide-react-native` is the canonical icon library (100% symmetry with Web's `lucide-react`). Never mix icon sets.
- Icon sizes and stroke/weight values must reference tokens from `MOBILE_UI_UX_DESIGN.md` — never arbitrary numeric values per usage.

## Rule 10A — Keyboard Safety for Forms (MANDATORY)

Every form screen and form bottom-sheet MUST handle mobile keyboard correctly to prevent the keyboard from covering inputs and the Submit button.

```typescript
// ✅ REQUIRED — every form screen/sheet
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    {/* form fields and submit button */}
  </ScrollView>
</KeyboardAvoidingView>
```

Rules:
- `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` is MANDATORY on every screen/sheet containing form inputs.
- `ScrollView` wrapping form content MUST have `keyboardShouldPersistTaps="handled"` so tapping outside an input dismisses the keyboard without losing the tap event.
- Never use a plain `<View>` as the root of a form screen — it will cause the keyboard to cover the Submit button on small screens.

## Rule 10B — Pull-to-Refresh (MANDATORY for User-Browsable Lists)

Every user-browsable list (`FlatList` / `FlashList`) that displays server-fetched data MUST implement pull-to-refresh.

```typescript
// ✅ REQUIRED — every server-backed FlatList/FlashList
const { data, isPending, isRefetching, refetch } = useManagerMembers(params);

<FlashList
  data={data?.data ?? []}
  refreshing={isRefetching}
  onRefresh={refetch}
/>
```

Rules:
- `refreshing={isRefetching}` — use TanStack Query's `isRefetching` (not a manual boolean state).
- `onRefresh={refetch}` — calls TanStack Query's `refetch` directly.
- Pull-to-refresh MUST be wired on every list that a user would expect to refresh (members, attendance, payments, etc.).
- Static/configuration lists (e.g., plan type dropdowns) are exempt.

## Rule 11 — Animations, Gestures, & Haptics (The WOW Factor)

- Use React Native's high-performance animation system (a UI-thread-driven
  animation library like `react-native-reanimated` rather than the legacy JS-thread animation API).
- Use `react-native-gesture-handler` for swipe/pan/pinch —
  never reconstruct gesture recognition manually from raw touch events.
- Respect the OS-level reduced-motion accessibility setting — skip or shorten
  non-essential animations when the user has that setting enabled.
- Centralize reusable animation presets (durations, easing curves, spring
  configs) in one shared module — never redefine the same values per screen.
- **Haptic Feedback (Premium Feel):** To achieve a world-class SaaS feel, critical interactions MUST be accompanied by appropriate haptic feedback using `react-native-haptic-feedback` (NOT expo-haptics).
  - Use light impact for minor state changes (e.g., toggling a switch).
  - Use success notifications for successful mutations (e.g., saving a form).
  - Use error notifications for destructive actions or validation failures.

## Rule 12 — Charts & Data Visualization

- Use a native-rendering React Native charting package (`react-native-gifted-charts` is the canonical library for this project) — never a
  DOM/SVG/Canvas-web-only charting library, none of which render on mobile.
- Chart color palettes must pull from the design system's chart tokens — never
  hardcoded hex values per chart instance.
- “Never DOM/SVG/Canvas-web-only” means browser-only rendering libraries are forbidden.
  Native-rendered React Native SVG through an approved dependency (e.g. `react-native-svg`)
  is permitted only when it is required by an approved React Native library and renders through
  native React Native primitives rather than a WebView or browser DOM.

## Rule 13 — Platform-Specific Code

- Isolate genuinely divergent iOS/Android implementations into separate
  platform-specific files (e.g. `.ios.ts`, `.android.ts`) — not scattered inline
  platform checks throughout shared files.
- Inline `Platform.OS` / `Platform.select` checks MUST NOT exceed 2 occurrences per file (restricted strictly to minor style offsets such as shadow or border-radius). Any component requiring 3 or more platform checks MUST be split into `.ios.tsx` and `.android.tsx` files.
- Every platform-specific behavior (permission dialog wording, native UI
  quirks) must be noted in that feature's `_features.md` (Rule 24).

## Rule 14 — Permissions & Native Modules

- All permission requests (camera, location, notifications, media, contacts,
  biometrics) go through ONE central permissions module — no component or
  screen calls a native permission API directly.
- Before adding any new native dependency, verify it fully supports React Native's
  current-generation architecture (New Architecture / Fabric / TurboModules) —
  do not add a package flagged legacy-only without a documented, reviewed exception.
- Maintain an approved-dependency list per category (networking, forms,
  validation, state, storage, lists, images, icons, animation, charts,
  notifications, crash reporting) in `/docs/decisions/approved-dependencies.md`
  — extend only with written justification.

## Rule 15 — Push Notifications

- Token registration, permission flow, and notification-tap handling are each
  centralized in ONE module — never duplicated per screen.
- Notification-tap deep links resolve through the SAME central navigation
  definition used elsewhere in the app (Rule 2) — no separate ad-hoc routing
  logic for notifications.

## Rule 16 — Offline-First & Sync

- Default assumption: the app requires network connectivity. Offline support
  is opt-in per feature, explicitly justified — not a blanket architecture
  decision.
- Any feature requiring offline reads persists its server-state cache (Rule 4)
  to local storage, documented in that feature's `_features.md`, including
  cache invalidation triggers.
- Any offline write (queued mutation) requires an explicit, written
  conflict-resolution strategy — never silently assume "last write wins."
- **OfflineBanner vs OfflineBlocker distinction (MANDATORY):**
  - `[Feature]OfflineBanner` — inline non-blocking banner shown when network is lost BUT cached data is still visible. User can still browse stale data.
  - `[Feature]OfflineBlocker` — full-screen blocking component shown ONLY when the feature has NO cached data AND requires network to function at all (e.g., payment processing). Never use `OfflineBlocker` when cached data can be shown. Only for features that explicitly declare offline support in `_features.md`.

### Offline Support Contract

Offline support is declared feature-by-feature in `_features.md`.

For each offline-enabled feature document:
- Readable resources eligible for cache;
- Cache TTL / staleness policy;
- Tenant and user binding;
- Encryption requirement if cached data contains sensitive content (encrypted via MMKV encryption key stored in Keychain);
- Invalidation triggers: logout, tenant switch, role change, schema version change, app upgrade, explicit refresh;
- Empty-cache offline behavior (`OfflineBlocker`);
- Whether writes are blocked or queued;
- Conflict strategy: server-wins, client-wins, merge, or manual resolution;
- UI components: `OfflineBanner` (when cache exists) and/or `OfflineBlocker` (when no cache exists);
- Retry behavior and idempotency requirements.

**CRITICAL SECURITY INVARIANT:** Never retain cached data after logout or tenant change. Clear all feature cache upon session invalidation.

## Rule 17 — Testing (Full Pyramid)

- **Unit tests (Jest):** Pure business logic, validators, formatters, and utility functions
  are co-located directly beside the source file they test.
- **Component/widget tests (@testing-library/react-native):** Every non-trivial component/widget MUST have its
  matching test file co-located directly beside the component/widget file it tests.
  The feature-level `tests/` directory is reserved ONLY for integration-level tests
  that exercise multiple feature files together.
- **Integration tests:** Live inside the feature's `tests/` directory and verify
  multi-file feature flows, API/mock integration, state coordination, and critical
  feature behavior.
- **E2E tests (Maestro) - AI Zip Principle:**
  1. **Top-Level Mirrored Folders (Canonical Maestro E2E Location):** E2E tests MUST live in a completely separate top-level `mobile_e2e/` directory, entirely decoupled from the application code:
```text
mobile_e2e/
└── frontend_{role}_e2e/
    └── {role}_{module}/
        ├── {role}_{module}.yaml
        └── helpers/
            └── login.yaml
```
The canonical path is `mobile_e2e/frontend_{role}_e2e/{role}_{feature}/{role}_{feature}.yaml`.
Never dump executable E2E YAML files into the `src/features/` folder. The feature's `_features.md` MUST reference its corresponding Maestro suite, but executable E2E assets remain exclusively in `mobile_e2e/`.
Each `mobile_e2e/frontend_{role}_e2e/{role}_{module}/` folder is self-contained. Business-specific E2E helpers MUST be duplicated at module level under strict WET. No shared global `mobile_e2e` helper directory is permitted.
  2. **WET Over DRY (Module-Level Isolation):** Mobile E2E tests must be 100% self-contained at the **MODULE level**. Do NOT create a global `shared/` or `utils/` folder for E2E. If both the `manager_members` test and `manager_dashboard` test need a login helper script, duplicate it directly into BOTH folders.
     - **Why:** If a bug occurs in the manager_members mobile flow, a developer must be able to ZIP only the `mobile_e2e/frontend_manager_e2e/manager_members/` folder and feed it to an AI. If the AI is missing parent helpers, it loses context and breaks the test.
  3. **No Cross-Module Imports:** A test script in `frontend_manager_e2e/manager_members/` MUST NOT import a fixture or helper from `frontend_manager_e2e/manager_dashboard/`. Isolation is absolute.
- Native modules (camera, biometrics, secure storage, notifications) are
  mocked at the test boundary — unit and component tests never touch a real
  native API.
- No feature is considered complete without its core logic/component tests
  passing — tracked in that feature's `_features.md` checklist.

### AI Test Integrity Gate

A test file existing is NOT sufficient evidence of testing.

The AI MUST NOT satisfy a test requirement with:
- Placeholder assertions (e.g. `expect(true).toBe(true)`, `expect(1).toEqual(1)`)
- Empty test bodies or `// TODO: add assertions`
- Snapshot-only tests for behavior that requires interaction testing
- Tests that only verify a component or widget mounts without asserting rendered data
- Mocked values that are completely unrelated to the feature's API contract
- Tests that pass while the UI visibly renders empty or incorrect data

Every required test MUST verify **observable behavior**, not implementation details.

For API-driven features, tests MUST verify:

1. Mock/stub response is returned through the real feature API path (not injected
   directly into the widget/component).
2. All required UI fields render the correct values from the mock response —
   this directly verifies Rule 7A fixture completeness.
3. Loading state appears while the request is pending.
4. Empty state component appears when the mock response contains zero records.
5. Error fallback appears when the mock request fails.
6. Search/filter/sort/pagination interactions change the requested parameters
   where applicable (verify the outgoing request, not just the rendered result).
7. Mutation success updates the UI only according to the feature's mutation
   policy (pessimistic — wait for 2xx, per Rule 4).
8. Backend `response.message` is surfaced for all user-facing API errors and
   successes — no hardcoded strings (Rule 7).
9. Critical user flows (add, edit, delete, renewal, payment) are covered by
   integration or E2E tests with a real app process.

**A test suite is considered incomplete if the application can visually fail
while all tests still pass.**

```text
npm test → PASS

does NOT mean:

feature is correct

It means:
the tests that were written happened to pass.
If those tests did not verify the right behavior,
the feature can be broken and PASS at the same time.
```

## Rule 18 — Native Build & Code Signing

- Android: signing keystore is generated once, backed up securely (encrypted,
  outside the repository), and never committed to version control. Use the
  platform's managed app-signing service where available to reduce upload-key
  exposure risk.
- iOS: distribution certificates and provisioning profiles are managed through
  a single, auditable process (e.g. a shared signing-management tool like
  fastlane match) — never distributed as ad-hoc files over chat/email.
- All signing secrets live ONLY in the CI/CD platform's protected secret store
  — never in the repository, build scripts, or plain-text config files.
- Build configuration (app ID, version code/name, bundle identifiers per
  environment) is generated from one central config source per environment —
  never manually edited per release.

## Rule 19 — CI/CD Pipeline

> Note: The architecture explicitly separates CI/CD concerns to prevent vendor lock-in.

- **CI (every pull request):** format check, static analysis/lint, run the
  full test pyramid (Rule 17), produce an unsigned development build. Must
  NOT have access to production signing secrets.
- **CD (on release tag / manual approval):** restore signing credentials from
  protected secrets, produce a signed release artifact (Android App
  Bundle / iOS IPA), upload to the store's internal/beta testing track.
- Use a general-purpose CI orchestrator paired with a dedicated mobile release-automation
  tool for signing and store upload. Do not tightly couple to a single vendor's all-in-one
  stack; treat each capability (build, test, distribute, monitor) as independently replaceable.
- Production deployment jobs sit behind a protected environment requiring
  manual approval and branch restrictions — no direct, unreviewed path from a
  feature branch to a store release.
- Pin the framework/SDK version and commit the dependency lockfile for
  reproducible builds — never build against a floating "latest" SDK version.

## Rule 20 — Environment & Configuration Management

### Environment Configuration Contract

Feature code MUST NOT read environment variables directly (no `process.env.*` in features).

Only `src/core/config/` may read build-time or runtime configuration.
The config module MUST:
- validate required values at startup;
- expose typed, non-secret configuration interfaces;
- separate development, staging, and production environments;
- never expose signing secrets, private keys, or server-only secrets to the mobile app bundle;
- document every public configuration field.

- Base URLs and non-sensitive build configuration MUST be defined per environment
  through the native iOS scheme / Android build-variant mechanism.
- Secrets MUST exist only in CI/CD protected secret storage and MUST NOT be bundled
  into the application binary.
- Runtime feature flags MUST be fetched from the backend and accessed only through
  the centralized `useFeatureFlag()` mechanism.
- No component or screen reads a raw environment variable or config file
  directly — always go through the central config-access module or feature flag hook
  which validates presence/shape at app startup or runtime.

> **Separation of Infra vs Feature URL Concerns:** Rule 20 governs the BASE URL (scheme + host + port) only.
> Feature endpoint PATHS live in each feature's `config/manager_members.url_config.ts` (Rule 7B).
> These two concerns MUST NEVER be merged into a single file or a single rule.

## Rule 21 — Over-The-Air (OTA) Updates & Hotfix Strategy

- OTA/JS-only patch delivery is OPTIONAL and must be a deliberate, documented
  decision — not a default assumption. For regulated or high-compliance
  industries, evaluate whether OTA patching is even permitted by internal
  policy before adopting it.
- If adopted: OTA covers script/asset changes ONLY. Any change touching
  native code, permissions, or native dependencies requires a full,
  store-reviewed release — never attempt to OTA around a native change.
- Choose ONE OTA mechanism appropriate to the framework and host it under
  your own infrastructure or a vetted managed provider — document the exact
  provider/self-hosted setup in `/docs/decisions/ota-strategy.md`, including
  rollback procedure and phased-rollout percentages.
- Every OTA push follows the same staged-rollout discipline as a full release
  (see Rule 27) — never push an OTA update to 100% of users immediately.

## Rule 22 — Security Scanning & Dependency Guardrails

### Mandatory Architecture CI Gates

Every pull request affecting mobile code MUST run and pass:

1. Typecheck (`tsc --noEmit`)
2. ESLint
3. Unit and integration tests (`jest`)
4. Feature-boundary import check (no sibling feature imports)
5. No-barrel-file check (no `index.ts` in feature folders)
6. Naming convention check (Role+Module prefixed files)
7. File-size ceiling check (Screen ≤80, Component ≤200, Hook ≤150, Store ≤180, Util ≤120 lines)
8. Raw visual-value / token enforcement check
9. Theme token synchronization and contrast check (WCAG AA 4.5:1)
10. Deterministic testID coverage check (`[role]_[module]-[component]-[action/state]`)
11. Forbidden dependency/import check (no `expo-*`, no `react-native-vector-icons`)
12. Secret scan
13. Dependency vulnerability scan (SCA)
14. Documentation-trio presence and freshness check
15. Feature API/query-key/url-config presence check

### Required CI Script Contract

The repository MUST expose these stable scripts or equivalent CI jobs:
- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint` (`eslint .`)
- `npm run test:unit` (`jest --testPathPattern=tests/.*\.test\.tsx?`)
- `npm run test:integration` (`jest --testPathPattern=tests/.*\.integration\.test\.tsx?`)
- `npm run architecture:boundaries` (verifies zero sibling feature imports)
- `npm run architecture:naming` (verifies Role+Module prefix conventions)
- `npm run architecture:file-size` (verifies line ceilings and architecture-exception tags)
- `npm run architecture:no-barrels` (verifies zero index.ts/tsx files)
- `npm run design:tokens` (verifies zero raw hex colors and 100% token usage)
- `npm run design:contrast` (verifies WCAG AA 4.5:1 contrast on semantic pairs)
- `npm run accessibility:static` (verifies accessible names, roles, and touch targets)
- `npm run docs:validate` (verifies presence and freshness frontmatter of _features.md, _forbidden.md, _theme_contract.md)
- `npm run security:secrets` (verifies zero committed credentials or keys)
- `npm run security:dependencies` (runs npm audit / SCA scan)
- `npm run e2e:maestro` (executes Maestro YAML suites)

Every CI job MUST report:
1. Rule / check name;
2. Affected file;
3. Line number or import path where available;
4. Remediation guidance.

A passing check without file-level evidence is insufficient for compliance reporting.

### Mechanical CI Failure Conditions (FAIL if):
- `../../frontend_*` imports a sibling feature
- any feature imports from another feature except explicitly permitted read-only type contracts
- `index.ts` or `index.tsx` exists as a barrel file
- `expo-*` or `@expo/*` is imported
- `react-native-vector-icons` is imported
- raw `#hex` / `rgb` / `rgba` visual color appears in feature UI
- static `tokens.ts` is imported directly in feature UI
- a feature lacks `_features.md`, `_forbidden.md`, or `_theme_contract.md`
- a screen exceeds its documented responsibility boundary (e.g. direct API calls)
- an interactive control lacks a stable `testID`

- CI runs, on every push: (a) a software-composition-analysis (SCA)
  dependency vulnerability scan, (b) a secret-scanning check. Both must pass
  before merge.
- Code ownership (`CODEOWNERS`) requires mandatory human review on:
  - the central network client
  - the central storage module
  - the central permissions module
  - the central config module
  - **any auth flow and token-refresh logic**
  - **any payment or financial mutation**
  - any native build/signing config
  These paths MUST NEVER merge without a required human approval gate. *(PR merge gate only: This gate applies strictly at deployment/merge time. AI agents MUST generate complete code, unit/E2E tests, and security impact documentation autonomously without pausing, stalling, or asking for permission during development).*
- No new dependency is added without:
  1. Checking the `/docs/decisions/approved-dependencies.md` list first.
  2. Confirming current-generation architecture compatibility (Rule 0 / Rule 14).
  3. Passing a vulnerability scan.
  4. Adding a written justification for why no existing approved library suffices.

**AI Dependency-Addition Guardrail:** An AI agent CANNOT add a new dependency
(`npm install` / `yarn add`) without first checking the approved-dependency list.
Before proposing a new library, the AI must explicitly explain why an existing
approved library (e.g. `react-native-keychain`, `zustand`, `react-hook-form`,
`zod`, `@tanstack/react-query`, `react-native-fast-image`, `date-fns`,
`react-native-reanimated`) does not suffice for the task.

## Rule 23 — Observability & Crash Reporting

### Privacy-Safe Observability Contract

Every telemetry event MUST define:
- event name;
- feature/module name;
- action;
- outcome (`success` | `failure` | `cancelled`);
- non-sensitive error code where applicable;
- app version;
- platform (`ios` | `android`);
- correlation/request ID where available.

Telemetry MUST NOT contain:
- access tokens or refresh tokens;
- OTPs or passwords;
- full phone numbers or email addresses;
- bank account details or credit card numbers;
- national IDs (Aadhaar, SSN, PAN);
- unmasked customer/member PII;
- raw API request or response bodies.

All telemetry fields must pass through the central PII-redaction layer in `src/core/observability/sanitizeTelemetry.ts`.

- Crash reporting and JS exception tracking wired at app root, before
  any other initialization — use a React Native crash-reporting SDK
  (e.g. Sentry or Firebase Crashlytics).
- Every centralized module (network client, storage, permissions) reports
  errors with enough context (feature name, action attempted) to trace an
  issue without needing physical device logs.
- Track crash-free-rate and release health per version — mobile crashes are
  unrecoverable by "just refresh" the way a web page is, making this a
  release-blocking concern, not optional polish.

## Rule 24 — AI-Context Documentation (THE MODULARIZATION CONTRACT)

**This is the most important rule for AI-driven development.**

Every feature folder MUST contain a file named `[featureName]_features.md`.
This file is the single source of truth for that feature — an AI given ONLY
this file plus the feature folder must be able to fully understand, modify,
or debug it without reading any other part of the codebase.

**Before modifying a feature, read its `_features.md` in full first.**
If it is missing or stale, updating it is part of the same change — a feature
is never "done" while its context file is out of date.

### Source Code as Last Resort Mandate
An AI agent or engineer MUST be able to completely understand the feature's business purpose, user flows, state lifecycle, API contracts, permissions, test requirements, and edge cases purely by reading `_features.md` and `_forbidden.md`.
- **The Rule:** Source code inspection MUST be the last resort, never the starting point.
- **The Rationale:** When an AI is forced to reverse-engineer business intent from JSX markup and complex React hooks, hallucinations soar to 80%. When the AI operates against verified contract documentation, guessing drops below 5%. If an AI cannot understand the feature without opening source code files, the documentation has FAILED.

### Read-Only Core Contract Pack

AI editable scope is limited to the target feature folder by default.

However, each AI task MUST also receive a read-only Core Contract Pack containing
only public interfaces required to safely compile and integrate the feature:

- `src/core/auth/` public session and authorization contracts;
- `src/core/network/` public network-client and API response contracts;
- `src/core/theme/` public `useThemeTokens`, token types, and visual helper APIs;
- `src/core/navigation/` public route-registration and route-param contracts;
- `src/core/permissions/` public permission service contracts;
- `src/core/i18n/` translation function and locale contracts;
- TypeScript path alias configuration;
- approved dependency registry.

AI MUST NOT modify Core Contract Pack files unless the task explicitly authorizes
a core/infrastructure change and required ownership review is present.

AI MUST NOT read or modify sibling feature business logic by default.

### The Documentation Quality Standard

**CRITICAL — The difference between useful and useless documentation:**

❌ **BAD (what AI agents produce by default — completely useless):**
```
## Purpose
Handles members operations, UI display, and logic isolation.

## Screens & Entry Points
| Members Screen | /members | All roles |

## Edge Cases / AI Warnings
- Do not bypass API interceptors.
- Do not mix complex logic with UI.
```

✅ **GOOD (what this rule mandates — gives full context to any AI or human):**
```
## Purpose
The Members feature is the primary member management interface for gym managers.
Managers can view all branch members, add new members via a multi-step form, renew
memberships, record payments, and assign diet/workout plans. Trainers see ONLY their
assigned members with no financial data visible.

## Screens & Entry Points
| MembersListScreen   | members/list       | MANAGER (all members), TRAINER (assigned only) |
| MembersDetailScreen | members/detail/:id | MANAGER, TRAINER                               |
| MembersAddScreen    | members/add        | MANAGER only                                   |

## Edge Cases / AI Warnings
- Deleting a member removes ALL their membership history permanently. The confirmation
  bottom sheet must explicitly state this. Do not soften the message.
- The Add Member form is a 3-step wizard. Step 2 fetches live plan data from fetchPlans()
  — do NOT hardcode plan options in the form.
- Phone numbers must be masked (98****2310) in MembersMemberCard — full number visible
  only in MembersDetailScreen. Never remove masking from the list view.
- Member IDs are UUIDs. Never use array index as a FlatList/FlatList key.
```

**The rule:** if a section contains "TBD", "Handles X operations", "Do not bypass API
interceptors", or any other generic filler, the documentation **FAILS** this rule and
must be rewritten before the feature is considered complete.

### Mandatory `_features.md` Template with Content Requirements

Every `_features.md` MUST use this structure. Each section has mandatory content depth
requirements listed inline.

```markdown
---
feature: "[role]_[submodule]"
owner_role: "[role]"
module_version: 1
api_contract_source: "verified-api-contract | normative-rules"
last_verified_date: "YYYY-MM-DD"
last_verified_commit: "commit-sha-or-host-unavailable"
documentation_status: "current"
portability_score: "8/8"
---

# [Submodule Name] — Feature Map (ALL 22 CANONICAL SECTIONS)

## 1. Scope and Non-Scope (Module Purpose, System Context & Dependencies)
[REQUIRED: 3–6 sentences. Must answer: (1) What business problem does this sub-module solve?
(2) Who uses it (which role/persona)? (3) What are the 3–5 most important things a user
can DO in this sub-module? (4) What is strictly OFF-LIMITS for this role in this sub-module?
If an AI or engineer has only 30 seconds, reading this section alone must convey complete business context.
Generic phrases like "handles X operations" are forbidden.]

### Feature Ownership & System Context
- **Feature / Role Owner:** [e.g., "Gym Manager / Operations Team"]
- **Backend Microservice / API Base:** [e.g., "members-service (`/api/v1/manager/members`)"]
- **Authoritative Database Tables:** [e.g., `members`, `memberships`, `member_attendance_logs`]
- **Background / Queued Jobs:** [e.g., `member_sync_queue`, `biometric_device_sync_cron` — "None" if purely synchronous]

### Dependency Manifest
- **State Pattern:** TanStack Query v5 (server state) + Zustand (UI transient state) + React Navigation `RouteProp` (route params)
- **Form & Validation:** React Hook Form + Zod schemas
- **Icons & Native Primitives:** `lucide-react-native` + React Native Bare-Metal / Reanimated

### Autonomous Sub-Module Directory Structure
| Folder | Responsibility | Key Files |
|---|---|---|
| `screens/` | Thin screen orchestrators (≤80 lines, zero business logic) | `ManagerMembersListScreen.tsx`, `ManagerMembersDetailScreen.tsx` |
| `components/` | Presentational UI components and bottom sheets (≤200 lines) | `ManagerMembersMemberCard.tsx`, `ManagerMembersFilterSheet.tsx`, `ManagerMembersEmptyState.tsx` |
| `hooks/` | Domain query and mutation hooks (≤150 lines) | `useManagerMembersList.ts`, `useManagerMembersMutations.ts` |
| `api/` | All API calls for this sub-module via `networkClient` | `manager_members.api.ts` |
| `types/` | TypeScript interfaces for entities, navigation param lists, DTOs | `manager_members.types.ts` |
| `schemas/` | Zod validation schemas for forms and payloads | `manager_members.schemas.ts` |
| `state/` | Feature-scoped Zustand store for transient UI state (≤180 lines) | `useManagerMembersStore.ts` |
| `config/` | Sub-module route constants and URL definitions | `manager_members.url_config.ts` |
| `mocks/` | Module-specific MSW handlers, fixtures, and scenarios | `manager_members.handlers.ts`, `manager_members.fixtures.ts`, `manager_members.scenarios.ts` |
| `tests/` | Integration tests and standalone mounting harness | `manager_members.integration.test.ts`, `MembersHarness.tsx`, `bootstrap.ts` |

### Approved External Dependencies & Expected Host Contract
[REQUIRED: Maximum 7 Application Infrastructure items permitted under the Feature Dependency Budget. Each dependency MUST document its exact expected TypeScript interface/contract so an isolated AI never guesses.]

- `src/core/network/networkClient.ts` — `networkClient.get/post/patch/delete<T>(endpoint, body?, options?): Promise<ApiResponse<T>>`
- `src/core/theme/` — `useThemeTokens()` returning typed design tokens
- `src/core/utils/formatters.ts` — `displayValue(val, fallback?)`, `formatNumber(value, locale)`, `formatPercent(value, locale)`
- `src/core/toast/` — `showToast(message, type, dedupKey?)`
- Host Session Context — `interface ExpectedAuthUser { id: string; role: Role; branchId: string; }`

Business Feature Dependencies:
- None (STRICTLY FORBIDDEN under Strict WET Principal)

Role-Level Business Dependencies:
- None

## 2. Screen Inventory & Component Responsibility Map
[REQUIRED: Every distinct user-facing screen or sheet gets its own row. "Core UI" is NOT a feature.
Each row must have a real Purpose description, real API endpoints, and an accurate Status.]

| Screen / Sheet | Route / Stack Name | What the User Can Do | Key Components | Main API Calls | Status |
|---|---|---|---|---|---|
| Members List | `ManagerMembersList` | View paginated list, search, pull-to-refresh, tap card to navigate to detail | `ManagerMembersMemberCard.tsx`, `ManagerMembersFilterSheet.tsx` | `fetchMembers()` | Complete |
| Member Detail | `ManagerMembersDetail` | View profile tabs, status badge, renewal CTA | `ManagerMembersDetailHeader.tsx`, `ManagerMembersTabs.tsx` | `fetchMemberById()` | Complete |
| Add Member Sheet | `ManagerMembersAdd` | 3-step registration wizard: Personal Info → Plan → Payment | `ManagerMembersAddForm.tsx` | `createMember()` | Complete |

### Component Responsibility Map
[REQUIRED: Lists every component file with a one-line responsibility statement so an AI knows exactly which file to open.]

| Component File | Responsibility |
|---|---|
| `ManagerMembersListScreen.tsx` | Thin screen orchestrator (≤80 lines). Renders SafeAreaView and MainView. |
| `ManagerMembersMainView.tsx` | Composes header, search bar, and FlashList. Zero direct API calls. |
| `ManagerMembersMemberCard.tsx` | Single list item with masked phone. Handles tap → navigates to detail. |
| `ManagerMembersDetailScreen.tsx` | Screen wrapper for member profile. Extracts route param `memberId`. |
| `ManagerMembersEmptyState.tsx` | Empty state shown when list has zero items. Has "Add Member" CTA. |
| `ManagerMembersListSkeleton.tsx` | Loading skeleton matching member card dimensions. |

## 3. Navigation Contract & User Flows
[REQUIRED: Document internal screen route names, typed navigation params, and 2–4 most important multi-step user journeys.]

```typescript
export type ManagerMembersParamList = {
  ManagerMembersList: { statusFilter?: string };
  ManagerMembersDetail: { memberId: string };
  ManagerMembersAdd: undefined;
};
```

### Flow 1: Add New Member
1. Manager taps "Add Member" FAB in `ManagerMembersListScreen`
2. `ManagerMembersAdd` screen/sheet pushes onto stack
3. 3-step form: Personal Info → Plan Selection (fetches live plans) → Payment
4. On submit: `createMember(dto)` called with `Idempotency-Key: UUIDv4`
5. On success: query cache invalidated, sheet dismisses, toast shows backend message
6. On error: form preserves entered data, inline error displayed from `response.validationErrors` or `response.message`

### Flow 2: View & Renew Member
1. User taps member card in list → `navigation.navigate('ManagerMembersDetail', { memberId })`
2. Detail screen fetches member profile via `useManagerMembersDetail(memberId)`
3. User taps "Renew" CTA → bottom sheet opens with pre-filled plan
4. On confirm: `renewMembership(id, dto)` called → query cache invalidated → toast displayed

### Logical Integration Points (Zero Code Imports)
| Target Domain / Feature | Interaction Type | Data Flow / Event | Isolation Mechanism |
|---|---|---|---|
| `admin_members` | Entity Identity | Consumes `memberId` via route params | Zero code imports; state passed purely via typed route params |
| `admin_billing` | Payment Status | Triggers billing stack redirect or receives payment verification via API | Decoupled via centralized API endpoint / route config |
| `notifications` | Async Alert | Dispatches or listens to server-sent WebSocket events | Centralized `WebSocketContext` at `src/core/`, zero feature-to-feature imports |

## 4. API Contract & UI Data Requirements
[REQUIRED: Every API function in the module's API file must be listed with its exact
HTTP method, endpoint, request shape, and response type. All calls return `ApiResponse<T>`.]

| Function | Method | Endpoint | Request | Response `data` type |
|---|---|---|---|---|
| `fetchMembers(params)` | GET | `/api/v1/manager/members` | `{ page, limit, search, status }` | `Member[]` + `PaginationMeta` |
| `fetchMemberById(id)` | GET | `/api/v1/manager/members/:id` | — | `MemberDetail` |
| `createMember(dto, key)` | POST | `/api/v1/manager/members` | `CreateMemberDto` | `Member` |
| `updateMember(id, dto)` | PATCH | `/api/v1/manager/members/:id` | `UpdateMemberDto` | `Member` |
| `deleteMember(id)` | DELETE | `/api/v1/manager/members/:id` | — | `null` |
| `renewMembership(id, dto, key)` | POST | `/api/v1/manager/members/:id/renew` | `RenewalDto` | `MembershipRecord` |

### UI Data Requirements Mapping
| UI Element | Required Field(s) | API Endpoint | Response Path | Availability | Nullable? | Mocked? | UI Behavior When Unavailable |
|---|---|---|---|---|---|---|---|
| Card: Member Name | `name` | `GET /api/v1/manager/members` | `data[].name` | `required` | No | Yes | Render fallback text |
| Card: Status Badge | `status` | `GET /api/v1/manager/members` | `data[].status` | `required` | No | Yes | Neutral badge |
| Card: Phone | `phone` | `GET /api/v1/manager/members` | `data[].phone` | `permission_masked` in list | No | Yes | `maskSensitiveData()` |
| KPI: Total Active | `activeCount` | `GET /api/v1/manager/members/stats` | `data.activeCount` | `required` | No | Yes | `displayValue()` |
| Filter: Status | `status` | `GET /api/v1/manager/members` | `data[].status` | `required` | No | Yes | All options |

Availability values: `required` (mandatory data), `nullable` (rendered via `displayValue()`), `permission_masked` (hidden/masked without breaking layout), `feature_flagged` (conditional field), `not_applicable` (static UI).

## 5. Query Key Registry & Server State
[REQUIRED: Strict query key factory to prevent cache collisions and enforce granular invalidation.]

```typescript
export const MANAGER_MEMBERS_QUERY_KEYS = {
  all: ['manager_members'] as const,
  lists: () => [...MANAGER_MEMBERS_QUERY_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...MANAGER_MEMBERS_QUERY_KEYS.lists(), params] as const,
  details: () => [...MANAGER_MEMBERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MANAGER_MEMBERS_QUERY_KEYS.details(), id] as const,
};
```

- **Default Stale Time:** 60,000ms (1 minute)
- **Garbage Collection Time (`gcTime`):** 300,000ms (5 minutes)
- **Refetch on App Focus / Resume:** Handled centrally on app foregrounding

## 6. Mutation Inventory & Lifecycle Operations
[REQUIRED: Document every state-modifying action, idempotency keys, button lock, and cache invalidation targets.]

| Mutation Action | HTTP Method | Target Endpoint | Payload DTO | Idempotency Key? | Cache Invalidation Target |
|---|---|---|---|---|---|
| Create Member | POST | `/api/v1/manager/members` | `CreateMemberDto` | Yes (`Idempotency-Key: UUIDv4`) | `MANAGER_MEMBERS_QUERY_KEYS.lists()` |
| Update Profile | PATCH | `/api/v1/manager/members/:id` | `UpdateMemberDto` | No | `MANAGER_MEMBERS_QUERY_KEYS.detail(id)`, `MANAGER_MEMBERS_QUERY_KEYS.lists()` |
| Renew Membership | POST | `/api/v1/manager/members/:id/renew` | `RenewalDto` | Yes (`Idempotency-Key: UUIDv4`) | `MANAGER_MEMBERS_QUERY_KEYS.detail(id)`, `MANAGER_MEMBERS_QUERY_KEYS.lists()` |
| Delete Member | DELETE | `/api/v1/manager/members/:id` | None | No | `MANAGER_MEMBERS_QUERY_KEYS.lists()` |

## 7. Permissions and Role Rules
[REQUIRED: Specify exact roles, protected actions, and guards. Generic statements are forbidden.]

- **Required role:** `MANAGER` — enforced by auth session guard before mounting feature navigator
- **Destructive actions and their guards:** Delete member → confirmation bottom sheet with explicit warning: "This will permanently delete the member and all their records."
- **Sensitive data handling:** Phone numbers masked via `maskSensitiveData()` in list card view. Full number visible only in profile detail.
- **Cross-role isolation:** Zero imports from `frontend_admin`, `frontend_trainer`, `frontend_superadmin`.
- **CODEOWNERS:** Operations / Security team review required for payment and deletion hooks.

## 8. State Ownership & Architecture Flow
- **Server State:** TanStack Query v5 (`useQuery`, `useMutation`). Native status flags (`isPending`, `isError`, `data`).
- **UI Transient State:** Zustand store (`useManagerMembersStore.ts`) — active filter bottom sheet open state, active tab index.
- **Navigation Route Params:** `memberId`, search filters passed via typed `RouteProp`. Never duplicated into global stores.
- **Encrypted Local Storage:** Auth tokens and biometric keys in iOS Keychain / Android Keystore only via `react-native-keychain`. Zero business entities stored in unencrypted storage.

### Module Architecture Flow
```text
Screen (Route Entry in screens/ ≤80 lines)
      ↓
Child Components (Thin Composition in components/ ≤200 lines)
      ↓
Custom Hooks / Store (Zustand UI State + TanStack Query Server State)
      ↓
Feature API Client (api/*api.ts via networkClient with ApiResponse<T>)
      ↓
MSW Handlers / Fixtures (Dev/Test) OR Real Backend API (Prod)
```

## 9. Offline, Loading, Empty, and Error States
[REQUIRED: Explicit state handling per major UI section.]

| Section | Loading State | Empty State | Error State |
|---|---|---|---|
| Members list | `ManagerMembersListSkeleton.tsx` — 5 ghost card rows matching card height | `ManagerMembersEmptyState.tsx` — icon + "No members found" + "Add Member" CTA | `ManagerMembersErrorFallback.tsx` — retry button calling `refetch()` |
| Detail screen | Skeleton matching header + 3 tab sections | N/A | Inline retry banner calling `refetch()` |

- **Network Offline Fallback:** Surfaces user-friendly i18n message (`t('errors.network')`), never exposes raw fetch errors.
- **Pull-to-Refresh:** Integrated via `refreshing={isRefetching}` and `onRefresh={refetch}` on FlashList.

## 10. Security and PII Rules (Data Masking & Guards)
- **PII Fields:** Member phone numbers and email addresses masked in list card views using `maskSensitiveData(phone)`.
- **Zero Client Secrets:** No backend API keys or service tokens embedded in client bundles.
- **Secure Token Storage:** Auth tokens, refresh tokens, biometric keys stored exclusively in Keychain / Keystore.
- **Authorization Verification:** In-component role verification prevents rendering unauthorized mutation buttons.

## 11. Accessibility Requirements (A11y)
- **Accessible Role & Labels:** Every interactive control has `accessible={true}`, `accessibilityRole`, and `accessibilityLabel`.
- **Touch Target Size:** Minimum 44×44pt (iOS) / 48×48dp (Android) with `hitSlop` on small icons.
- **Screen Reader Traversal:** Decorative icons set `accessible={false}` or `importantForAccessibility="no-hide-descendants"`.
- **Dynamic Text Scaling:** Respects user's system font scaling settings without layout clipping.

## 12. Background Tasks & Realtime Events
- **Push Notification Recovery:** On app foreground resume, notification recovery endpoint is queried (`GET /api/v1/{role}/notifications`).
- **WebSocket Alerts:** Centralized `WebSocketContext` at `src/core/` dispatches realtime attendance events.
- **Toast Notifications:** Deduplicated toast triggered on async events using `showToast(msg, type, dedupKey)`.

## 13. Feature Flags & Tenant Settings
- **Biometric Check-in Flag:** `useFeatureFlag('enable_biometric_sync')` controls biometric registration CTA.
- **Graceful Fallback:** If disabled, the biometric section is cleanly omitted without layout breakage.
- **Tenant Currency & Locale:** Consumed via Tenant Config Provider for locale-accurate formatting.

## 14. Cache Invalidation & Consistency
- **Authoritative Invalidation:** Mutations trigger `queryClient.invalidateQueries({ queryKey: MANAGER_MEMBERS_QUERY_KEYS.lists() })` inside `onSuccess`.
- **Resource Identity Preservation:** Two different members never share the same query cache entry (`['manager_members', 'detail', memberId]`).
- **Pessimistic UI Updates:** Financial and destructive mutations wait for 2xx response before updating UI state.

## 15. Migration, Rollback & Edge Cases (AI Warnings)
[REQUIRED: Specific, non-generic warnings for THIS module.]

- **Hardware Back Press Trap:** On Android, active bottom sheets (`ManagerMembersFilterSheet`) MUST trap back press via `BackHandler` and close the sheet before popping the screen.
- **Keyboard Safety:** Wrap forms in `KeyboardAvoidingView` with `keyboardShouldPersistTaps="handled"` on ScrollView.
- **Renewal form pre-fills current plan — do not reset on open:** Sheet receives `currentPlan` prop and pre-fills selector.
- **`deleteMember` removes ALL membership history:** Irreversible operation; confirmation sheet must state this explicitly.
- **Phone number masking applies to list view only:** Card uses `maskSensitiveData()`, detail screen reveals full number.

## 16. Test Coverage Map & Quality Gates
- **Integration Tests:** `tests/manager_members.test.tsx` (MSW mocked API integration test)
- **Unit Tests:** `tests/formatCurrency.test.ts`, `hooks/useManagerMembersList.test.ts`
- **Maestro E2E Flows:** `mobile_e2e/frontend_manager_e2e/manager_members/manager_members.yaml`
- **Mock Scenarios Registry:** ACTIVE, EMPTY, SERVER_500, TIMEOUT, UNAUTHORIZED in `mocks/scenarios/`
- **Stress Datasets:** Tier 1 (10), Tier 2 (100), Tier 3 (500+) records in `mocks/fixtures/`

## 17. Architecture Exceptions (ADRs)
| Decision / Parameter | Chosen Approach | Rationale / Trade-Off | Date / Approver |
|---|---|---|---|
| Pagination Page Size | 50 rows default | Balanced memory footprint vs scroll smoothness for mobile FlashList | Standard Arch |
| Mutation State Update | Pessimistic over Optimistic | Complex backend triggers (biometrics, billing recalculations) require authoritative server response | Standard Arch |
| Local Utility Duplication | Formatter kept feature-local | WET principle strictly enforced to preserve AI portability and zero cross-module coupling | Rule 28 Compliance |

## 18. Known Contract Gaps & Bug Log
None

## 19. Rule Compliance Checklist (35+ Verification Items)
- [ ] Rule 0A: Universal Day-1 Sub-Module Architecture — Autonomous sub-modules at depth = 1
- [ ] Rule 1: Micro-modularization — module-prefixed files, size ceilings respected (Screen 80, Component 200, Hook 150)
- [ ] Rule 1: Role isolation — zero cross-role imports (`frontend_admin`, `frontend_manager`, `frontend_superadmin`, `frontend_trainer`)
- [ ] Rule 2: Navigation uses typed params — no full objects passed through routes (`ParamList` defined)
- [ ] Rule 3: All styles use design tokens — no magic hex/dp values; `useThemeTokens()` consumed
- [ ] Rule 4: State placed per Server/Client decision matrix (TanStack Query for server state, Zustand for UI state)
- [ ] Rule 4: Pessimistic UI — financial/destructive mutations wait for 2xx before UI update
- [ ] Rule 5: Forms use form library + schema validator (React Hook Form + Zod)
- [ ] Rule 6: Auth tokens in hardware-backed secure storage only (`react-native-keychain`)
- [ ] Rule 7 (API): All API calls through central `networkClient`, typed verb contract, `ApiResponse<T>` envelope
- [ ] Rule 7 (messages): User-facing messages come from backend `response.message` — never hardcoded
- [ ] Rule 7A: API/mock response covers ALL UI fields — no missing card fields, KPI fields, chart series, or filters
- [ ] Rule 8A: Lists use virtualized component (`FlashList` / optimized `FlatList`) for > 50 items
- [ ] Rule 8B: Search/filter inputs debounced — minimum 300ms before API call
- [ ] Rule 10A: KeyboardAvoidance wrapped around forms with `keyboardShouldPersistTaps="handled"`
- [ ] Rule 10B: Pull-to-refresh implemented on user-browsable lists via `refreshing={isRefetching}`
- [ ] Rule 17: Co-located unit tests present; E2E for critical flows; AI Test Integrity Gate satisfied
- [ ] Rule 22: No unapproved dependencies added
- [ ] Rule 23: Observability wired for critical error paths
- [ ] Rule 24: This `_features.md` is complete, specific, and non-generic
- [ ] Rule 25: All interactive elements have accessible labels + 44/48dp targets with `hitSlop` for small icons
- [ ] Rule 28: Zero cross-feature imports (Strict WET principle verified)
- [ ] Rule 29: `_forbidden.md` exists, is specific, and has minimum 5 entries
- [ ] Rule 30: Sensitive data masked in list/card views — full values only in detail screens
- [ ] Rule 31: Destructive/financial actions use centralized confirmation bottom sheet
- [ ] Rule 33: Paginated responses typed with canonical `PaginationMeta` — no local pagination re-derivation
- [ ] Rule 34: Status/type fields use string enums — no magic string literals
- [ ] Rule 35: All navigation calls use `ROUTES` constants — no hardcoded route strings
- [ ] Rule 36: Type-only imports use `import type`
- [ ] Rule 37: Currency/numbers formatted via `formatCurrency()` / `formatNumber()` — no inline `toFixed()`
- [ ] Rule 38: Null/empty fields use `displayValue()` with en-dash `—` fallback
- [ ] Rule 39: Async-submit buttons have `minWidth` — no layout shift on loading state
- [ ] Rule 40: All toasts go through `showToast()` with stable `dedupKey` — no direct library calls
- [ ] Rule 41: Multi-step forms have `useUnsavedChangesGuard` wired to `isDirty`
- [ ] Rule 45: TanStack Query v5 native status (`isPending`, `isError`, `data`) used directly for all API calls
- [ ] Rule 53: Every POST/PATCH/PUT/DELETE mutation uses a required stable `Idempotency-Key` (UUIDv4) with button disable
- [ ] Native Safety: Hardware back press listener (`BackHandler`) traps active bottom sheets before popping screen

## 20. Standalone Run, Mock & Test Harness
[REQUIRED: Exact commands and credentials to run, test, and mock THIS specific sub-module in complete isolation.]

- **Standalone Harness Entry:** `tests/harness/bootstrap.ts` / `[Submodule]Harness.tsx`
- **Integration Test Execution:** `npm run test:integration -- src/features/frontend_{role}/{role}_{domain}/{domain}_{capability}`
- **Unit Test Execution:** `npm run test:unit -- src/features/frontend_{role}/{role}_{domain}/{domain}_{capability}`
- **Maestro E2E Suite:** `mobile_e2e/frontend_{role}_e2e/{role}_{domain}/{domain}_{capability}.yaml`
- **Primary Route & Stack:** `ROUTES.[ROLE_SUBMODULE].LIST` via `config/[role]_[submodule].url_config.ts`
- **Seed Test User & Role:** `role: "MANAGER"`, `branchId: "branch-001"`, `tenantId: "tenant-dev"`
- **Mock Scenarios Registry:** `mocks/scenarios/[role]_[submodule].scenarios.ts`
  - *Standard List (ACTIVE):* MSW returns seeded fixtures array from `mocks/fixtures/`
  - *Empty State (EMPTY):* Set filter or mock flag `?empty=true` to trigger empty state component
  - *Error State (SERVER_500):* Mock endpoint throws 500 / network error to trigger error fallback component
  - *Offline Blocker (TIMEOUT):* Simulated high latency to trigger loading skeletons, button spinner states, or offline alert
  - *Permission Denied (UNAUTHORIZED):* Simulated 401/403 to verify auth recovery and session expiry flow

## 21. Module Portability & Host Integration Guide
[REQUIRED: Exact 4-step instructions to copy and plug this sub-module into another mobile project or host app.]

1. **Folder Transfer:** Copy `src/features/frontend_{role}/{role}_{domain}/{domain}_{capability}` into target mobile project.
2. **Route Registration:** Register route `ROUTES.[ROLE_SUBMODULE].*` in host navigation stack.
3. **Core Contracts Alignment:** Verify target host provides core application plumbing (`networkClient`, `useThemeTokens()`, `showToast()`).
4. **Mock / Live Backend Verification:** Verify immediate standalone execution via sub-module MSW fixtures, or connect to production backend via `_url_config.ts`.

## 22. Deliverables & Version History (8/8 Portability Score)
[REQUIRED: Every mobile sub-module must score 8/8 before release. Any unchecked box rejects the sub-module.]

### Feature Self-Audit & ZIP Portability Score
- [ ] **1. ZIP Self-Sufficiency:** Sub-module can be zipped and given to an external AI agent with zero parent codebase context and zero missing types.
- [ ] **2. Zero Cross-Feature Business Imports:** Zero imports from sibling sub-modules or parent shared folders.
- [ ] **3. Mock Parity & Scenario Completeness:** Handlers cover all 5 canonical scenarios (ACTIVE, EMPTY, SERVER_500, TIMEOUT, UNAUTHORIZED).
- [ ] **4. Standalone Harness / Bootstrap:** `tests/harness/bootstrap.ts` / `[Submodule]Harness.tsx` mounts the sub-module in total isolation.
- [ ] **5. Token Integrity:** Zero hardcoded hex, RGB, or magic dp values; 100% `useThemeTokens()` consumption.
- [ ] **6. Triad UI States:** Skeleton loading, non-generic EmptyState, and ErrorFallback with retry CTA verified.
- [ ] **7. Mutation Safety:** Idempotency key attached to all state-changing calls, double-click prevention verified.
- [ ] **8. Native Safety:** Keyboard avoidance, safe area insets, and Android hardware back press trap verified.

### Module Changelog & Revision History
| Version | Date | Author / Agent | Changes & Architectural Rationale |
|---|---|---|---|
| v1.0.0 | [YYYY-MM-DD] | [Engineer/AI] | Initial canonical sub-module implementation with MSW mocks and doc trio |
```

### Documentation Freshness Rule

Every time a component is added, an API endpoint changes, a new screen is added, or a
user flow changes, the `_features.md` for that feature MUST be updated in the same
commit. Stale documentation is worse than no documentation because it actively misleads
future AI agents.

## Rule 25 — Accessibility

- Every interactive element exposes an accessible role/label — no exceptions
  for "obviously self-explanatory" icons or buttons.
- Minimum touch target: 44×44pt (iOS) / 48×48dp (Android) — enforced via the
  shared minimum-touch-target token in `MOBILE_UI_UX_DESIGN.md`, not
  per-component guesses.
- Respect system font-scaling accessibility settings — never disable dynamic
  text scaling unless a specific pixel-perfect element requires it, and
  document why when it does.
- Use `accessible={false}` on purely decorative elements to exclude them from the screen reader traversal order.
- Use `importantForAccessibility="no-hide-descendants"` (Android) on container views that wrap decorative or non-interactive content to prevent TalkBack from traversing into their children. This is the Android equivalent of `accessible={false}` for container-level exclusion.

## Rule 26 — App Store & Regulatory Compliance

- iOS Privacy Manifest and Android Play Console Data Safety disclosures are
  kept in sync with actual data collection/usage — reviewed before every
  release, owned by whoever last touched the permissions or analytics code.
- Any use of advertising/tracking identifiers is documented in the relevant
  feature's `_features.md` and reflected in the store compliance forms.
- App icons, splash screens, and store metadata are managed through one
  central, version-controlled config — never manually edited inside
  platform-native project files directly (breaks on next native rebuild).

## Rule 27 — Release Management & Staged Rollout

- Every release increments a version identifier and has a changelog entry —
  no silent version bumps.
- Any release containing a New Architecture / rendering-engine change, or a
  major native dependency upgrade, ships via staged rollout (e.g. 5% → 20% →
  50% → 100% over roughly two weeks), monitoring crash-free rate at each
  stage before advancing — never a 100% release for high-risk native changes.

---

## Rule 28 — Zero Cross-Feature Imports (The Portable Folder Rule)

Every feature folder must be a **completely self-contained BUSINESS unit**.

A feature MUST NOT import or depend on another feature's business logic.

A feature **MAY** depend on:

- **(a)** Approved framework/package dependencies.
- **(b)** Approved zero-business-logic primitives from `src/core/ui/`.
- **(c)** Approved framework-level infrastructure from `src/core/`, such as:
  - network client
  - API response types (`ApiResponse<T>`, `PaginationMeta`)
  - authentication/session infrastructure
  - secure storage abstraction
  - navigation infrastructure
  - route constants
  - pagination types
  - formatting primitives (`formatNumber`, `displayValue`, `maskSensitiveData`) — **`formatCurrency` is DOMAIN_UTILITY and MUST be feature-local per Rule 63, never in `src/core/`**
  - logging/observability infrastructure
  - accessibility infrastructure
  - app-wide configuration required for correctness
- **(d)** Its own internal files.

A feature **MUST NEVER** depend on:
- another feature's components
- another feature's hooks/controllers/notifiers
- another feature's stores/providers/blocs
- another feature's schemas/validators
- another feature's business types/models
- another feature's API services
- another feature's business constants
- another feature's business utilities

`src/core/` is an **infrastructure boundary**, NOT a business-logic sharing layer.

The AI must understand the feature's business behavior from only the feature folder + `_features.md`.
Any external dependency must be explicitly documented in Approved External Dependencies with its integration contract.
The AI MUST NOT need unrelated business modules.

If business logic is required by two features, duplicate it inside each feature
rather than moving it into `src/core/`. This preserves portability without
artificially duplicating mandatory application infrastructure.

### The "Shared Folder" Trap & Strict WET Invariant

A common architectural antipattern is attempting to resolve cross-module needs by creating a `shared/` or `common/` dumping ground (e.g. `shared/ui/`, `shared/hooks/`, `shared/utils/`).
- **THE TRAP:** Within weeks, developers and AI agents place business cards, attendance filters, status badges, and domain hooks into `shared/`. Then, modifying a component to satisfy Feature A silently breaks Feature B and Feature C.
- **THE LAW:** Generic zero-business infrastructure belongs in `src/core/` ONLY. Any component, hook, utility, or type containing a business noun, domain status, or business rule MUST remain strictly feature-local. If two features require similar business UI or logic, DUPLICATE IT LOCALLY under the Strict WET Principal. Creating `shared/` directories for business logic is STRICTLY FORBIDDEN.

### The Feature ZIP Guarantee (Self-Sufficiency Invariant)

Every mobile feature module MUST satisfy the **Feature ZIP Guarantee**:
1. An AI agent or human developer MUST be able to zip ONLY the sub-module folder (`src/features/frontend_{role}/{role}_{domain}/{domain}_{capability}/`) along with the Documentation Trio (`[role]_[submodule]_features.md`, `[role]_[submodule]_forbidden.md`, `[role]_[submodule]_theme_contract.md`), drop it into an isolated prompt or project, and completely understand, run, mock, test, and repair it.
2. The feature MUST NEVER require sibling feature code or ask for other role folders.
3. All dependencies on core application infrastructure (network client, theme tokens, hardware keychain) MUST be satisfied through the documented Core Application Contracts.
4. **Scope of Isolated Sub-Module Testing vs Host E2E:** Inside the isolated sub-module ZIP, 100% self-sufficient testing is achieved via local integration tests and the mock scenario harness (`tests/` and `tests/harness/` with in-memory MSW scenarios). Full-system Maestro E2E test suites reside in the host repository (`mobile_e2e/frontend_{role}_e2e/{role}_{feature}/`) and are classified as `DEFERRED_TO_HOST_RUNTIME` when auditing/testing an isolated sub-module ZIP in an emulator-less or standalone AI environment. An isolated sub-module ZIP is 100% self-sufficient for unit, integration, and scenario-based harness testing without requiring host E2E runners.

Enforce mechanically via `eslint-plugin-boundaries` so violations are caught in CI, not in
code review.

---

## Rule 29 — Forbidden Patterns Per Autonomous Sub-Module (`[role]_[submodule]_forbidden.md`)

Every autonomous sub-module (and feature module) MUST have a dedicated `[role]_[submodule]_forbidden.md` file listing what is explicitly NOT allowed in that specific unit.
The canonical read order for AI agents is:
1. `[role]_[submodule]_features.md`
2. `[role]_[submodule]_forbidden.md`
3. only then source files

### `[role]_[submodule]_forbidden.md` Content Quality Standard

Every entry MUST be sub-module-specific and actionable. Generic entries like
"Do not bypass API interceptors" or "Follow best practices" are **forbidden in
the forbidden file itself** — they add zero value. Every entry must name the
specific file, hook, or pattern to use instead. Minimum 5 entries for any
feature with CRUD operations.

❌ **BAD (generic, useless):**
```
- NEVER bypass API interceptors
- NEVER mix logic with UI
- NEVER use bad state management
```

✅ **GOOD (specific, actionable):**
```markdown
# [role]_[submodule] — Forbidden Patterns

- NEVER import from any sibling sub-module (e.g., attendance_dashboard must NEVER import from attendance_history) — zero cross-sub-module imports, Rule 28
- NEVER create or import from parent shared folders (e.g., attendance/common/ or attendance/components/ are strictly forbidden) — strict WET principle
- NEVER share React Context or Zustand stores between sub-modules — communicate exclusively via route navigation with typed params
- NEVER import from any other feature or role folder (frontend_admin/members/, frontend_trainer/members/, etc.) — zero cross-feature imports, Rule 28
- NEVER call the HTTP client directly — always use [submodule].api.ts which goes through the central network client
- NEVER store API response data in [submodule].store.ts — the TanStack Query cache is the single source of truth for server data
- NEVER execute delete/suspend actions on single tap — always show the centralized confirmation bottom sheet first (Rule 31)
- NEVER add a new dependency without checking approved-dependencies.md first (Rule 22)
- NEVER hardcode hex colors, dp values, or font sizes — use design tokens via useThemeTokens() only (Rule 3)
- NEVER log auth tokens, phone numbers, payment amounts, or full API response bodies — sanitize before any log call (Rule 6)
- NEVER display raw phone numbers or payment amounts in list/card views — use maskSensitiveData() (Rule 30)
```

---

## Rule 30 — Sensitive Data Masking in UI

Any field displaying sensitive personal or financial data MUST be masked by
default in list views, card components, and summary screens:

- Phone numbers: `98****2310` (show first 2 + last 4 digits)
- Payment amounts in bulk lists: masked or summarized, not itemized per record
- National IDs, account numbers: show last 4 digits only

Full values are visible ONLY in dedicated detail/profile screens where the user
has explicitly navigated to view a single record.

Implementation: create ONE central `maskSensitiveData(value, type)` utility in
`src/core/utils/maskSensitiveData.ts`. No component may implement its own masking
logic inline — always import from this central utility.

Never log masked or unmasked sensitive values — sanitize before any log call or
crash-report breadcrumb (Rule 6 and Rule 23).

---

## Rule 31 — Double Verification for Destructive and Financial Actions

On mobile, accidental taps on destructive actions are more likely than on desktop
(small touch targets, no hover/right-click interaction). This makes double-verification
more critical on mobile, not less.

**Any action that does any of the following MUST show a confirmation bottom sheet
or dialog BEFORE executing:**
- Deletes a record (member, expense, plan, etc.)
- Suspends or deactivates a user or gym
- Marks a payment, invoice, or payroll as paid/processed
- Triggers any irreversible financial mutation

Rules:
- Never execute on a single tap — always require explicit confirmation.
- The confirmation message must clearly state what will happen and whether it is
  reversible. Do not soften destructive messages.
- Use ONE centralized confirmation module (e.g. a `useConfirm()` hook backed by
  a shared `ConfirmBottomSheet` component) — Using React Native's native `Alert.alert()` for destructive or financial confirmations is STRICTLY FORBIDDEN in feature code. Every destructive/financial action MUST use the centralized `useConfirm()` hook backed by `ConfirmBottomSheet` (`@gorhom/bottom-sheet`).
- The confirm button must show a loading state while the mutation is in flight
  and be disabled to prevent double-submission.

---

## Rule 32 — Pessimistic UI Updates and Search Debouncing

### Pessimistic UI for Financial and Destructive Mutations

For any mutation involving money or irreversible operations (delete, suspend,
payment, payroll processing):
- The action button MUST transition to a disabled loading state immediately on tap.
- The UI (list, store, cache) MUST only update AFTER receiving a `2xx` response.
- Optimistic updates (updating the UI before server confirmation) are **completely
  forbidden** for these action types.
- On error: restore the previous UI state, show the backend `message` field in a
  toast or inline error — never a hardcoded string.

Pessimistic UI is the mandatory default for ALL mutations. If optimistic updates are used for non-destructive, non-financial mutations, the hook MUST implement `onError` rollback AND MUST reconcile the cache with the authoritative server response on `onSuccess`. Optimistic updates are STRICTLY FORBIDDEN for any financial or destructive mutation.

### Search and Filter Input Debouncing

Any search input or filter control that triggers an API call MUST be debounced
with a minimum **300ms** delay before firing the request. Mobile keyboards fire
onChange on every keystroke — without debouncing, every character typed sends a
separate API request, causing performance degradation and potential rate limiting.

Implementation: use a shared `useDebounce(value, delay)` hook in
`src/core/hooks/useDebounce.ts`. No feature may implement its own debounce logic
inline — always import from this central hook.

---

## Workflow Checklist — What to Verify After AI Writes Code

1. Read the feature's `_features.md` and then `_forbidden.md` before giving the AI any files.
2. Identify the exact layer (UI? Hook? API? Schema? State?) and pass only those files.
3. After the AI writes code, verify:
   - All styles use design tokens — no raw hex/dp values? (Rule 3)
   - State placed per Server/Client matrix? (Rule 4)
   - Pessimistic UI on financial/destructive mutations? (Rule 32)
   - Forms using library + schema validator? (Rule 5)
   - API calls through central client, typed verb names? (Rule 7)
   - Search/filter inputs debounced at 300ms? (Rule 32)
   - Lists virtualized for >20 items? (Rule 8)
   - User messages from `response.message`, never hardcoded? (Rule 7)
   - Auth tokens in hardware-backed secure storage only? (Rule 6)
   - Sensitive data masked in list/card views? (Rule 30)
   - Destructive/financial actions use confirmation bottom sheet? (Rule 31)
   - Co-located tests exist for new hooks and components? (Rule 17)
   - Crash reporting wired for new critical paths? (Rule 23)
   - Is any new dependency on the approved list? (Rule 22)
   - `_features.md` updated with non-generic content? (Rule 24)
   - All interactive elements have accessible labels + 44/48dp targets? (Rule 25)
   - Any cross-feature imports? (Rule 28)
   - `_forbidden.md` current and specific? (Rule 29)
4. Run CI gates: lint, type check, test pyramid, SCA scan, secrets scan.
5. For auth, payment, storage, or tenant-routing changes: ensure CODEOWNERS human review.

---

## Rule 33 — Canonical `PaginationMeta` Shape

Every paginated API response MUST include a `meta` field typed as `PaginationMeta`.
No feature may invent its own pagination shape — one canonical type, used everywhere.

Define once in `src/core/types/pagination.types.ts`:

```typescript
// src/core/types/pagination.types.ts
export interface PaginationMeta {
  total: number;       // total records matching the query
  page: number;        // current page (1-based)
  limit: number;       // records per page
  totalPages: number;  // Math.ceil(total / limit)
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

The `ApiResponse<T>` envelope (Rule 7) already includes `meta?: PaginationMeta`.
Every paginated hook/controller reads `response.meta` — never re-derives pagination
state from array length or local counters.

```typescript
// ❌ BAD — inventing a local pagination shape
const [total, setTotal] = useState(0);
const hasMore = data.length < total;

// ✅ GOOD — reading canonical meta
const { data } = useMembers(params);
const hasNextPage = data?.meta?.hasNextPage ?? false;
```

Cross-reference: Rule 7 (`ApiResponse.meta`).

---

## Rule 34 — Enum-Driven Status Fields (No Magic Strings)

Every status, type, or category field on a mobile type/model MUST be a TypeScript
enum or a `const` object with `as const` — never a raw string literal scattered
across components and API calls.

Define enums in the feature's `*.types.ts` file:

```typescript
// ❌ BAD — magic strings everywhere
if (member.status === 'active') { ... }
if (member.status === 'suspended') { ... }

// ✅ GOOD — enum-driven, refactor-safe, matches the exact API wire values
// defined by the supplied feature/API contract.
export enum MemberStatus {
  ACTIVE    = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED   = 'EXPIRED',
  PENDING   = 'PENDING',
}

if (member.status === MemberStatus.ACTIVE) { ... }
```

Rules:
- Enum values MUST exactly match the API wire values defined by the supplied feature/API contract. If the feature API contract changes enum values, mobile type/schema/tests must update in the same change.
- Never use numeric enums for API-bound fields — string enums survive serialization.
- Filter dropdowns, badge colors, and conditional rendering all branch on the enum,
  never on a raw string.
- If the supplied API contract adds a new status, the TypeScript compiler surfaces every
  unhandled case — this is the point.

Cross-reference: Rule 7 and the feature API contract.

---

## Rule 35 — Route / Navigation Constants File (No Hardcoded Route Strings)

Navigation route names are split into two layers:

1. **Top-level tab/drawer routes** (e.g., `MANAGER_TAB.MEMBERS`) MUST be defined in `src/core/navigation/routes.ts`. This file contains ONLY the top-level tab/drawer entry names — never internal screen names.
2. **Feature-internal screen routes** (e.g., `MANAGER_MEMBERS_ROUTES.LIST`, `MANAGER_MEMBERS_ROUTES.DETAIL`, `MANAGER_MEMBERS_ROUTES.ADD`) and their `ParamList` types MUST live exclusively in the feature's own `config/{role_module}.url_config.ts`. No screen, hook, or component may contain a hardcoded route string literal.

```typescript
// src/core/navigation/routes.ts
export const ROUTES = {
  MEMBERS: {
    LIST:   'MembersListScreen',
    DETAIL: 'MembersDetailScreen',
    ADD:    'MembersAddScreen',
  },
  ATTENDANCE: {
    LIST:   'AttendanceListScreen',
    DETAIL: 'AttendanceDetailScreen',
  },
} as const;

export type RootStackParamList = {
  [ROUTES.MEMBERS.LIST]:   undefined;
  [ROUTES.MEMBERS.DETAIL]: { memberId: string };
  [ROUTES.MEMBERS.ADD]:    undefined;
};
```

```typescript
// ❌ BAD — hardcoded string in a component
navigation.navigate('MembersDetailScreen', { memberId: id });

// ✅ GOOD — typed constant
navigation.navigate(ROUTES.MEMBERS.DETAIL, { memberId: id });
```

Consequence of violation: a renamed screen breaks navigation silently at runtime
with no TypeScript error. The constants file makes renames a compiler error.

Cross-reference: Rule 2 (navigation), Rule 28 (zero cross-feature imports — routes
constants are a `core/` primitive, not a feature file).

---

## Rule 36 — React Native / TypeScript: `import type` Mandate

Any import that brings in ONLY a TypeScript type, interface, or enum (no runtime
value) MUST use `import type`. This is enforced by ESLint (`@typescript-eslint/consistent-type-imports`).

## Rule 37 — Currency and Number Formatting Utility

All generic numeric and percentage formatting MUST go through the central zero-business formatter utility at src/core/utils/formatters.ts.
Do not use raw `.toFixed()` or inline `new Intl.NumberFormat` anywhere in JSX/components.

```typescript
/**
 * Formats a generic number according to the specified locale.
 *
 * @param value - The number to format.
 * @param locale - The active locale string (e.g., 'en', 'hi').
 * @returns The formatted number string.
 */
export function formatNumber(value: number | null | undefined, locale: string): string {
  if (value == null) return displayValue(value);
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number as a percentage.
 *
 * @param value - The decimal or percentage value.
 * @param locale - The active locale string.
 * @returns The formatted percentage string.
 */
export function formatPercent(value: number | null | undefined, locale: string): string {
  if (value == null) return displayValue(value);
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
```

Rule 63 supersedes the currency portion of Rule 37. Currency formatting is feature-local. Rule 37 remains authoritative only for generic number and percentage formatting.

## Rule 38 — En-Dash Fallback for Null / Empty Data

Any field that may be `null`, `undefined`, or an empty string MUST render an
en-dash (`—`) rather than blank space, `"N/A"`, `"null"`, or `undefined`.

Define ONE central utility in `src/core/utils/formatters.ts`:

```typescript
export function displayValue(
  value: string | number | null | undefined,
  fallback = '—',
): string {
  if (value == null || value === '') return fallback;
  return String(value);
}
```

```typescript
// ❌ BAD — blank cell, "null" text, or conditional clutter
<Text>{member.email || ''}</Text>
<Text>{member.phone ?? 'N/A'}</Text>

// ✅ GOOD — consistent, scannable UI
<Text>{displayValue(member.email)}</Text>
<Text>{displayValue(member.phone)}</Text>
```

Applies to: detail screens, list cards, table cells, summary rows, PDF/export
previews. Every data-display component uses `displayValue()` — no exceptions.

Cross-reference: Rule 63.
Currency values that may be null MUST follow the documented Rule 63 null-value
handling and must never render blank or `"N/A"`.

---

## Rule 39 — Button Loading Width Stability

When a button transitions to a loading state, its width MUST NOT change.
Replacing button text with a spinner that has different dimensions causes layout
shift — on mobile this is especially jarring because it can shift adjacent
touch targets.

```typescript
// ❌ BAD — width collapses to spinner size
{isLoading ? <ActivityIndicator /> : <Text>Save Member</Text>}

// ✅ GOOD — fixed minimum width, content swaps in place
<TouchableOpacity
  style={[styles.button, { minWidth: tokens.layout.buttonMinWidth }]}
  disabled={isLoading}
>
  {isLoading
    ? <ActivityIndicator color={tokens.color.onPrimary} size="small" />
    : <Text style={styles.buttonText}>Save Member</Text>
  }
</TouchableOpacity>
```

Rules:
- Set `minWidth` on the button container using a design token or a value derived
  from the label's measured width — never a magic number.
- The button MUST be `disabled` while loading to prevent double-submission
  (Rule 31 and Rule 32 already mandate this for destructive actions — this rule
  extends it to ALL async-submit buttons).
- React Native: wrap `TouchableOpacity/Pressable` in a `View` with a fixed width,
  or apply `minWidth` via style.

Cross-reference: Rule 31 (loading state on confirm button).

---

## Rule 40 — Toast / Snackbar Deduplication

`showToast()` is the ONLY toast entry point.

`showToast()` MUST enforce semantic deduplication.
Passing a deduplication key to the toast library is not sufficient unless
the central adapter demonstrably suppresses or refreshes an already-visible
toast with the same semantic key.

```typescript
/**
 * Displays a global toast message safely handling semantic deduplication.
 *
 * @param message - The text to display.
 * @param type - The semantic level (e.g. 'error', 'success').
 * @param dedupKey - A unique string representing the action intent.
 */
const activeToasts = new Set<string>();

export function showToast(message: string, type: 'error' | 'success', dedupKey?: string) {
  if (dedupKey) {
    if (activeToasts.has(dedupKey)) return;
    activeToasts.add(dedupKey);
  }

  Toast.show({
    type,
    text1: message,
    onHide: () => {
      if (dedupKey) activeToasts.delete(dedupKey);
    }
  });
}

// ❌ BAD: Stacking 5 duplicate network error toasts
showToast(response.message, 'error');

// ✅ GOOD: Passing a stable semantic identity
showToast(
  response.message,
  'error',
  toastKey('members', 'suspend', memberId, response.errorCode)
);
```

## Rule 41 — Unsaved Changes Guard for Multi-Step Forms

Any screen containing a form with user-entered data MUST warn the user before
navigating away with unsaved changes. On mobile, the back gesture/button is the
primary exit path — this guard is critical.

Implement as ONE shared hook: `src/core/hooks/useUnsavedChangesGuard.ts`

```typescript
// src/core/hooks/useUnsavedChangesGuard.ts
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty) return;
      e.preventDefault();
      // Show confirmation dialog — use the centralized useConfirm() (Rule 31)
      // If confirmed, dispatch e.data.action to proceed
    });
    return unsubscribe;
  // navigation: current navigator; isDirty: enables/disables unsaved-change interception
    }, [navigation, isDirty]);
}
```

```typescript
// ❌ BAD — no guard; user loses data on back swipe
function MembersAddScreen() { ... }

// ✅ GOOD — guard wired to form dirty state via hook
function useMemberForm() {
  const form = useForm();
  return { form, isDirty: form.formState.isDirty };
}

function MembersAddScreen() {
  const { isDirty } = useMemberForm();
  useUnsavedChangesGuard(isDirty);
  // ...
}
```

Rules:
- The guard MUST cover every supported exit path, using the navigator-specific event/mechanism required for stack back, swipe-back, tab changes, etc.
- For multi-step forms, the guard MUST activate whenever the form contains
  unsaved value changes.
- React Hook Form `isDirty` represents changes relative to the configured default
  values; merely focusing or touching a field does not necessarily mean the form
  is dirty.

Cross-reference: Rule 31 (centralized confirmation), Rule 5 (forms).

---

## Rule 42 — `useEffect` Dependency Audit Comment

Every `useEffect` MUST include a one-line comment
explaining WHY each dependency is listed — or explicitly why the array is empty.

```typescript
// ❌ BAD — silent dependency array; future AI/developer cannot reason about it
useEffect(() => {
  fetchMemberById(memberId);
}, [memberId]);

// ✅ GOOD — intent is explicit
useEffect(() => {
  fetchMemberById(memberId);
  // memberId: re-fetch whenever the target member changes (e.g. deep-link navigation)
}, [memberId]);

// ✅ GOOD — empty array is also documented
useEffect(() => {
  analytics.trackScreenView('MembersListScreen');
  // intentionally empty: fire once on mount only — screen-view event, not reactive
}, []);
```

Why this rule exists: AI agents editing a `useEffect` without understanding its
dependency intent routinely introduce stale-closure bugs or infinite re-render
loops. The comment is the contract that prevents this.

Consequence of violation: the next AI edit to this file will silently break the
effect's reactive behavior — this is one of the most common AI-introduced bugs
in React Native codebases.

Cross-reference: Rule 24 (AI context documentation principle applied at code level).

---

## Rule 43 — JSDoc Mandate on All Hooks and Utility Functions

Every custom hook and every exported utility function MUST have a JSDoc comment
block. No exceptions for "obviously named" functions — the JSDoc is for AI agents
reading the file in isolation, not for humans who already know the codebase.

```typescript
// ❌ BAD — no documentation; AI must guess intent and parameters
export function useMembers(params: MemberListParams) { ... }

// ✅ GOOD — full JSDoc; AI can use this hook correctly without reading its body
/**
 * Fetches the paginated member list for the current branch.
 *
 * @param params - Filter and pagination params: { page, limit, search, status }
 * @returns TanStack Query result with `data.data: Member[]` and `data.meta: PaginationMeta`
 *
 * Cache key: ['members', 'list', params] — invalidated on createMember / deleteMember.
 * Do NOT pass the full Member object through navigation after selecting — pass memberId
 * and use fetchMemberById in the detail screen (Rule 2).
 */
export function useMembers(params: MemberListParams) { ... }
```

Minimum JSDoc fields for hooks: `@param`, `@returns`, cache key (if server state),
and any non-obvious side effects or constraints.

Minimum JSDoc fields for utilities: `@param`, `@returns`, and one example if the
output format is non-obvious (e.g. `formatNumber(150000, 'en-IN') → "1,50,000"`).

Cross-reference: Rule 24 (documentation quality standard), Rule 43 applies at the
function level what Rule 24 applies at the feature level.

---

## Rule 44 — `RESPONSIBILITY:` + `FLOW:` Comment Mandate on Every File

Every executable .ts / .tsx source file in a feature folder (every screen, navigator, component, hook, API, query_keys, store, schema, type, url_config, util, and mock file) MUST begin with a two-line structured comment block at the very top of the file (before any imports):

```typescript
// RESPONSIBILITY: Renders a single member card in the list. Displays masked phone,
//   membership status badge, and expiry date. Tap navigates to MembersDetailScreen.
//   No API calls. No business logic. Presentational only.
//
// FLOW: MembersListScreen → FlatList renderItem → MembersMemberCard (this file)
//   → tap → navigation.navigate(ROUTES.MEMBERS.DETAIL, { memberId })
```

Format rules:
- `RESPONSIBILITY:` — one to three sentences. Must state what the file does AND
  what it explicitly does NOT do (no API calls, no business logic, etc.).
- `FLOW:` — the data/navigation path that leads to this file and out of it.
  For hooks: the call chain. For API files: the request/response path.
- These comments are the first thing an AI reads when a file is dropped into a
  prompt — they eliminate the need to read the entire file to understand context.
- **Enforcing the 5-Second Comprehension Invariant:** This mandatory header ensures that any human engineer or AI agent immediately grasps the exact boundaries, non-responsibilities, and call flow of the file within 5 seconds without reading past line 5.

```typescript
// ❌ BAD — no header; AI must read 150 lines to understand the file's role
import React from 'react';
...

// ✅ GOOD — AI understands the file's role in 2 seconds
// RESPONSIBILITY: Central data-fetching hook for the members list. Wraps TanStack
//   Query's useQuery. Handles pagination, search, and status filtering. Does NOT
//   manage UI state (filter panel open/close lives in useMembersFilters.ts).
//
// FLOW: MembersListScreen → useMembers(params) → members.api.ts → fetchMembers()
//   → GET /api/v1/{role}/members → ApiResponse<Member[]> + PaginationMeta
import { useQuery } from '@tanstack/react-query';
...
```

Cross-reference: Rule 24 (feature-level documentation), Rule 43 (JSDoc on functions).

---

## Rule 45 — Network State Model (TanStack Query Native Status — No Parallel Boolean Flags)

### Offline and Connectivity Policy

Every API-backed mobile feature MUST define:
- offline read behavior;
- cached-data behavior;
- retry behavior;
- mutation behavior while offline;
- user-visible offline message;
- recovery behavior on reconnect.

Default rules:
1. **Cached Reads:** Cached read-only data may be displayed with an explicit `OfflineBanner` indicator.
2. **Blocked Mutations:** Destructive, financial, permission, role, tenant, or identity mutations MUST be blocked offline using `OfflineBlocker`.
3. **Non-Sensitive Drafts:** Non-critical draft persistence may use MMKV only when the data is non-sensitive.
4. **No Silent Replay:** Offline mutation queueing is forbidden by default and requires explicit feature-contract approval. Reconnect must NOT silently replay restricted mutations.

For TanStack Query requests, MUST use TanStack Query v5 native typed status (`isPending`, `isFetching`, `isError`, `data`) and MUST NOT wrap them in a parallel `NetworkState<T>` discriminated union. Creating a parallel async enum for server state managed by TanStack Query is **FORBIDDEN** — it duplicates state ownership and causes cache inconsistency.

`NetworkState<T>` is ONLY permitted for **non-TanStack-Query local async operations** (e.g., device hardware access, file system operations, Bluetooth, camera — operations that cannot use TanStack Query).

```typescript
// ❌ FORBIDDEN — parallel NetworkState<T> wrapping TanStack Query server state
const [state, setState] = useState<NetworkState<Member[]>>({ status: 'loading' });
useEffect(() => {
  fetchMembers().then(data => setState({ status: 'success', data }));
}, []);

// ✅ REQUIRED — use TanStack Query v5 native status directly
const { data, isPending, isError, refetch } = useManagerMembers(params);

if (isPending) return <ManagerMembersListSkeleton />;
if (isError) return <ManagerMembersErrorFallback onRetry={refetch} />;
if (!data?.data?.length) return <ManagerMembersEmptyState />;
return <ManagerMembersList members={data.data} />;
```

**For non-Query local async (device operations only):**
```typescript
export type NetworkState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; errorCode?: string };
// Use ONLY for: camera, Bluetooth, file system, biometrics — NOT for API calls
```

## Rule 46 — Background Task / Scheduled Job Documentation

Any background task, scheduled job, periodic sync, or push-notification handler
that runs outside the main UI thread MUST be documented in the feature's
`_features.md` under a dedicated `## Background Tasks` section.

Required documentation per task:

```markdown
## Background Tasks

| Task | Trigger | Frequency | What it does | Failure behavior |
|---|---|---|---|---|
| MembershipExpirySync | App foreground resume | On resume if >1 h since last sync | Fetches expiring memberships, updates local cache | Silent fail — logs to Sentry, retries on next resume |
| PushNotificationHandler | FCM/APNs push received | On push | Parses payload, navigates to relevant screen via ROUTES constants | Falls back to notification tray if app is backgrounded |
```

Rules:
- Background tasks that write to local storage MUST document which storage keys
  they touch (cross-reference Rule 6).
- Background tasks that call the network MUST go through the central network
  client (Rule 7) — never a raw `fetch()` call in a background handler.
- Any task that can run while the app is in the background (not just foregrounded)
  must be noted explicitly — these have different lifecycle constraints on iOS vs Android.

Cross-reference: Rule 7 (API layer), Rule 6 (secure storage), Rule 24 (_features.md documentation).

---

## Rule 47 — API Call Timeout Policy

Every API request MUST execute with a timeout defined by `TIMEOUT_CONFIG`. The default timeout is inherited automatically unless a category-specific override applies. Silent hangs on mobile are especially harmful because the user has limited visibility into network activity and request cancellation.

Define once in `src/core/network/networkClient.ts`:

```typescript
// src/core/network/networkClient.ts
export const TIMEOUT_CONFIG = {
  DEFAULT:    10_000,   // 10 s — standard reads
  UPLOAD:     30_000,   // 30 s — file/image uploads
  REPORT:     20_000,   // 20 s — report generation / export endpoints
  AUTH:        8_000,   //  8 s — login/refresh — fail fast
} as const;

// Applied at the HTTP client level — every request inherits DEFAULT
// unless the specific call overrides it:
const client = networkClient.create({ timeout: TIMEOUT_CONFIG.DEFAULT });
```

```typescript
// ❌ BAD — no timeout; hangs indefinitely on poor mobile networks
const response = await networkClient.get(MEMBERS_URLS.LIST);

// ✅ GOOD — explicit timeout per call category
const response = await client.get(MEMBERS_URLS.LIST);                          // inherits DEFAULT
const response = await client.post('/reports/export', dto,
  { timeout: TIMEOUT_CONFIG.REPORT });                                          // explicit override
```

On timeout: surface `showToast(t('COMMON.REQUEST_TIMED_OUT'), 'error')`
(Rule 40) — never a blank screen or silent failure.

Cross-reference: Rule 7 (API layer), Rule 40 (toast utility).

---

## Rule 48 — Structured Validation Error Handling Shape

When the API returns the canonical validation error response (statusCode `400`;
a `422` is only valid if an explicitly approved API contract requires it), the
response MUST be parsed into a structured shape and mapped to individual form
fields — never displayed as a raw string dump.

The canonical mobile API validation-error envelope:

```typescript
// Shape returned by backend on 400 validation failure
{
  success: false,
  message: 'Validation failed',
  error: 'VALIDATION_ERROR',
  errorCode: 'VALIDATION.DTO.FAILED',
  statusCode: 400,
  validationErrors: [
    { field: 'email',  message: 'Email is already registered' },
    { field: 'phone',  message: 'Phone number is invalid' },
  ]
}
```

Mobile handling — map to form fields via React Hook Form's `setError`:

```typescript
// src/core/utils/handleValidationErrors.ts
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ApiResponse } from '../types/api.types';

export function handleValidationErrors<T extends FieldValues>(
  response: ApiResponse<null>,
  setError: UseFormSetError<T>,
): void {
  response.validationErrors?.forEach(({ field, message }) => {
    setError(field as Path<T>, { type: 'server', message });
  });
}
```

```typescript
// ❌ BAD — raw error string shown in a toast; user doesn't know which field failed
showToast(response.message, 'error');

// ✅ GOOD — field-level errors mapped directly onto the form
const onSubmit = async (dto: CreateMemberDto) => {
  const response = await createMember(dto);
  if (!response.success) {
    handleValidationErrors(response, setError);   // fields light up inline
    return;
  }
  // success path
};
```

Cross-reference: Rule 5 (forms), Rule 40 (toast for non-field errors).

---

## Rule 49 — Stable Key Prop for List Items (No Index Keys)

Every list rendered with a mapped array or a virtualized list component MUST use
a stable, unique entity ID as the item key — never the array index.

```typescript
// ❌ BAD — index key causes wrong items to re-render on insert/delete/reorder
members.map((member, index) => (
  <MembersMemberCard key={index} member={member} />
))

// ✅ GOOD — stable UUID key; React/RN reconciles correctly
members.map((member) => (
  <MembersMemberCard key={member.id} member={member} />
))
```



Consequence of violation: inserting or deleting a list item causes every
subsequent item to re-render (React) or lose component state. For
financial lists this can cause visible flicker and incorrect loading states.

Rule: if an entity has no stable ID from the backend, that is a backend contract
bug — fix the API, do not paper over it with an index key.

Cross-reference: Rule 8 (list rendering performance), Rule 33 (PaginationMeta —
paginated lists always have entity IDs).

---

## Rule 50 — Copy-to-Clipboard for Permitted Record Identifiers

Exception:
Identifiers classified as sensitive under Rule 56 MUST NOT receive a copy affordance, even when displayed on a detail screen.

Any screen displaying a record ID, transaction reference, invoice number, or
other identifier that a user may need to share or reference MUST provide a
one-tap copy-to-clipboard affordance. Users on mobile cannot select and copy
text from a non-input element without explicit support.

```typescript
// src/core/utils/copyToClipboard.ts
import Clipboard from '@react-native-clipboard/clipboard';

export async function copyToClipboard(
  value: string,
  successMessage: string,
): Promise<void> {
  await Clipboard.setString(value);
  showToast(successMessage, 'success');
}
```

```typescript
// ❌ BAD — ID displayed as plain text; user cannot copy it on mobile
<Text>{member.id}</Text>

// ✅ GOOD — tap to copy with feedback
<TouchableOpacity onPress={() => copyToClipboard(
  member.id,
  t('COMMON.COPIED_TO_CLIPBOARD', { label: t('MEMBERS.MEMBER_ID') }),
)}>
  <Text>{member.id}</Text>
  <CopyIcon size={tokens.icon.sm} />
</TouchableOpacity>
```

Applies to: member IDs, transaction IDs, invoice numbers, payment references,
gym branch codes, and any other identifier shown in a detail screen.

Cross-reference: Rule 40 (toast feedback), Rule 30 (sensitive data masking —
copy gives the full unmasked value, which is intentional in detail screens only).

---

## Rule 51 — Empty State Component Per Entity List

Every list screen MUST have a dedicated, named empty-state component. A blank
screen or a generic "No data" text is not acceptable.

```
// ❌ BAD — inline conditional with generic text
{members.length === 0 && <Text>No members found.</Text>}

// ✅ GOOD — dedicated component with context-aware content
{members.length === 0 && <MembersEmptyState />}
```

Every empty-state component MUST include:
1. A contextual icon or illustration (from the approved icon set — Rule 10).
2. A specific message explaining WHY the list is empty (e.g. "No members match
   your current filters" vs "No members have been added yet").
3. A primary CTA where applicable (e.g. "Add Member" button for an empty
   unfiltered list; "Clear Filters" for an empty filtered list).

Naming convention: `[Feature]EmptyState.tsx` or `[Feature][Entity]EmptyState.tsx` — e.g.
`MembersEmptyState.tsx`, `AttendanceEmptyState.tsx`.

The empty-state component is listed in the feature's `_features.md` under
"Loading, Empty, and Error States" (Rule 24 template).

Cross-reference: Rule 1 (module-prefixed naming), Rule 24 (_features.md template).

---

## Rule 52 — Theme Token Enforcement

The file `MOBILE_UI_UX_DESIGN.md` acts as the single source of truth for the codebase's theme implementation. There is no separate contract file. 

The React Native application's theme module MUST exactly implement the complete token values for:
- colors
- status colors
- payment colors
- spacing
- typography
- line-height
- letter-spacing
- radius
- icons
- icon stroke
- touch targets
- motion
- opacity
- shadow/elevation
- z-index/layering
- skeleton tokens

Any raw values or tokens missing from the code's theme configuration that are present in `MOBILE_UI_UX_DESIGN.md` will cause CI/Design validation failure.

## Rule 52A — [featureName]_theme_contract.md Documentation

Every feature folder MUST contain a `members_theme_contract.md` (or equivalent for that feature name) file at the feature root.
This file lists ONLY the design tokens that THIS specific feature consumes — no values, just the token names.

Purpose: When copying a feature module into a new project, this file tells the target project's theme implementor exactly which tokens must exist.

```markdown
# members — Theme Contract

## Color Tokens Used
- `primary`, `on-primary` — FAB and action buttons
- `destructive`, `on-destructive` — delete confirmation button
- `card`, `border` — member card surface and dividers
- `foreground`, `muted` — name text and secondary info
- `status-success-bg`, `status-success-text` — active badge
- `status-danger-bg`, `status-danger-text` — expired badge
- `skeleton-base`, `skeleton-highlight` — list loading skeleton

## Spacing Tokens Used
- `space-3`, `space-4`, `space-5` — card internal padding

## Typography Tokens Used
- `body`, `body-sm`, `caption`, `heading-sm`

## Motion Tokens Used
- `duration-base` — card press animation

## Z-Index Tokens Used
- `z-bottom-sheet` — delete confirmation sheet
```

AI agents writing styled components for a feature MUST check this file to verify all tokens they intend to use are already listed. New tokens must be added to `MOBILE_UI_UX_DESIGN.md` first (Rule 52), then listed here.

## Rule 53 — Idempotency for ALL API Mutations

Every mutating API call (POST, PUT, PATCH, DELETE) MUST generate an `Idempotency-Key` at the moment of user intent.

### A. The Required Contract

1. **API Signature:** The mutation API client MUST require an `idempotencyKey: string` parameter.
2. **HTTP Header:** The HTTP client MUST always attach `headers: { 'Idempotency-Key': idempotencyKey }`.
3. **Lifecycle:** Generate exactly once per user intent. Reuse the same key for retries. Generate a new key only for a new user intent. Never generate a new key on retry.

```typescript
// features/frontend_manager/billing/api/billing.api.ts
export interface ProcessPaymentRequest {
  memberId: string;
  amountMinor: number;
  paymentMethodId: string;
  idempotencyKey: string;
}

export async function processPaymentApi(
  req: ProcessPaymentRequest
): Promise<ProcessPaymentResponse> {
  return await networkClient.post(PAYMENT_URLS.PROCESS, {
    memberId: req.memberId,
    amountMinor: req.amountMinor,
    paymentMethodId: req.paymentMethodId,
  }, {
    headers: {
      'Idempotency-Key': req.idempotencyKey,
    }
  });
}
```

### Complete Mutation Safety Contract

For every POST/PATCH/PUT/DELETE/domain mutation:
- Create one idempotency key per user intent (generated via `generateIdempotencyKey()`).
- Retain that key for retry of the same intent.
- Disable the initiating control while pending (`disabled={isPending}`).
- Show an in-place loading state with width locking (`minWidth: tokens.layout.buttonMinWidth`).
- Prevent duplicate navigation or repeated haptics while in-flight.
- Invalidate or update every affected query key after confirmed success.
- Use pessimistic updates by default for financial, destructive, permission, and role-sensitive actions.
- Optimistic updates require explicit rollback logic and must be documented in `_features.md`.
- Map server validation errors to form fields where applicable via `handleValidationErrors()`.
- Announce success/error accessibly.
- Ensure repeated API completion callbacks cannot produce duplicate toast or navigation.

### B. Double Verification for Financial / Irreversible Actions (Extending Rule 31)

Financial mutations require the strict double-verification flow in addition to the generic idempotency key.

## Rule 54 — Single-Flight Token Refresh

401 Unauthorized token-refresh operations MUST be "single-flight". If 10 concurrent API requests fail with 401, they must not trigger 10 simultaneous refresh calls.

Rules:
- Only one refresh operation may be active at a time.
- Concurrent 401 requests must await the same shared refresh promise.
- After the refresh succeeds, the queued requests retry exactly once with the new token.
- If the refresh fails, clear the session and force a single logout operation.

---

## Rule 55 — Trusted Tenant Context for `x-tenant-id`

A feature module MUST NOT freely choose, guess, or derive the `x-tenant-id` header from untrusted local state or route parameters.

Rules:
- The `x-tenant-id` comes ONLY from the authenticated, trusted tenant context (e.g., the global session state set upon secure login or authorized tenant switch).
- The central network client automatically attaches this header to all outgoing requests.
- Feature modules never manually pass a tenant ID to API endpoints unless explicitly acting as a global administrator switching tenants.

---

## Rule 56 — Enterprise Security & Robustness

The mobile architecture MUST enforce the following security and robustness constraints globally:

- **Offline Cache Security**: Any persisted server state containing sensitive PII MUST use encrypted storage or explicitly exclude the data from OS-level backups.
- **Network Retry Policy**: Failed requests (timeout/5xx) must use exponential backoff with jitter. Financial or destructive mutations MUST NOT blind auto-retry; they require explicit user confirmation.
- **Request Cancellation**: All requests initiated by a screen/hook must accept an `AbortSignal`, and navigation/unmount must cancel stale in-flight requests. Navigating away from a loading screen (e.g., search, detail, or upload) MUST cancel the stale request.
- **Deep-Link Authorization**: Matching a route is not enough. Deep-link resolution MUST re-evaluate auth status, role, tenant, and resource authorization before rendering the target screen.
- **Notification Payload Validation**: Treat all push notification payloads as untrusted user input. Validate the payload against a schema before triggering any navigation or side effects.
- **Clipboard Policy**: Sensitive IDs, credentials, reset tokens, OTPs, and full Aadhaar/bank identifiers MUST be excluded from copy-to-clipboard functionality.

### Mobile Privacy and App-Switcher Protection

For sensitive screens:
- Prevent sensitive data from appearing in screenshots / app switcher previews where platform or project requirements demand it (e.g. using native secure-flag or blur on background).
- Do not place tokens, OTPs, bank details, national IDs, or unmasked PII in logs, analytics, breadcrumbs, crash reports, toast text, navigation params, or clipboard.
- Clear sensitive in-memory state immediately on logout and tenant switch.
- Re-authorize deep links and notification routes before rendering protected data.
- Never trust role, tenant, permission, or record ownership coming from local route parameters.

---

## Updated Workflow Checklist — What to Verify After AI Writes Code

> Replaces the original checklist at the end of Rule 32. All prior items retained;
> new items for Rules 33–66 appended, including Rule 58A.

1. Read the feature's `_features.md` and then `_forbidden.md` before giving the AI any files.
2. Identify the exact layer (UI? Hook? API? Schema? State?) and pass only those files.
3. After the AI writes code, verify:
   - All styles use design tokens — no raw hex/dp values? (Rule 3)
   - State placed per Server/Client matrix? (Rule 4)
   - Pessimistic UI on financial/destructive mutations? (Rule 32)
   - Forms using library + schema validator? (Rule 5)
   - API calls through central client, typed verb names? (Rule 7)
   - Search/filter inputs debounced at 300ms? (Rule 32)
   - Lists virtualized for >20 items? (Rule 8)
   - User messages from `response.message`, never hardcoded? (Rule 7)
   - Auth tokens in hardware-backed secure storage only? (Rule 6)
   - Sensitive data masked in list/card views? (Rule 30)
   - Destructive/financial actions use confirmation bottom sheet? (Rule 31)
   - Co-located tests exist for new hooks and components? (Rule 17)
   - Crash reporting wired for new critical paths? (Rule 23)
   - Is any new dependency on the approved list? (Rule 22)
   - `_features.md` updated with non-generic content, including Dependency Manifest and Feature Lifecycle Contract? (Rule 24)
   - All interactive elements have accessible labels + 44/48dp targets? (Rule 25)
   - Any cross-feature imports? (Rule 28)
   - `_forbidden.md` current and specific? (Rule 29)
   - Paginated responses use canonical `PaginationMeta` shape? (Rule 33)
   - Status/type fields use enums — no magic strings? (Rule 34)
   - Navigation calls use `ROUTES` constants — no hardcoded strings? (Rule 35)
   - Type-only imports use `import type`? (Rule 36)
   - Currency/numbers formatted via `formatCurrency()` / `formatNumber()`? (Rule 37)
   - Null/empty fields render `displayValue()` en-dash fallback? (Rule 38)
   - Async buttons have `minWidth` — no layout shift on loading? (Rule 39)
   - Toasts go through `showToast()` — no direct library calls? (Rule 40)
   - Multi-step forms have `useUnsavedChangesGuard` wired? (Rule 41)
   - Every `useEffect` dependency has an explanatory comment? (Rule 42)
   - All hooks and utilities have JSDoc blocks? (Rule 43)
   - Every file has `RESPONSIBILITY:` + `FLOW:` header comment? (Rule 44)
   - Async state: TanStack Query v5 native `isPending`/`isError` used directly — zero parallel `NetworkState<T>` wrappers on server state? (Rule 45)
   - Background tasks documented in `_features.md`? (Rule 46)
   - API calls have explicit timeouts from `TIMEOUT_CONFIG`? (Rule 47)
   - 400 validation errors mapped to form fields via `handleValidationErrors()`? (422 only if explicitly approved by API contract) (Rule 48)
   - List items keyed by entity ID — no index keys? (Rule 49)
   - Permitted record identifiers have copy-to-clipboard affordance? (Rule 50)
   - Every list screen has a dedicated `EmptyState` component? (Rule 51)
   - New tokens added to `MOBILE_UI_UX_DESIGN.md` before implementation? (Rule 52)
   - `[featureName]_theme_contract.md` updated with any newly used tokens? (Rule 52A)
   - `manager_members.url_config.ts` (or `[role]_[submodule].url_config.ts`) exists in `config/` sub-folder — no hardcoded URLs in `*.api.ts`? (Rule 7B)
   - Query keys use the canonical factory from `manager_members.query_keys.ts` (or `[role]_[submodule].query_keys.ts`)? (Rule 7C)
   - Mutations use dedicated mutation hooks — no inline `useMutation` in screens/components? (Rule 7C)
   - Every POST/PATCH/PUT/DELETE mutation uses a required stable Idempotency-Key; the same key is reused on retry and a new key is generated only for a new user intent? (Rule 53)
   - Token refresh is single-flight? (Rule 54)
   - x-tenant-id derived from secure context only? (Rule 55)
   - Enterprise security constraints respected? (Rule 56)
   - Exact import path casing matches the file on disk — CI/Linux compatible? (Rule 57)
   - WebSocket instantiated only through centralized `WebSocketContext` / `SocketProvider`? (Rule 58)
   - App foreground resume triggers the exact notification-recovery endpoint from the feature API contract? (Rule 58A)
   - Role-masked fields typed as optional in interfaces/schemas; UI handles `undefined` gracefully? (Rule 59)
   - Every dedicated mutation hook invalidates affected TanStack Query keys inside `useMutation({ onSuccess })` per Rule 60? (Rule 60)
   - All client-authored/static user-visible strings use `t('namespace.KEY')` — no hardcoded UI text in components; backend-supplied `response.message` values are displayed as supplied by the API and are NOT passed through `t()` (Rule 61)
   - Locale files named `[featureName]_{lang}.json` and co-located in feature `_locales/`? (Rule 61)
   - `Accept-Language` header attached automatically by central network client? (Rule 61)
   - Feature flags accessed via `useFeatureFlag()` — no raw build/env reads in components? (Rule 62)
   - Currency formatting is feature-local `formatCurrency.ts`; approved currency metadata used; unknown codes throw? (Rule 63)
   - Tenant data export triggers async backend call + `202 Accepted` toast — no in-app download? (Rule 64)
   - Every interactive control and critical state indicator has a deterministic `testID` in `[module]-[component]-[action/state]` format? (Rule 65)
   - Every custom hook, complex component, and state store has an exhaustive JSDoc / docstring? (Rule 66)
4. Run CI gates: lint (`eslint-plugin-boundaries`, `consistent-type-imports`), type check, test pyramid, SCA scan, secrets scan, hard-write-boundary diff check.
5. For auth, payment, storage, or tenant-routing changes: ensure CODEOWNERS human review.

### No `_features.md` Inside Internal Category Sub-Folders

The autonomous sub-module root MUST contain exactly ONE authoritative `[role]_[submodule]_features.md` that covers ALL screens, flows, and capabilities of that sub-module. Creating additional `_features.md` files inside internal category sub-folders (`components/`, `hooks/`, `api/`, etc.) is FORBIDDEN — it violates Root Quarantine and fragments the AI repair context. All sub-screen documentation MUST be sections within the single sub-module root `_features.md`.

### Documentation Freshness Metadata Header

Every `_features.md` MUST begin with this structured YAML frontmatter header to verify synchronization:

```yaml
---
feature: "{role}_{module}"
owner_role: "{role}"
module_version: 1
api_contract_source: "verified-api-contract | web-zip-extraction | supplied-scope"
last_verified_date: "YYYY-MM-DD"
last_verified_commit: "commit-sha-or-host-unavailable"
documentation_status: "current"
---
```

### Mandatory Sections in `_features.md`:
Every sub-module's `_features.md` MUST define these sections with non-generic content:
1. `## Scope and Non-Scope (Module Purpose, System Context & Dependencies)`
2. `## Screen Inventory & Component Responsibility Map`
3. `## Navigation Contract & User Flows` (includes `Logical Integration Points`)
4. `## API Contract & UI Data Requirements`
5. `## Query Key Registry & Server State`
6. `## Mutation Inventory & Lifecycle Operations`
7. `## Permissions and Role Rules`
8. `## State Ownership & Architecture Flow`
9. `## Offline, Loading, Empty, and Error States`
10. `## Security and PII Rules (Data Masking & Guards)`
11. `## Accessibility Requirements (A11y)`
12. `## Background Tasks & Realtime Events`
13. `## Feature Flags & Tenant Settings`
14. `## Cache Invalidation & Consistency`
15. `## Migration, Rollback & Edge Cases (AI Warnings)`
16. `## Test Coverage Map & Quality Gates`
17. `## Architecture Exceptions (ADRs)`
18. `## Known Contract Gaps & Bug Log`
19. `## Rule Compliance Checklist (35+ Verification Items)`
20. `## Standalone Run, Mock & Test Harness`
21. `## Module Portability & Host Integration Guide`
22. `## Deliverables & Version History (8/8 Portability Score)`

CI MUST fail when a changed feature source file does not have a corresponding update to its `[feature]_features.md`, unless the change is test-only or a documented no-behavior-change refactor.

Every time a component is added, an API endpoint changes, a new screen is added, or a user flow changes, the `_features.md` for that feature MUST be updated in the same commit with updated `last_verified_date`.

## Rule 57 — Strict Case Sensitivity for File Names and Imports (Linux/CI Compatibility)
All imports and file paths MUST exactly match the casing of the actual file on disk. While development often happens on Windows/macOS (which have case-insensitive file systems), production deployments and CI pipelines typically run on Linux (which has a strict case-sensitive file system).
- **Rule:** A mismatch between import case (e.g., `trainer_url_config`) and file case (e.g., `Trainer_url_config.ts`) will cause the build to fail in CI/CD.
- **Enforcement:** Always double-check that the casing of module prefixes and filenames in imports matches exactly. If you rename a file, ensure the git index catches the case change (e.g., using `git mv`).
- ❌ **BAD:** File is `UserComponent.tsx`, imported as `import UserComponent from './userComponent'`.
- ✅ **GOOD:** File is `UserComponent.tsx`, imported as `import UserComponent from './UserComponent'`.

## Rule 58 — WebSockets & Real-Time Communication
* **The Rule:** WebSockets must never be instantiated directly via `new WebSocket()` or `io()` inside UI components.
* **Implementation:** Always use a centralized `WebSocketContext` or `SocketProvider` to manage connection lifecycles (connect, disconnect, reconnect). Feature modules must consume WebSockets via dedicated custom hooks (e.g., `useSocketEvent('NOTIFICATION_RECEIVED', callback)`). This guarantees that event listeners are correctly cleaned up on component unmount and avoids memory leaks.

## Rule 58A — Notification & WebSocket Recovery

### The Problem
If the user's app is closed or loses internet connection when a server notification event is emitted, the event is lost.

### The Rule
1. **Real-time:** Listen to WebSocket events (e.g., `notification.received`) and update the UI (bell icon, toast) immediately if the app is open.
2. **Offline Recovery:** Whenever the application mounts or comes to the foreground, it MUST call the exact notification-recovery endpoint defined by the supplied feature API contract. The AI MUST NOT invent, shorten, or substitute the endpoint path.

   Canonical project pattern: `GET /api/v1/{role}/notifications`

   Do not rely 100% on WebSocket delivery for critical notifications.

## Rule 59 — Role-Based Field Masking & Optional Types
* **The Rule:** The backend strictly masks sensitive data fields (like revenue) based on the user's role before transmitting the response.
* **Implementation:** Frontend TypeScript interfaces and Zod schemas MUST mark these potentially masked fields as optional (`?`). UI components consuming this data must implement graceful fallback behavior (e.g., hiding a specific chart or displaying a generic placeholder) if a field is `undefined`. The frontend must never crash due to a missing role-restricted field.

## Rule 60 — Strict Cache Invalidation Strategy
* **The Rule:** TanStack Query (React Query) server state must always remain perfectly synchronized with the backend data.
* **Implementation:** Every dedicated mutation hook (`useCreateMember.ts`, `useDeleteMember.ts`, etc.) MUST invalidate affected queries inside `onSuccess` within the `useMutation` call. This is the canonical pattern — `onSuccess` inside `useMutation` is **REQUIRED** (not banned) for cache invalidation. The ban applies ONLY to `onSuccess` inside `useQuery`.

```typescript
// ✅ REQUIRED — onSuccess inside useMutation for cache invalidation
export function useDeleteManagerMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteManagerMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_MEMBERS_QUERY_KEYS.lists() });
    },
  });
}

// ❌ FORBIDDEN — onSuccess inside useQuery
const { data } = useQuery({
  queryKey: MANAGER_MEMBERS_QUERY_KEYS.list(filters),
  queryFn: () => fetchManagerMembers(filters),
  onSuccess: (data) => { /* BANNED in TanStack Query v5 */ },
});
```

## Rule 61 — Internationalization (i18n) & Localization

### Mandatory Feature Locale Contract

All user-facing strings MUST use i18n keys via `t('namespace.KEY')`. Feature code MUST NOT contain hardcoded visible English or Hindi strings except documented test fixtures.

Every feature locale file (`_locales/[role_module]_en.json` & `_hi.json`) MUST define keys for:
- loading states;
- empty states;
- error states;
- offline indicators;
- retry action buttons;
- permission-denied messages;
- destructive action confirmation dialogs;
- accessibility labels and hints.

Dates, times, numbers, and currency must be formatted through locale-aware utilities. RTL readiness must be preserved even if the initial release supports only LTR languages.

The mobile frontend uses a co-located locale file architecture. The active launch languages are `en` and `hi`.

### Module-Co-located Locales
Each feature module owns its own translation keys.

### Locale File Naming Convention
Locale files MUST follow: `[role]_[submodule]_{lang}.json` (e.g., `manager_members_en.json`, `manager_members_hi.json`)
- ✅ **GOOD:** `manager_members_en.json`, `manager_members_hi.json`
- ❌ **BAD:** `en.json`, `translation.json`, `members_en.json` (missing role prefix)

The `_locales/` folder inside each feature MUST contain ONLY locale files for that feature.
Locale files are grouped by feature, NOT by language.
Do NOT create `src/locales/en/` or any global language folder.

```json
// src/features/frontend_manager/manager_members/_locales/manager_members_en.json
{
  "manager_members": {
    "PAGE_TITLE": "Members",
    "ADD_MEMBER": "Add Member"
  }
}
```

### Generated Resources
Merged locale resources are generated under `src/i18n/generated/`:
```typescript
import en from './generated/en';
import hi from './generated/hi';
```

### Component Usage
```typescript
const { t } = useTranslation();
t('members.PAGE_TITLE'); // MUST use t('NAMESPACE.KEY')
```

### Network Client Header
`src/core/network/networkClient.ts` remains the only network transport and must automatically add the `Accept-Language` header from the active locale state.

### Backend Error Messages vs Client Localization

- Client-authored UI strings MUST use `t('namespace.key')`.
- Backend-supplied `response.message` may be shown without translation only when the backend contract guarantees it is user-safe and localized for the current `Accept-Language` request.
- If the backend message is missing, unsafe, technical, or not localized: show a feature-specific translated fallback and send only sanitized diagnostics to observability.
- Never display raw `error.message`, stack traces, Axios errors, or unvalidated server text to users.

## Rule 62 — Centralized Feature Flags

Components must not read raw environment/build values.
Build config goes through the central mobile config module.
Runtime feature flags are accessed through `useFeatureFlag()`.

```typescript
// ❌ BAD: reading build/config values directly inside a feature component
if (readBuildConfig().enableFeature) { ... }

// ✅ GOOD:
const isNewBillingEnabled = useFeatureFlag('NEW_BILLING_UI');
if (isNewBillingEnabled) { ... }
```

## Rule 63 — Multi-Currency Monetary Amounts

Rule 63 supersedes the currency portion of Rule 37. Currency formatting is **feature-local** (Strict WET — never in `src/core/`).
Currency formatting MUST be feature-local (`[feature]/utils/[module]FormatCurrency.ts`, e.g., `managerMembersFormatCurrency.ts`). Rule 63 internally handles nulls by returning `—`; `displayValue()` (Rule 38) is NOT called for currency values.

Only currencies present in the project's approved currency metadata are supported. Unsupported currency codes MUST fail validation. Never silently default an unknown currency to divisor 100.

> ⛔ **AI AGENTS: NEVER import `currencyMetadata` from `@/core/config/currencyMetadata` or any global path. The metadata MUST be self-contained inside the feature-local formatter file. This is a Strict WET requirement — duplicate it per feature.**

```typescript
// currencyMetadata is self-contained inside this file — no external @/core import allowed
const currencyMetadata: Record<string, { divisor: number }> = {
  INR: { divisor: 100 }, USD: { divisor: 100 }, EUR: { divisor: 100 },
  // extend per project approved currencies only
};

/**
 * Formats a monetary amount from minor units into a localized currency string.
 *
 * @param amountMinor - The amount in minor units (e.g., cents).
 * @param currency - The 3-letter currency code (e.g., 'USD', 'INR').
 * @param locale - The active locale string (e.g., 'en', 'hi').
 * @returns The formatted currency string.
 * @throws If the currency is not in the approved metadata.
 */
export function formatCurrency(
  amountMinor: number | null | undefined,
  currency: string,
  locale: string,
): string {
  if (amountMinor == null) return '—';
  const meta = currencyMetadata[currency];
  if (!meta) throw new Error(`Unsupported currency: ${currency}`);
  
  const divisor = meta.divisor;
  const majorValue = amountMinor / divisor;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(majorValue);
}
```

## Rule 64 — Tenant Data Export & Offboarding UX

### The Rule
Data exports take minutes to process. Mobile operating systems are not designed to easily download and extract massive ZIP files of business CSVs. Therefore, the mobile app MUST handle the export trigger strictly as an asynchronous background request that emails the file to the user.

### UI Placement
The export functionality MUST live in a dedicated section: **Admin Settings -> Data Export & Offboarding**. 
- **Role Constraint:** This UI MUST only be available in the **Superadmin** (or top-level Gym Admin) mobile dashboard. Never add export buttons to manager, trainer, or member interfaces.

### Interaction Flow
1. **Button:** Display a clear `[ Request Full Data Export ]` button.
2. **Action:** When clicked, call the exact export endpoint defined by the supplied feature API contract. The AI MUST NOT invent or shorten the endpoint path.
   Canonical project pattern: `POST /api/v1/superadmin/export-data`
3. **Feedback:** Do NOT show a continuous loading spinner. Since the API returns `202 Accepted` immediately, show a success toast/alert: 
   *"Export started. A secure download link will be sent to your email within a few minutes."*
4. **Format Expectation:** The UI MUST explicitly inform the user that their data will be sent via email as a ZIP file containing Excel (CSV) files, which are best viewed on a computer.
5. **Real-time Completion Feedback:** The mobile dashboard MUST listen for a WebSocket event (e.g., `export.completed`) or poll a status endpoint. When received, update the UI to confirm: *"Your data export is ready and the email has been sent."*

> **AI AGENT NOTE:** Never attempt to download, parse, or open the `.zip` file directly within the mobile app's file system or using a Webview. The mobile app's ONLY responsibility is to hit the export endpoint and display a confirmation message indicating that an email is on the way.





## AI Introspection & Agentic Compatibility Rules

### Rule 65 — AI-Testable UI (Mandatory `testID`)

Every interactive React Native control and every critical state indicator MUST
have a deterministic `testID`.

Canonical format:

`testID="[role]_[module]-[component]-[action/state]"`

Examples:

`manager_members-addform-submit`
`manager_billing-invoice-status-paid`

Gesture-driven surfaces MUST expose a `testID` on the view that receives
the gesture interaction.

### Rule 66 — Component-Level AI Docstrings (JSDoc / Doc)
* **The Problem:** The `_features.md` file provides module-level context, but AI agents also need granular, file-level context when editing a specific controller, hook, or widget.
* **The Rule:** Every custom hook, complex React Native component, and State Store MUST have an exhaustive docstring block directly above its declaration.
* **What to include:** Explain the business intent, state dependencies, and explicit edge cases. Example: `/** ... */ Manages local wizard state for Member Creation. @edge-case Resets to step 1 if the API throws 409 Conflict.`


---

## Rule 67 — Bounded Execution, Chunking, and RBG System (MANDATORY FOR ALL MOBILE AUDIT/REPAIR TASKS)

This rule governs HOW mobile audit and repair work is executed. It does NOT reduce or weaken any architecture rule, design rule, test requirement, or documentation requirement.

### 67A — Context-Limit Chunking Strategy

> ⚠️ LARGE REPOSITORY REALITY CHECK

For mobile feature folders where the total file count or token size may exceed a single LLM context window, the following chunking strategy MUST be applied:

**Do NOT abandon zero-sampling.** Instead, process the scope in bounded work units.

Chunking rules:

1. **Feature ZIP first:** Extract and freeze the full requirement baseline (from `_features.md`, API contract, and UI/UX design) before inspecting any implementation files.
2. **Per-layer chunks:** Process each layer of a feature (screens → hooks → API → state → tests → docs) as a separate bounded work unit. Complete + checkpoint before moving to the next.
3. **Never mix requirement reading with repair** in the same bounded unit — this causes context pollution and hallucination.
4. **Checkpoint after every work unit** (see Section 67C). The checkpoint must record which requirements have been satisfied so far.
5. **Stage 3 re-audit runs in chunks too** — re-audit each previously completed work unit, not the entire scope in one pass.
6. **If a work unit cannot fit in context:** split it by file type layer (e.g., screens + components in one pass, hooks + API in next pass for the same feature). Never split a single file across passes.

The zero-sampling requirement is NOT weakened. Every authored artifact MUST still be inspected — chunking only controls *when* each artifact is inspected, not *whether*.

---

### 67B — Repair Batch Group (RBG) System (MANDATORY FOR AUDIT+REPAIR MODE)

#### THE PROBLEM THIS SOLVES

After a full audit, the repair phase MUST NOT apply fixes randomly from any batch.
Random repair causes:
- partial fixes that break dependent mobile flows;
- context loss mid-repair;
- incomplete API contracts;
- wasted turns;
- the AI never finishing.

#### REPAIR BATCH GROUP DEFINITION

After the full audit is complete and all findings are recorded, the AI MUST group all repair work into **Repair Batch Groups (RBGs)** before executing a single fix.

A Repair Batch Group is a set of 3–4 audit batches whose findings are repaired together in one controlled execution turn.

#### RBG SIZING & WORKLOAD DENSITY (SUBSTANTIVE SPRINT CALIBRATION)

An RBG MUST represent a meaningful, substantive cluster of repair work calibrated by **Finding Weight, File Complexity, and Functional Cohesion**:
- **The Anti-Micro-RBG Law (No Trivial-Fragment Babysitting):** Creating an RBG with only 2–4 trivial fixes that finishes in under 2 minutes is STRICTLY PROHIBITED. Light audit batches with few findings MUST be consolidated into a cohesive sprint so the user does not have to constantly babysit the screen and click approval buttons.
- **The Token-Safety & Anti-Hallucination Ceiling (No Bloated Monoliths):** An RBG MUST NOT be bloated with 30+ files or 35+ findings. Overloading causes context memory saturation, output token truncation, git diff collisions, and hallucinations.
- **Natural Cadence (Indicative Benchmark):** The workload targets below naturally yield a balanced sprint (~5 to 8 minutes of steady autonomous execution under typical conditions), giving the user uninterrupted time for other tasks while keeping execution strictly bounded and deterministic. *(Note: AI does not measure wall-clock timers; calibrate strictly by the finding and file metrics below).*

##### 1. Deterministic Workload Calibration Matrix

| RBG Category / Severity | Target Findings per RBG | Target Batches | Scope & Complexity Profile | Token & Safety Ceiling |
|---|---|---|---|---|
| **P0 Architectural & Structural** (Rule 0A/0A.3 1:1 primary nav, root quarantine, sibling isolation, Keychain auth) | **6–12 substantive findings / files** | 3–4 batches | Deep architectural refactoring, screen thinness extraction, navigation shell isolation | Max 14 files |
| **P1 Core Functional & State** (Forms, React Navigation, TanStack Query, mutation flows, Zod validation) | **10–18 findings** | 3–5 batches | State management, queries, mutation hooks, form handlers | Max 18 files / 20 findings |
| **P2 Design System, Tests & Docs** (Semantic tokens, Documentation Trio 22 sections, MSW mocks, Maestro YAML tests) | **12–22 findings** | 4–6 batches | Design token replacement, mock scenarios, documentation trio | Max 22 findings |
| **P3 Formatting & Minor Conventions** (Code comments, minor naming, formatting) | Bundle with P2 or bundle **15–25 findings** | 4–6 batches | Non-breaking cosmetic, comment, and convention fixes | Max 25 findings |

##### 2. Deterministic Sizing Invariants
1. **Minimum Workload Floor (Anti-Micro-Fragmentation):** An RBG MUST contain at least **8 findings** (or at least 4 substantive files), unless the total remaining uncompleted findings in the entire project are fewer than that. Light audit batches with only 1–2 minor findings MUST be consolidated together into a single RBG.
2. **Maximum Safety Ceiling (Anti-Hallucination Firewall):** No single RBG may contain more than **25 findings** or touch more than **18 files** in one execution turn. This guarantees the model operates well within safe context memory and eliminates output token truncation.
3. **Dependency Cohesion First:** Always respect dependency order. If fixing an architectural finding requires touching related state or contracts, keep them in the same RBG rather than splitting them artificially.

#### RBG PRIORITY ORDER

RBGs MUST be ordered by repair dependency, not by batch number:

```text
RBG 1 — P0 Critical fixes (architecture blockers, broken flows, security, Rule 0B violations, hardware Keychain tokens)
RBG 2 — P1 High fixes (state/API, forms, navigation, functional closure)
RBG 3 — P2 Medium fixes (design tokens, loading/error states, tests, Rule 24 docs)
RBG 4 — P3 Low fixes (naming, comments, tooling)
RBG N — Final re-audit + packaging
```

If a P0 fix from Batch 7 and a P0 fix from Batch 2 are related (e.g., same entity/mutation), they MUST be in the same RBG.
Do NOT split dependent fixes across RBGs.

#### RBG PLAN — MANDATORY BEFORE ANY REPAIR BEGINS

Before executing any repair, the AI MUST publish the complete RBG Plan:

```text
╔══════════════════════════════════════════════════════════╗
║        MOBILE REPAIR BATCH GROUP PLAN                   ║
╚══════════════════════════════════════════════════════════╝

TOTAL AUDIT BATCHES:     [N]
TOTAL FINDINGS:          [N]
TOTAL RBGs:              [N]

┌─────────────────────────────────────────────────────┐
│ RBG 1 — Audit Batches [X, Y, Z]                     │
│ Findings: [N]  │  Severity: P0/P1                   │
│ Focus: [brief description of what is being fixed]   │
├─────────────────────────────────────────────────────┤
│ RBG 2 — Audit Batches [A, B, C]                     │
│ Findings: [N]  │  Severity: P1/P2                   │
│ Focus: [brief description]                          │
├─────────────────────────────────────────────────────┤
│ RBG 3 — Audit Batches [D, E, F]                     │
│ Findings: [N]  │  Severity: P2/P3                   │
│ Focus: [brief description]                          │
└─────────────────────────────────────────────────────┘

RBG GROUPING RATIONALE:
[Why these batches are grouped together — dependency order]

Reply "Begin RBG 1" to start controlled repair execution (Interactive Mode).
Or reply "Adjust" to change the grouping.
```

> ⛔ **HARD STOP: Do NOT execute a single fix until the user approves the RBG Plan.**
>
> 🖱️ **1-CLICK INTERACTIVE BUTTON & EXECUTABLE ARTIFACT PROTOCOL (ZERO-MANUAL-TYPING ACROSS ALL CHECKPOINTS):**
> The AI MUST provide a 1-click interactive action button (via actionable artifact `RequestFeedback: true` or `ask_question` tool) at EVERY pause/checkpoint across the entire lifecycle:
> 1. **Checkpoint 1 — STAGE 1 FREEZE TRANSITION:** After freezing the requirements baseline, render a 1-click button: `[👉 Proceed to Stage 2: Deep Audit]`. (In chat telemetry, explain clearly in Roman Hinglish: *"Stage 1 (Baseline Freeze) complete ho gaya hai. Abhi koi repair nahi hui hai kyunki pehle Stage 2 mein Full Audit chalega aur saare mobile bugs dhoonde jayenge. Audit ke baad RBG Plan aayega jisme [Approve RBG 1] button milega."*).
> 2. **Checkpoint 2 — RBG PLAN APPROVAL:** After Stage 2 Audit completes and findings are grouped into RBGs, render a 1-click button: `[👉 Approve RBG 1 & Start Repairs]`.
> 3. **Checkpoint 3 — RBG CHECKPOINTS:** After completing each RBG sprint, render a 1-click button: `[👉 Proceed with RBG N+1]`.
> 4. **Flexible Text Affirmation Fallback:** For plain chat or CLI environments without UI buttons, any affirmative response (e.g., "Begin RBG 1", "Approved", "continue", "proceed", "start", "go ahead", "aage badho", "karo", "haan", "ok", "yes", "next") constitutes full valid approval. The AI MUST NOT halt, argue, or demand an exact phrase.

#### RBG EXECUTION RULES

1. **PRIOR RBG DEPENDENCY PRE-CHECK (MANDATORY for RBG N where N > 1):** Before executing any fix in RBG N, verify that every artifact from previous RBGs that the current RBG depends on is actually in place. If a prior RBG fix is missing or incomplete → repair it BEFORE starting the current RBG and record as `PRIOR_RBG_FIX_INCOMPLETE`. This is a targeted dependency check only — not a full re-audit of all previous RBGs.
2. Execute ALL findings from the current RBG before moving to the next RBG.
3. After completing each RBG, checkpoint and display the RBG Completion Dashboard.
4. **Interactive Progression:** Do NOT start the next RBG until the user gives affirmative confirmation (via 1-click UI button or reply "continue", "next", "Begin RBG N+1", "aage badho", "karo", "go ahead").
5. Within an RBG, apply fixes in dependency order (architecture → state → UI → tests → docs).
6. Never apply a fix from RBG 3 while RBG 1 is still in progress.
7. **INTERMEDIATE CHECKPOINT ZIP NAMING (ANTI-DECEPTION):** If the user requests an intermediate archive or the AI produces a ZIP checkpoint after completing RBG N while subsequent RBGs remain pending, the ZIP filename MUST be explicitly formatted as: `mobile-{role}-v{N}-PARTIAL-rbg{N}.zip`. The AI MUST NOT use the words `complete`, `final`, or `all-done` in the filename or description while any RBG is pending.
8. **FINAL COMPLETE DELIVERY PREREQUISITE:** The final release ZIP named `mobile-{role}-v{N}-ALL-RBGS-COMPLETE.zip` is permitted ONLY after 100% of RBGs (RBG 1 to RBG N) are completed, zero unresolved actionable findings remain, and Section 67G Pre-Delivery Cross-Check Gate is passed 100% clean.
9. **INTERACTIVE CLARIFICATION & DECISION MODAL PROTOCOL (1-CLICK RECOMMENDED SELECTION):**
   - Whenever the AI encounters ANY confusion, ambiguity, missing design choice, architectural conflict, or needs a decision/clarification from the user:
     - The AI **MUST NOT** output a long, open-ended technical essay asking the user to explain or write code.
     - The AI **MUST** formulate a structured interactive modal / multiple-choice selection (using the `ask_question` tool in IDEs or selectable checkbox/radio options with a single-click confirmation button).
     - **Mandatory `(Recommended)` Prefix:** Exactly ONE option MUST be listed first and prefixed with `(Recommended)` representing the safest, architecture-compliant default choice.
     - **Default One-Click Confirmation:** If the user is unsure, they can simply select the default recommended option and click Confirm/Proceed with zero technical burden or manual typing.
10. **LIVE PROGRESS HEARTBEAT TELEMETRY IN ROMAN HINGLISH (ANTI-HANG ASSURANCE):**
    - During execution turns touching multiple files, the AI MUST NOT remain completely silent. A prolonged lack of visible response creates the false impression that the AI is frozen, hung, or stuck.
    - After completing each substantive fix/file within the RBG, the AI MUST emit a concise, real-time telemetry line:
      - **Language Rule (ZERO-ENGLISH BAN):** Strictly **Roman Hinglish** (English letters, NO Devanagari script). Pure English conversational updates, explanations, or telemetry are strictly FORBIDDEN and treated as a FORMAT VIOLATION.
      - **Informational Only (Non-blocking):** It does NOT ask for user input or pause execution.
      - **Format & Concrete Examples:**
        ```text
        BAD (Strictly Forbidden):
        ✓ [Done]: I’ve completed updating the mobile touch targets and theme hooks.
        ⚙️ [In Progress]: I’m validating the Maestro flow before creating the checkpoint.

        GOOD (Mandatory):
        ✓ [Done]: `[file_name]` me [brief fix in Hinglish - e.g. "React Native screen touch target aur useThemeTokens hook fix"] ho gaya hai.
        ⚙️ [In Progress]: Ab `[next_file_name]` me [next fix in Hinglish - e.g. "Dedicated mutation hook aur single-flight 401 refresh"] start kar raha hoon...
        ```
      - This gives the user continuous real-time visibility into what was just fixed and what is currently being worked on, completely eliminating the "hang illusion".

#### RBG CHECKPOINT TEMPLATE

After completing each RBG, display:

```text
╔══════════════════════════════════════════════════════════════╗
║         🔧 MOBILE RBG CHECKPOINT 🔧                         ║
╠══════════════════════════════════════════════════════════════╣
║ RBG JUST COMPLETED:  RBG [N] — Audit Batches [X, Y, Z]      ║
║ FINDINGS FIXED:      [N] fixes applied                       ║
║ FILES CHANGED:       [N] files                               ║
║ ISSUES FIXED:        P0:[N] P1:[N] P2:[N] P3:[N]            ║
║ CUMULATIVE FIXED:    P0:[N] P1:[N] P2:[N] P3:[N]            ║
╠══════════════════════════════════════════════════════════════╣
║ REMAINING RBGs:                                              ║
║   RBG [N+1]: Batches [A, B, C] — [N] findings               ║
║   RBG [N+2]: Batches [D, E, F] — [N] findings               ║
╠══════════════════════════════════════════════════════════════╣
║ INTERMEDIATE ARCHIVE (IF PACKAGED):                          ║
║   mobile-{role}-v{N}-PARTIAL-rbg[N].zip                      ║
║   ⚠️ STATUS: PARTIAL FIX ONLY — RBG [N+1] PENDING            ║
╠══════════════════════════════════════════════════════════════╣
║ VERIFICATION STATUS:                                         ║
║   TypeScript:  [PASS / FAIL / NOT_EXECUTED]                  ║
║   Lint:        [PASS / FAIL / NOT_EXECUTED]                  ║
║   Tests:       [PASS / FAIL / NOT_EXECUTED]                  ║
╠══════════════════════════════════════════════════════════════╣
║ ACTION REQUIRED (1-CLICK BUTTON OR CHAT):                    ║
║ 👉 Click [Proceed with RBG N+1] button in UI / artifact      ║
║ OR reply "continue" / "Begin RBG [N+1]" to proceed.          ║
╚══════════════════════════════════════════════════════════════╝
```

#### RBG ANTI-RANDOM-FIX RULE (NON-NEGOTIABLE)

The AI MUST NOT:
- Pick fixes randomly from any batch;
- Apply a P3 fix before all P0 fixes in the same RBG are done;
- Skip to a later RBG because an earlier RBG has a hard fix;
- Mix findings from different RBGs in the same execution turn;
- Claim an RBG is complete when any finding in it remains unresolved.

If a finding in the current RBG is BLOCKED (external decision required), document it explicitly and continue with the remaining unblocked findings in the same RBG.

> ⛔ **RBG HOST/RUNTIME UNBLOCKING RULE (NON-NEGOTIABLE):**
> Findings classified as `HOST_RUNTIME_BLOCKED_VERIFICATION` are NOT BLOCKED. The AI MUST write the complete source-level fix (screens, components, hooks, stores, styles, mocks, tests, docs) in the current RBG, document the verification commands under `DEFERRED_TO_HOST_RUNTIME`, and continue through all remaining RBG findings. Missing runtime/host capability (no Metro bundler, no simulator/device, no Maestro runner) is NEVER an excuse to mark an RBG finding blocked or pause the repair sequence.
> **MODULAR MONOLITH NOTE:** Host application root files (`package.json`, root `tsconfig.json`, `app.json`, root navigation container) are host responsibilities and NOT part of the module scope. Their absence MUST NOT be marked as an RBG blocker (`BLOCKED_BY_SUPPLIED_SCOPE`). Only genuine external product decisions (`EXTERNAL_PRODUCT_DECISION_BLOCKED`) or missing intra-module files may remain blocked.


#### RBG STATE IN progress.json

Add to the existing `progress.json` structure:

```json
{
  "rbg_plan_published": false,
  "rbg_plan_approved": false,
  "total_rbgs": 0,
  "current_rbg": null,
  "completed_rbgs": [],
  "remaining_rbgs": [],
  "rbg_findings_fixed": 0,
  "rbg_findings_remaining": 0
}
```

---

### 67C — Mandatory Bounded Execution + Persistent Checkpoint Workflow

Execution MUST be performed through bounded, resumable work units.

This section modifies EXECUTION CONTROL ONLY. It MUST NOT reduce or weaken any mobile architecture rule, design rule, test requirement, or documentation requirement.

> ⛔ **SOURCE-LEVEL WORK UNIT UNBLOCKING RULE:**
> A work unit whose source-level code fixes (screens, components, hooks, stores, styles, mocks, tests, docs) are fully written, implemented, and statically inspected within the supplied scope is **COMPLETED** for source repair. If dynamic mobile test execution cannot be run due to absence of a live device/simulator, that verification step is recorded as `DEFERRED_TO_HOST_RUNTIME`, but the work unit itself is NOT blocked and MUST NOT be stalled.
> **MODULAR MONOLITH BOUNDARY:** Host application root files (`package.json`, root `tsconfig.json`, `app.json`, root navigation container) are intentionally host-owned and NOT part of the module's scope. Their absence MUST NEVER be marked as `BLOCKED` or `BLOCKED_BY_SUPPLIED_SCOPE`. Only missing intra-module files or external product decisions may be flagged, and the AI MUST NOT halt to demand host files from the user.


Execution flow:

```text
REQUIREMENT BASELINE
        ↓
WORK-UNIT PLAN
        ↓
BOUNDED EXECUTION
        ↓
LOCAL VERIFICATION
        ↓
CHECKPOINT
        ↓
SAFE STOP
        ↓
USER REPLIES "continue"
        ↓
READ CHECKPOINT
        ↓
FIRST UNVERIFIED WORK UNIT
        ↓
CONTINUE
        ↓
...
        ↓
FULL FINAL RE-AUDIT
        ↓
FINAL CHECKLIST
        ↓
FINAL PACKAGING
        ↓
FINAL ZIP
```

#### Execution-State Location

Execution state MUST remain outside the supplied mobile feature source scope.

Use:

```text
/mnt/data/.ai_execution_state/[SAFE_TASK_ID]/ (Linux/Mac)
%LOCALAPPDATA%/.ai_execution_state/[SAFE_TASK_ID]/ (Windows)
```

Required control files:

```text
progress.json
work_units.json
checkpoint-log.md
```

These files are NOT mobile business artifacts. Do NOT move them into the feature module. Do NOT include them in the final mobile ZIP unless explicitly required.

#### Checkpoint Dashboard (Normal)

After completing and verifying a work unit, persist the checkpoint and display:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOBILE CHECKPOINT PROGRESS DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK:
[role / feature]

MODE:
[CREATE / AUDIT + REPAIR]

CHECKPOINT:
#[checkpoint_sequence]

━━━━━━━━ EXECUTION ━━━━━━━━

WORK UNITS:
[completed] / [total]
Completion: [percentage]%

Current: [WU-ID] — [title]
Next:    [WU-ID] — [title]

━━━━━━━━ REQUIREMENTS ━━━━━━━━

Verified: [verified] / [total]
Coverage: [percentage]%

━━━━━━━━ ISSUES ━━━━━━━━

Discovered: [total]
Fixed:      [completed]
Remaining:  [remaining]

━━━━━━━━ VERIFICATION ━━━━━━━━

TypeScript:       [status]
Lint:             [status]
Tests:            [status]
Design Tokens:    [status]
Functional Flows: [status]
Final Re-Audit:   [status]

━━━━━━━━ DELIVERY STATE ━━━━━━━━

Execution State:
[IN_PROGRESS / PAUSED_MANUAL_STOP / RECOVERY_REQUIRED / BLOCKED / COMPLETE]

Delivery State:
[NOT_READY / READY_FOR_FINAL_REAUDIT / READY_FOR_PACKAGING / READY_FOR_DELIVERY]

━━━━━━━━ USER ACTION ━━━━━━━━

Reply `continue` to resume from the first unverified or incomplete work unit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Resume

When the user replies `continue`, the AI MUST:

1. Read `progress.json`;
2. Read `work_units.json`;
3. Validate checkpoint;
4. Inspect filesystem;
5. Compare checkpoint against filesystem;
6. Find first unverified or incomplete work unit;
7. Reuse already-verified work;
8. Continue from that point;
9. Persist the next checkpoint.

Do NOT restart from zero merely because the previous response was interrupted.

#### Audit Completeness Protection

Checkpointing MUST NOT become permission to:
- sample files;
- skip architecture rules;
- skip design token checks;
- skip test requirements;
- skip documentation requirements;
- skip functional closure verification.

The final result MUST still satisfy all currently numbered rules in `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md`, including the Mobile Delivery Freeze Gate and Definition of Done, and the supplied `MOBILE_UI_UX_DESIGN.md`.

---

### 67D — AI-Safe Development Workflow (5-Phase Execution Blueprint)

When an AI agent or engineer implements or repairs a mobile feature, they MUST follow this 5-Phase sequence strictly:

#### Phase 1: Understand, Don't Code
AI must read in order:
1. `MOBILE_ARCHITECTURE_AND_DEVELOPMENT_RULES_V1.md`
2. `MOBILE_UI_UX_DESIGN.md`
3. Target feature's `_features.md`
4. Target feature's `_forbidden.md`
5. Target feature's `_theme_contract.md`
6. Read-only Core Contract Pack (`src/core/`)

Produce an internal change plan before modifying code:
- Exact files to create/change;
- Expected UI, state, and data impact;
- Whether API contract is complete;
- Whether a new token is strictly necessary;
- Whether core modification needs approval.

#### Phase 2: Scope Gate
Before any code change:
- Feature-local business change → editable.
- Core security/network/theme/permission change → requires explicit authorization.
- Sibling feature change → FORBIDDEN.
- Missing requirement/API behavior → record `CONTRACT_MISSING`, do not invent.

#### Phase 3: Implement Per Layer
Strict file creation order:
1. Types (`types/*.types.ts`);
2. Schemas (`schemas/*.schemas.ts`);
3. Config (`config/*.url_config.ts`, `api/*.query_keys.ts`);
4. API service (`api/*.api.ts`);
5. Hooks & Mutations (`hooks/use*.ts`);
6. State store (`state/*.store.ts` — only if shared UI state);
7. Components (`components/*.tsx`);
8. Screens (`screens/*Screen.tsx`, `*Navigator.tsx`);
9. Tests (unit co-located, integration in `tests/`);
10. Documentation trio update (`_features.md`, `_forbidden.md`, `_theme_contract.md`);
11. Maestro E2E test (`mobile_e2e/...`).

#### Phase 4: Static Verification Gates
Must pass before packaging:
- TypeScript strict check (`npm run typecheck`);
- ESLint (`npm run lint`);
- Circular dependency check (`madge`);
- Forbidden import check (no cross-feature, no bare AsyncStorage);
- Token / magic-value check;
- i18n string check (no raw English text in JSX);
- testID completeness check;
- Documentation freshness check;
- Secret scan.

#### Phase 5: Runtime & Device Gates
Verify on emulator/device or record as `DEFERRED_TO_HOST_RUNTIME`:
- iOS & Android layout on smallest screen (360dp) & large screen;
- Dynamic Type / Android largest accessibility font scaling;
- Dark & Light mode contrast compliance;
- Offline banner & blocker behavior;
- Reduced motion setting;
- TalkBack / VoiceOver traversal;
- Keyboard appearance & avoidance;
- Android hardware back button;
- Single-flight 401 token refresh.

### 67E — CI Verification: Automated Static vs Runtime/Device Division

Static CI verifies declared minimum dimensions and component contracts.
Actual hit-area, safe-area, screen-reader traversal, keyboard interaction, and
native gesture correctness require device/emulator verification and Maestro/manual
accessibility evidence.

- **Fully Automatable in CI:**
  - Zero cross-feature imports
  - Zero barrel files (`index.ts`)
  - No `any`, `@ts-ignore`, `@ts-nocheck`
  - Feature folder required files and subdirectories
  - URL config and query-key file presence
  - Forbidden package scan
  - Hardware secure storage validation (no AsyncStorage for tokens)
  - Direct Axios instance creation restricted to `src/core/network/`
  - Raw color and arbitrary sizing checks
  - `testID` presence on interactive elements
  - Locale key usage
  - Documentation freshness
  - Contrast validation against design tokens

- **Device / Runtime Required (`DEFERRED_TO_HOST_RUNTIME`):**
  - Physical touch target usability
  - Screen reader traversal order
  - Dynamic Type layout overflow
  - Native date picker presentation
  - Runtime permission dialog handling
  - Android hardware back stack pop
  - Native gesture handler conflicts

### 67F — Mandatory Feature Edge Case Matrix Template

Every feature's `_features.md` MUST include this Edge Case Matrix:

| Category | Documented Handling |
|---|---|
| **API** | Timeout (30s), No internet, 401 (single-flight refresh), 403 (PermissionDenied), 404, 409 Conflict, 429 Rate Limit, 5xx |
| **Data** | Null fields (render en-dash `—`), missing optional fields, long text strings, duplicate records, stale cache |
| **Mutations** | Double tap disabled, retry reuse idempotency key, app backgrounded mid-request, duplicate callback prevention |
| **Navigation** | Deep link unauthenticated, unauthorized, deleted entity ID, expired route params |
| **Forms** | Keyboard overlap, dirty exit guard, validation error mapping to fields, date/time timezone handling |
| **Permissions** | Denied once, denied permanently (link to Settings), partial capability |
| **Offline** | No cache (`OfflineBlocker`), cached data exists (`OfflineBanner`), tenant switch, logout cache wipe |
| **Accessibility** | 1.5x font scaling, reduced motion active, screen reader announcements |
| **Security** | PII masking in lists, clipboard restrictions, no credentials in logs/breadcrumbs, session expiration |
| **Platform** | Android hardware back, iOS swipe back, notch/safe-area insets, app background/resume |

### 67G — MANDATORY PRE-DELIVERY CROSS-CHECK VERIFICATION GATE (ZERO-EXCUSE AUDIT RECONCILIATION)

> ⛔ **HARD STOP — PRE-DELIVERY MECHANICAL CROSS-CHECK GATE (NON-NEGOTIABLE)**
> Before generating, offering, or delivering ANY 100% COMPLETE release ZIP (e.g., `mobile-{role}-v{N}-ALL-RBGS-COMPLETE.zip` or `mobile-{role}-v1.zip`), the AI MUST execute a mechanical, multi-point cross-check across the ACTUAL mobile filesystem and print the following **THREE VERIFICATION TABLES**.
>
> ⚠️ **THE ZERO-EXCUSE INVARIANT:** Outputting a mobile ZIP and subsequently stating: *"Oh sorry, maine cross-check nahi kiya and all"* or *"ye rule follow karna bhool gaya"* is classified as a **FATAL P0 WORKFLOW VIOLATION & AUDIT FRAUD**. Delivering a ZIP without physically verifying all submodules and all rules invalidates the entire deliverable.

#### Table 1: Mobile RBG Execution & Finding Closure Reconciliation
| RBG | Batches Covered | Total Findings | Fixed in Source | Skipped by User | Remaining Unfixed | Status |
|---|---|---|---|---|---|---|
| RBG 1 | [Batches] | [N] | [N] | [N] | 0 | COMPLETED |
| RBG 2 | [Batches] | [N] | [N] | [N] | 0 | COMPLETED |
| RBG N | [Batches] | [N] | [N] | [N] | 0 | COMPLETED |
*(Rule: If Remaining Unfixed > 0 for ANY RBG, the deliverable is PARTIAL and MUST be named `mobile-{role}-v{N}-PARTIAL-rbg{X}.zip`. It is STRICTLY FORBIDDEN to label it COMPLETE).*

#### Table 2: Submodule-by-Submodule Physical Audit Ledger (Zero Sampling)
*(Every single authored mobile submodule in the role MUST be listed individually with filesystem proof):*
| Submodule Path | Artifact Folders Verified | Doc Trio (22 Canonical Sections) | Screen Thinness (≤ 80 Lines) | Sibling Isolation (Zero Cross-Imports) | Anti-Lazy Scan (Zero TODO/Ellipsis) | Submodule Status |
|---|---|---|---|---|---|---|
| `{submodule-1}` | PASS (`screens/`, `components/`, `hooks/`, `api/`, `mocks/`) | PASS (`_features.md`, `_forbidden.md`, `_theme_contract.md`) | PASS (All screens ≤ 80 lines) | PASS (Zero cross-submodule imports) | PASS (Zero `// TODO`, zero `// ... rest unchanged`) | 100% VERIFIED |
| `{submodule-2}` | PASS | PASS | PASS | PASS | PASS | 100% VERIFIED |

#### Table 3: Mobile Canonical Rules Sweep Table
| Rule Domain | Canonical Requirement | Verification Method | Result |
|---|---|---|---|
| 1:1 Primary Nav Mapping | Primary Bottom Tabs / Drawer map 1:1 to Tier 3 Domain Containers (`src/features/frontend_{role}/{role}_{domain}/`) | Physical directory tree | PASS |
| Zero Flat Submodule Dumping | No granular screens or submodules dumped into primary navigation | Navigation config inspection | PASS |
| Anti-Action Nano-Module Ban | No `*_add` or `*_create` submodules; action sheets in `components/` via `@gorhom/bottom-sheet` | File/folder scan | PASS |
| Hardware Secure Storage | Auth tokens, refresh tokens, biometric keys stored in Keychain / Keystore; zero in AsyncStorage | Code grep `AsyncStorage` | PASS |
| Design System Semantic Tokens | Zero raw hex/rgb colors or raw dp sizes; 100% semantic theme token hooks | Grep `#`, `rgb(`, raw sizes | PASS |
| TanStack Query & Cache Invalidation | Query keys in `query_keys.ts`; screens not calling `useMutation` directly; `invalidateQueries` in `onSuccess` | File inspection | PASS |
| Standalone Run Harness | Section 20 Standalone Harness with mock seeders in every submodule | Harness test verification | PASS |

#### 4-Point Self-Audit Gate (Mandatory Before Packaging)
Before generating any release ZIP archive, the AI MUST execute and attest to this final 4-point verification loop:
1. `CONTRADICTION_CHECK`: Zero conflicting rules, zero conflicting naming taxonomies, zero legacy `-fix.zip` references.
2. `AUTHORITY_CHECK`: Precedence order strictly observed; existing repository package.json honored; zero invented requirements.
3. `MISSING_CONTRACT_CHECK`: Every unprovided behavior explicitly marked `CONTRACT_MISSING`; zero AI speculative guessing.
4. `HALLUCINATION_CHECK`: Every file path, component name, and line reference cited exists physically in the delivered archive.

## Rule 68 — App Upgrade, Migration, and Backward Compatibility

### Mobile Build and Release Baseline

The mobile application release pipeline enforces:
- Supported React Native version: Bare-Metal New Architecture (Fabric + TurboModules);
- Supported iOS deployment target: iOS 15.0+;
- Supported Android SDK: Min SDK 24 (Android 7.0), Target SDK 34 (Android 14);
- Node.js runtime: LTS;
- Package manager: npm with locked `package-lock.json`;
- JavaScript engine: Hermes enabled by default on iOS and Android;
- Debug vs Release: Debug builds enable MSW mocks and developer menus; Release builds strip logs and use production networkClient;
- Crash reporting: Source-map upload to Sentry required on release builds;
- Signing Security: Keystores, signing certificates, and provisioning profiles MUST NEVER be committed to the repository;
- Build Versioning: Deterministic `version` (semver), `buildNumber` (iOS integer), and `versionCode` (Android integer);
- Staged Rollout: Phased releases with automated crash rate monitoring and immediate rollback threshold.

Any persisted local state, cached data, route payload, or feature flag must have
a versioned migration strategy.

Requirements:
- Version MMKV keys and persisted Zustand state.
- Validate and safely discard incompatible cached schemas.
- Clear tenant-bound and user-bound caches on logout, tenant switch, and role change.
- Maintain backward-compatible deep-link parsing for supported app versions.
- Never assume all users update simultaneously.
- Remove feature flags only after rollout completion, telemetry confirmation, and
  cleanup of inactive code paths.
- Document migration, rollback, and cache invalidation behavior in the feature
  `_features.md`.

## MOBILE DELIVERY FREEZE GATE

> ⛔ **HARD STOP — ALL 14 SOURCE-LEVEL GATES BELOW MUST BE REPAIRED WITH PROOF.**
> **Failing or skipping ANY single source-level gate = REPAIR immediately.**
>
> ⛔ **DELIVERY RESOLUTION MANDATE (CAPABILITY-TRUTH & ZERO-STALL):**
> This requirement is subject to the Capability-Truth Delivery Rule. If archive generation
is unavailable, the AI MUST report SOURCE_COMPLETE_ARTIFACT_PENDING_HOST_PACKAGING
and MUST NOT claim that a ZIP was generated.
> When all fixable source-level code within the supplied mobile scope is complete, the AI MUST deliver the final output per the Artifact Delivery Resolution Rule:
> - If repository write access and archive-generation capability are available: create the required versioned ZIP artifact (`mobile-{role}-v{N}-ALL-RBGS-COMPLETE.zip` for complete repair, `mobile-{role}-v{N}-PARTIAL-rbg{X}.zip` for intermediate checkpoint, or `mobile-{role}-v1.zip` for first creation) and report its exact file name and contents.
> - If repository write access or archive-generation capability is unavailable: do NOT claim that a ZIP was created; provide the complete source-level repair or generated file content within the interface; report status as `SOURCE_COMPLETE_ARTIFACT_PENDING_HOST_PACKAGING`; list the exact required archive name and artifact layout.
> Missing host packaging capability MUST NOT downgrade valid source-level completion.
> Host-dependent verification steps (`DEFERRED_TO_HOST_RUNTIME`), host infrastructure files (`OUTSIDE_SUPPLIED_SCOPE`), and external product decisions (`EXTERNAL_PRODUCT_DECISION_BLOCKED`) MUST be documented in `RE_AUDIT_CHECKLIST_RESULT.md` and `INTEGRATION_GUIDE.md`, but MUST NEVER trigger `BLOCKED_DELIVERY` or prevent source-level delivery.

| Gate # | Gate Description | Verification Directive | Consequence of Failure |
|---|---|---|---|
| **Gate 1** | No Critical Findings Open | Verify zero broken mobile user flows, wrong resource identity, or data integrity issues | **STOP.** Broken flow = REJECTED DELIVERY |
| **Gate 2** | No Major Architecture Violations | Verify state ownership, zero cross-feature imports via Rule 28, strict feature naming, Rule 0A.3 1:1 primary navigation to feature folder mapping | **STOP.** Sibling import = REJECTED DELIVERY |
| **Gate 3** | Design Token Mapping Verified | Theme module mapping verified — all semantic tokens produce valid StyleSheet values; zero raw colors or hardcoded dp | **STOP.** Unstyled or broken component in dark/light mode |
| **Gate 4** | Zero Hardcoded Colors or Insets | Grep for hex `#`, `rgb(`, raw sizes without `// design-exception: <reason>` | **STOP.** Hardcoded style = REJECTED DELIVERY |
| **Gate 5** | Hardware-Backed Secure Storage Only | Verify auth tokens, refresh tokens, and biometric keys use `react-native-keychain` / Keystore. Zero tokens in `AsyncStorage` | **STOP.** Insecure storage = CRITICAL SECURITY VULNERABILITY |
| **Gate 6** | Centralized URL Config Present | `config/[featureName].url_config.ts` present, exports all routes/APIs with real paths (zero placeholders) | **STOP.** Missing config = REJECTED DELIVERY |
| **Gate 7** | Feature Map Non-Generic | `[featureName]_features.md` complete with all 22 mandatory sections (no TBDs or boilerplate) | **STOP.** Generic doc = INCOMPLETE MODULE |
| **Gate 8** | TanStack Query & Hook Architecture | Query keys registered in `[featureName].query_keys.ts` with resource identity; screens NOT calling `useMutation` directly; cache invalidation via `useMutation({ onSuccess: () => queryClient.invalidateQueries(...) })` per Rule 60 | **STOP.** Broken server state / crash |
| **Gate 9** | Form Architecture Compliance | React Hook Form + Zod validator class/schema; zero Yup/Joi; controlled inputs | **STOP.** Broken form validation |
| **Gate 10** | Screen Thinness Ceilings Enforced | All screens in `screens/` ≤ **80 lines**; composition only; zero business logic or direct API calls | **STOP.** Monolithic screen = ARCHITECTURE FAILURE |
| **Gate 11** | Scope Integrity Verified | Changed-file list produced — strictly target feature files changed (`features/frontend_{role}/{module}/**`) | **STOP.** Scope leak = REJECTED DELIVERY |
| **Gate 12** | Multi-Tenancy Enforced | Verify `x-tenant-id` derived from trusted session context, never from route params or client payload | **STOP.** Cross-tenant data vulnerability |
| **Gate 13** | Complete Async States | Verify loading skeletons (`[Feature]Skeleton.tsx`), empty states (`[Feature]EmptyState.tsx`), and error fallbacks implemented | **STOP.** Blank screen on async fetch |
| **Gate 14** | Consolidated Integration Guide & Re-Audit Included | `INTEGRATION_GUIDE.md` (consolidating changelog, navigation route registry, host integration steps, and verification commands), `RE_AUDIT_CHECKLIST_RESULT.md`, and Maestro E2E test suite present inside ZIP root | **STOP.** Missing deliverable = REJECTED DELIVERY |

> ⛔ **If ANY source-level code gate fails: STATUS = `REPAIR_REQUIRED`. Fix the source code. Once all source-level code fixes are written, deliver the output per the Artifact Delivery Resolution Rule with deferred/out-of-scope items explicitly documented.**
>
> ⛔ **NOTE ON OFFLINE VERIFICATION & MAESTRO TEST RUNS:**
> Gate 14 and DoD Gate 5 require the Maestro YAML test suite files (`mobile_e2e/`) to be fully authored, structured, and included in the ZIP. If the local environment lacks a mobile device/emulator or Maestro runner, the YAML files are verified statically as PASS, and dynamic execution is recorded as `DEFERRED_TO_HOST_RUNTIME`. Device/runner absence MUST NOT trigger `BLOCKED_DELIVERY` or block delivery when the YAML test suite is fully authored and present.


---

## DEFINITION OF DONE — Mobile Architecture Release Checklist

> ⛔ **HARD STOP — ALL ITEMS BELOW ARE MANDATORY INVARIANTS FOR PRODUCTION RELEASE.**
> **Every item MUST be verified against actual code with file and line evidence. Record `NON_COMPLIANT` for any failure.**

### 1. Architecture & Isolation Gate
- [ ] **AI Portability:** Feature folder alone provides complete context for understanding, mocking, testing, and repairing the feature. — *STOP if sibling business files are required.*
- [ ] **Zero Cross-Feature Imports:** Zero imports from sibling feature modules (Rule 28). — *STOP if `import ... from '../sibling'` found.*
- [ ] **Screen Thinness:** All screen files in `screens/` ≤ 80 lines; compose components only; zero business logic. — *STOP if screen exceeds 80 lines.*
- [ ] **Feature Documentation Trio:** `[featureName]_features.md`, `[featureName]_forbidden.md`, and `[featureName]_theme_contract.md` present and populated. — *STOP if any documentation artifact is missing.*
- [ ] **URL Config Centralization:** `config/[featureName].url_config.ts` present and consumed by all API call sites. — *STOP if raw endpoint strings exist in code.*

### 2. State & Data Contract Gate
- [ ] **Server State via TanStack Query:** Server data managed through TanStack Query; query keys registered in `[featureName].query_keys.ts`. — *STOP if API data duplicated in Zustand.*
- [ ] **Client UI State via Feature-Scoped Store:** Module-scoped Zustand store for shared client UI state; hard ceiling 180 lines. — *STOP if single global store used.*
- [ ] **Pessimistic UI Updates:** Destructive and financial mutations wait for authoritative server response before updating UI (Rule 32). — *STOP if premature optimistic update.*
- [ ] **MSW / Mock Completeness (Rule 7A):** MSW handlers and fixtures cover 100% of UI fields, card fields, KPI metrics, chart series, and filters. — *STOP if empty card fields.*

### 3. Security & Safety Gate
- [ ] **Hardware Secure Storage:** Auth tokens and sensitive credentials stored in iOS Keychain / Android Keystore via `react-native-keychain`. — *STOP if tokens in AsyncStorage.*
- [ ] **Double Verification (Rule 31):** Delete, terminate, suspend, or financial triggers require confirmation bottom sheet (`useConfirmSheet`). — *STOP if single-tap delete exists.*
- [ ] **PII & Financial Masking (Rule 30):** Phone numbers, national IDs, and account numbers masked in list/card views via `maskSensitiveData()`. — *STOP if raw PII in list.*
- [ ] **Mutational Idempotency (Rule 53):** All mutating API calls (POST/PATCH/PUT/DELETE) require `idempotencyKey` and inject `Idempotency-Key` header. — *STOP if missing idempotency key.*

### 4. Error Handling & Feedback Gate
- [ ] **Backend-Driven Messages:** User-facing success and error messages display `response.message`. Localized fallback strings used for network failures. — *STOP if raw JS error shown.*
- [ ] **Structured Validation Mapping (Rule 48):** 400 validation error dictionaries mapped directly to form fields via `handleValidationErrors()`. — *STOP if generic error toast replaces field errors.*
- [ ] **Toast Deduplication (Rule 40):** Stable `toastId` passed to all emitted toasts. Identical error notifications do not stack. — *STOP if duplicate toasts flood screen.*

### 5. Testing & Verification Gate
- [ ] **Behavioral Testing Proof (Rule 17):** Unit/component tests verify real user actions (tap -> submit -> visible state update). Element existence checks alone are REJECTED. — *STOP if tests are superficial.*
- [ ] **Coverage Standards:** Custom hooks tested at ≥80% branch coverage; utilities tested at ≥90% branch coverage. — *STOP if coverage below threshold.*
- [ ] **Maestro E2E Tests:** Critical mobile CRUD and auth flows covered in YAML-based Maestro test suite (`mobile_e2e/`). — *STOP if E2E missing for critical flows.*

### 6. Performance & UX Gate
- [ ] **Virtualized Lists (Rule 8):** Any list rendering >20 items uses `FlatList` or `@shopify/flash-list` with `React.memo` item renderers. Never `ScrollView` wrapping `.map()`. — *STOP if mapped ScrollView used.*
- [ ] **Search & Filter Debounce:** Search inputs debounced ≥300ms before triggering API/query calls. — *STOP if API flooded on every keystroke.*
- [ ] **Button Loading Stability (Rule 39):** Submit buttons have explicit `minWidth` to prevent layout shift during loading state. — *STOP if button shrinks on submit.*

### 7. Native Platform Conventions Gate
- [ ] **Navigation Conventions:** Native stack swipe-back on iOS and Android hardware back button handler wired correctly. — *STOP if Android back button breaks.*
- [ ] **Safe Area Insets:** Screen roots use `<SafeAreaView>` from `react-native-safe-area-context` or `useSafeAreaInsets()`. Zero hardcoded padding offsets. — *STOP if content clips notch.*
- [ ] **Native Pickers & Bottom Sheets:** Platform-native date/time pickers and `@gorhom/bottom-sheet` used for contextual selection. — *STOP if custom web dropdown used.*
- [ ] **Haptic Feedback (Rule 11):** Haptic feedback paired with switches, form completions, and destructive actions. — *STOP if significant action lacks haptic.*

### 8. Localization Gate
- [ ] **Zero Hardcoded Strings (Rule 61):** All user-facing text uses `t('namespace.KEY')`. Backend `response.message` displayed directly. — *STOP if hardcoded English string in JSX.*
- [ ] **Locale-Aware Currency (Rule 37, 63):** Currency formatted via feature-local `formatCurrency()` using integer minor units. Division in JSX forbidden. — *STOP if raw minor units rendered.*
- [ ] **En-Dash Nullable Fallback (Rule 38):** All nullable/optional fields rendered via `displayValue()`. Zero blank cells or raw "N/A". — *STOP if raw null renders blank.*
