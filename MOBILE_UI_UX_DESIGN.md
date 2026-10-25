# React Native Global Design System — Token Source

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

> ⛔⛔⛔ **AI AGENT — MANDATORY DESIGN ENFORCEMENT & INTEGRITY DIRECTIVE — READ FIRST** ⛔⛔⛔
>
> **COMPLIANCE FAILURE HANDLING (EVIDENCE-BASED REPAIR):**
> Failure to establish required token evidence triggers a mandatory compliance stop for the affected work path. The violation must be recorded, repaired in source code, and rechecked before continuation. Previously valid, unaffected work does not need to be discarded.
>
> This document is the **absolute normative visual authority** and **AI-readable token catalogue** for all React Native mobile styling in this project. Every token and design rule is MANDATORY unless the rule itself defines an explicit design exception with `// design-exception: <reason>`. The following words in this document carry their STRICTEST possible meaning:
>
> | Word | Meaning |
> |------|---------|
> | **MUST** | Absolute requirement — no exception, no omission, no interpretation |
> | **MUST NOT** | Absolute prohibition — no exception under any circumstance |
> | **FORBIDDEN** | Same as MUST NOT — harder emphasis |
> | **REQUIRED** | Same as MUST — mandatory deliverable |
> | **encouraged** / **preferred** | Still a **default requirement** — deviations require explicit documented justification |
> | **Optional** | Only optional when the feature **genuinely has no such visual artifact** |
> | **except** / **unless** | Only a valid escape when ALL stated conditions for the exception are explicitly met and documented |
>
> ⛔ **BEFORE WRITING ANY STYLED COMPONENT, SCREEN, OR THEME CODE, CONFIRM:**
> ```text
> [ ] Read complete MOBILE_UI_UX_DESIGN.md (all 22 sections)
> [ ] Zero hardcoded hex, RGB, dp numbers, or arbitrary sizing (100% tokens from theme module)
> [ ] Platform touch targets verified: minimum 44pt (iOS) / 48dp (Android)
> [ ] Dynamic Type / font scaling verified without clipping text
> [ ] Safe area handling verified via useSafeAreaInsets / SafeAreaView
> [ ] Accessibility verified: every interactive element exposes a meaningful
>     localized accessible name; icon-only/ambiguous controls use
>     `accessibilityLabel`; `accessibilityRole`, `accessibilityState`,
>     `accessibilityHint`, and accessibility actions are supplied where relevant.
> [ ] Reduced motion support implemented via AccessibilityInfo.isReduceMotionEnabled()
> [ ] Meaningful haptic feedback is implemented only for approved high-value state
>     transitions; ordinary navigation, passive card taps, scrolling, auto-refresh,
>     and background actions do not trigger haptics.
> [ ] Section 22 DEFINITION OF DONE loaded into context
> ```
> **COMPLIANCE FAILURE HANDLING (EVIDENCE-BASED REPAIR):**
> On detecting a violation, the AI MUST:
> 1. Stop the affected styling/implementation path immediately;
> 2. Record the violated token/design rule, affected component, and evidence;
> 3. Repair the violation before continuing;
> 4. Re-run relevant static design and contrast compliance checks;
> 5. Mark final status as compliant ONLY after file-level token evidence is established.

Spacing / radius / icon / touch-target values → dp-equivalent React Native layout units.
Typography → React Native text scale / fontSize.
Animation durations → milliseconds.
Opacity → normalized 0–1.
Layering is controlled by named `zIndex` tokens.
Android elevation is defined separately by the shadow/elevation token system.

> `MOBILE_UI_UX_DESIGN.md` is the **canonical visual-values source** and the
> **AI-readable token catalogue**. It defines what every token is worth in light
> and dark mode, and lists every token name, value, and usage context in one
> scannable table that AI agents read before writing any styled component.
>
> Hierarchy:
>
> `MOBILE_UI_UX_DESIGN.md`
> → React Native theme module
> → Feature UI
>
> The VALUES below and the "no magic values anywhere" discipline are universal.
>
> “No magic values” applies to visual design decisions: colors, spacing, typography,
> radius, icon sizes, touch-target dimensions, shadows, opacity, elevation, z-index,
> and animation durations.
>
> React Native structural values are allowed when they are not design decisions,
> including Flexbox control values, semantic native component props, Boolean values,
> `StyleSheet.hairlineWidth`, and documented native-library/runtime requirements.

---

## PLATFORM APPLICABILITY MATRIX

This document governs the **React Native mobile application only**. Rules reference mobile-specific technologies such as `AccessibilityInfo`, `SafeAreaView`, `Platform.OS`, and React Native's Flexbox layout model.

| Rule Area | Mobile (React Native) | Web (Next.js) | Shared / Both |
|---|---|---|---|
| React Native Flexbox, `StyleSheet`, dp units | ✅ | ❌ | — |
| Color tokens and semantic naming | ✅ | ✅ (see WEB_FRONTEND_UI_UX_DESIGN.md) | ✅ |
| Accessibility (via `AccessibilityInfo`, roles, hints) | ✅ | ❌ (uses ARIA/WCAG) | — |
| Safe area handling (`useSafeAreaInsets`) | ✅ | ❌ | — |
| Platform conventions (iOS / Android back navigation) | ✅ | ❌ | — |
| Touch targets (44pt iOS / 48dp Android) | ✅ | ❌ (web uses 44×44px) | — |
| `prefers-reduced-motion` via `AccessibilityInfo.isReduceMotionEnabled()` | ✅ | ❌ (web uses CSS media query) | — |
| Dynamic Type / Android font scaling | ✅ | ❌ | — |
| Status/payment/chart token palette | ✅ | ✅ | ✅ |
| Feature isolation, module naming, AI repair boundary | ✅ | ✅ | ✅ |
| Security principles (auth, permissions, PII masking) | ✅ | ✅ | ✅ |
| CTA gradient restriction (ERP dashboard) | ✅ | ✅ | ✅ |

**Conflict Resolution Hierarchy:** When rules in this document conflict with each other or with other documents, resolve using this precedence order (highest to lowest):
1. **Security & Privacy** — authentication, authorization, PII handling
2. **Legal / Compliance** — accessibility standards, data protection requirements
3. **Accessibility** — Dynamic Type, screen-reader support, reduced motion
4. **Platform Conventions** — iOS and Android expected native behaviors
5. **Product Requirements** — documented business feature needs
6. **Architecture Rules** — isolation, naming, token discipline
7. **Visual Preferences** — colors, animations, spacing aesthetics

Deviations from this hierarchy MUST be documented in the affected sub-module's `[role]_[submodule]_features.md`.

---

## Global Token Enforcement Rule

No feature/screen/component may contain:
- raw hex/RGB colors
- arbitrary spacing values
- arbitrary font sizes
- arbitrary radius values
- arbitrary icon sizes
- arbitrary animation durations
- arbitrary shadow/elevation values
- arbitrary z-index/elevation values

Every visual value must resolve through a documented global token.

> ⛔ **REACT NATIVE TOKEN CONTRACT (NO WEB CSS VARIABLES):**
> In React Native bare-metal (New Architecture), web CSS custom properties (`--primary-color`, `var(...)`) do NOT exist.
> All visual design decisions MUST be accessed via the typed `useThemeTokens()` hook (`tokens.color.primary`, `tokens.space[4]`, `tokens.typography.body`, `tokens.radius.md`).
> Components must NEVER hardcode inline hex colors (`#FF0000`), raw dp values (`fontSize: 18`), or ad-hoc style objects without tokens.

### Design-Magic-Value Boundary

“Zero magic values” applies to visual design decisions that could diverge across
screens: colors, spacing, typography scale, radius, icon size, touch dimensions,
shadows, opacity, motion durations, z-index, and elevation.

The following React Native structural or platform API values are permitted and do
not require design tokens when they are not visual design choices:

- Flexbox control values: `flex: 1`, `flexDirection`, `alignItems`, `justifyContent`,
  `flexGrow`, `flexShrink`, `flexWrap`
- Boolean component props: `disabled`, `accessible`, `scrollEnabled`
- React Native semantic props: `numberOfLines`, `ellipsizeMode`, `keyboardType`,
  `autoCapitalize`, `returnKeyType`
- Accessibility states and role strings
- List configuration values required by a native component, when documented
- Runtime values explicitly covered by the design-exception process

A numeric visual value is permitted only when:
1. it is read from a global token,
2. it is a documented runtime-derived exception, or
3. it is mandated by a React Native/native library API and is documented with
   `// design-exception: native API requirement`.

**Exception Process — Controlled Runtime Values:**
Locally derived layout values are permitted ONLY when the value cannot be expressed as a static token AND an explicit `// design-exception: <reason>` comment documents why. Permitted exception categories:
- Safe-area insets (from `useSafeAreaInsets()`) — device-dependent at runtime
- Device screen dimensions (from `useWindowDimensions()` hook — static `Dimensions.get()` is FORBIDDEN due to orientation and foldable device failure)
- Keyboard offset height — varies per device and input type
- Image aspect ratios computed from API-provided dimensions
- Animation interpolation output ranges — runtime-derived from gesture values
- Platform-native component sizing requirements where the system component dictates a specific size

When a runtime-derived value proves reusable across multiple features, it MUST be promoted to a named token.

```typescript
// ✅ PERMITTED — runtime-derived exception with documentation
const { bottom } = useSafeAreaInsets();
<View style={{ paddingBottom: bottom + tokens.space[4] }} />
// design-exception: safe-area inset is device-dependent at runtime

// ❌ FORBIDDEN — arbitrary value without justification
<View style={{ paddingBottom: 34 }} />
```

## Token Architecture Chain

`MOBILE_UI_UX_DESIGN.md`
→ React Native theme module
→ feature UI

- This file owns canonical visual values.
- The React Native theme module implements them.
- The theme module catalogs the exact dependencies.
- Feature UI consumes semantic tokens only.
- Feature UI never hardcodes global values.
- Feature UI never guesses token names.

> **CRITICAL WARNING TO AI AGENTS (COMPONENT ISOLATION & SUB-MODULE WET PRINCIPLE):**
> 1. **Zero Global Business UI:** Do NOT attempt to "DRY up" business-aware components (e.g., Date Filters with presets, Status Badges with hardcoded text, Metric Cards) by moving them to global folders like `widgets/common/` or `ui/`. Global UI folders are STRICTLY for zero-business, dumb primitives.
> 2. **Zero Cross-Sub-Module Styling Imports (Strict WET Law):** Sibling sub-modules (e.g., `attendance_dashboard`, `attendance_history`, `attendance_analytics`, `attendance_biometrics`) MUST NOT import UI components, cards, badges, or styled views from each other.
> 3. **Parent Shared UI Banned:** Creating shared parent folders (e.g., `attendance/common/` or `attendance/components/`) is **STRICTLY PROHIBITED**. Every sub-module MUST duplicate its required UI components locally inside `{submodule}/components/` (Strict WET Principle).
> 4. **Consequence:** An AI modifying a shared business component to fix Submodule A will silently break Submodule B, triggering cross-submodule regression cascades and violating the Sub-Module ZIP Guarantee.

---

## DESIGN SYSTEM OWNERSHIP BOUNDARY

### GLOBAL DESIGN SYSTEM owns:
- Semantic color tokens, surface/elevation tokens, typography, radius scale
- Spacing scale, touch-target tokens, motion tokens
- Button/card/list-item/form/bottom-sheet visual patterns
- Global async state patterns (skeleton, empty, error, offline)
- Approved visual treatment for charts, haptics, toasts, loading, empty and error states

### FEATURE & SUB-MODULE owns:
- Business statuses and status-to-semantic-color mapping
- Feature-specific icons, static UI constants, labels and configuration
- Local presentational components (`[Role][Submodule][Name].tsx`) inside `{submodule}/components/`
- API/server data, module state, tests, MSW fixtures/handlers, feature behavior

### SUB-MODULE THEME CONTRACT owns:
- The exact list of global semantic tokens required by the specific sub-module (`[role]_[submodule]_theme_contract.md`)
- Any explicitly justified sub-module local visual token with `// design-exception: <reason>`

### GLOBAL DESIGN MUST NOT own:
- Business navigation configuration
- Business status registry (like `Active`, `Paid`, `Pending`)
- Feature-specific business data (member/plan/payment/etc.)
- Feature API behavior, specific constants, or business feature logic

## 1A. Contrast Validation (WCAG AA)

Every semantic foreground/background pair used for normal UI text MUST meet WCAG AA contrast requirements (4.5:1 for normal text).
The theme module MUST be contrast-tested for all Light/Dark semantic pairs.
CI/design validation MUST fail when an approved text/background pair falls below the required threshold.

Ensure `primary` (`#FACC15` dark / `#EAB308` light) and `destructive` (`#B91C1C`) against `on-primary` (`#111111`) and `on-destructive` (`#FFFFFF`) pass this contrast validation before final theme lock.

The project default is 4.5:1 minimum for all text, including large text, to
avoid subjective classification errors. WCAG's lower large-text threshold must
not be used as an automatic exception.

Any exception below 4.5:1 requires:
1. documented legal/accessibility approval;
2. explicit token-level exception in this document;
3. an alternative non-color communication method;
4. accessibility review evidence.

## 1B. React Native Accessibility Interaction Tokens

React Native does not use web CSS `:focus-visible`. The design system must support
native accessibility interaction through:

- `focusRingColor`
- `focusRingWidth`
- `focusRingOffset`
- `disabledOpacity`
- semantic selected/checked/expanded/busy states
- accessibility announcement patterns
- focus restoration after modal, sheet, and error-state dismissal

Focus-ring visuals are required only where the component supports hardware keyboard,
switch control, TV focus, or a custom focusable implementation. Native controls
should preserve their platform-native focus behavior.

Do not add web-only ARIA or CSS terminology to React Native implementation rules.

## 1C. Mobile Accessibility Requirements (Comprehensive)

All screens and components MUST meet these mobile accessibility standards:

### Screen Reader (VoiceOver / TalkBack)
- Every interactive element MUST expose a meaningful accessible name.
  - Icon-only, visually ambiguous, abbreviated, dynamic, or contextual controls
    MUST provide an explicit localized `accessibilityLabel`.
  - A text-labelled native control may use its visible localized text as its
    accessible name when that text fully and unambiguously describes the action.
  - Never rely on visible text alone for icon-only controls.
- Use `accessibilityHint` to describe the outcome of an action where the label alone is insufficient (e.g., `accessibilityLabel="Delete member"` + `accessibilityHint="Permanently removes the member and all their data"`).
- Use `accessibilityRole` to communicate the semantic role: `button`, `link`, `header`, `checkbox`, `switch`, `image`, `text`, `none`, etc.
- Use `accessibilityState` to communicate dynamic states: `{ disabled, selected, checked, busy, expanded }`.
- Use `accessibilityValue` for progress, sliders, and stepped controls.
- Use `accessible={false}` on purely decorative elements to exclude them from the screen reader traversal order.
- Use `importantForAccessibility="no-hide-descendants"` (Android) on container views that wrap decorative or non-interactive content to prevent TalkBack from traversing into their children. This is the Android equivalent of `accessible={false}` for container-level exclusion.
- Logical focus/traversal order MUST follow the visual reading order top-to-bottom, left-to-right.

### Touch Targets
- Every tappable element MUST meet the platform minimum: **44pt on iOS, 48dp on Android**.
- Use `hitSlop` to extend the touch area without changing the visual size for smaller controls.
- Never rely only on visual size — small icons can pass visually but fail accessibility without `hitSlop`.

### Dynamic Type / Font Scaling
- All `<Text>` components MUST support `allowFontScaling={true}` (the RN default).
- Do not cap font scaling for general content. `maxFontSizeMultiplier` is permitted
  only for tightly measured secondary UI where full text remains accessible through
  an alternate layout or accessible label. Every cap requires a documented
  `// design-exception:` and an entry in the owning feature's `_features.md`.
  See Section 3 for the complete Dynamic Type policy.
- Test all screens at the largest accessibility text size on both platforms.

### High Contrast Support
- Where the platform supports high-contrast mode, verify token pairs maintain sufficient contrast at high-contrast settings.
- Never use low-contrast muted text for critical information (errors, warnings, primary actions).

### Async Status Announcement Rule

For asynchronous success, validation, warning, and error updates:
- **Android:** Use `accessibilityLiveRegion="polite"` (non-critical) or `"assertive"` (critical errors).
- **iOS:** Use `AccessibilityInfo.announceForAccessibility(localizedMessage)`.
- Cross-platform critical announcements may use both mechanisms where supported.
- Announcements MUST use localized, user-safe text.
- Raw server errors, stack traces, and unvalidated response text MUST NOT be announced.
- Never rely only on color to communicate an error (pair with icon + text).

### Reduced Motion (already in Section 7 — cross-reference)
- Non-essential animations MUST respect `AccessibilityInfo.isReduceMotionEnabled()`.
- See Section 7 for full reduced-motion rules.

## Accessibility Test Requirement

For every interactive component, tests MUST verify as applicable:
- accessible name / localized `accessibilityLabel` presence on icon-only and ambiguous controls;
- `accessibilityRole` (`button`, `link`, `header`, `checkbox`, `switch`, etc.);
- `accessibilityState` for disabled, selected, checked, expanded, or busy states;
- `accessibilityHint` where an action outcome is non-obvious;
- focus containment and focus restoration after modal or bottom-sheet dismissal;
- readable behavior at increased system font scaling (Dynamic Type);
- reduced-motion fallback for all non-essential animation.

Critical user journeys must include Maestro accessibility-oriented assertions where supported by the runner environment.

## 1. Color Tokens — "Luxury Premium Gold" Theme

> **CRITICAL:** This project uses the **Luxury Premium Gold** theme — identical semantic intent as the web platform. The primary brand color is **Premium Gold (`#FACC15`)**, not indigo/purple. This ensures visual consistency across web and mobile surfaces. The ERP relies on the 5-color core architecture (Gold Primary, Blue Info, Green Success, Amber Warning, Red Danger). Aggressive gradients are **strictly restricted** to Landing Page hero CTAs — they MUST NEVER be used inside the authenticated ERP dashboard screens.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#F4F4F5` | `#050505` | Screen root background |
| `foreground` | `#000000` | `#FFFFFF` | Primary text, headings |
| `card` | `#FFFFFF` | `#111111` | Card / surface / bottom sheet background |
| `card-elevated` | `#FAFAFA` | `#1A1A1A` | Elevated card, floating surfaces, inputs |
| `overlay` | `#FFFFFF` | `#242424` | Modals, dialogs |
| `popover` | `#F4F4F5` | `#2E2E2E` | Dropdowns, tooltips |
| `primary` | `#EAB308` | `#FACC15` | Primary buttons, active nav item, FAB |
| `primary-pressed` | `#CA8A04` | `#EAB308` | Primary button pressed state |
| `primary-subtle` | `rgba(234,179,8,0.15)` | `rgba(250,204,21,0.15)` | Soft badge backgrounds, selected row highlight |
| `primary-text` | `#EAB308` | `#FACC15` | Text links, primary text buttons |
| `destructive` | `#B91C1C` | `#B91C1C` | Errors, delete actions |
| `border` | `#E4E4E7` | `#27272A` | Dividers, input borders |
| `border-focus` | `#A16207` | `#FACC15` | Input border on focus |
| `muted` | `#52525B` | `#A1A1AA` | Secondary/disabled text, placeholders |
| `on-primary` | `#111111` | `#111111` | Text/icon on primary fill |
| `on-destructive` | `#FFFFFF` | `#FFFFFF` | Text/icon on destructive fill |
| `on-success` | `#FFFFFF` | `#FFFFFF` | Text/icon on success fill |
| `on-info` | `#FFFFFF` | `#FFFFFF` | Text/icon on info fill |
| `on-warning` | `#111111` | `#111111` | Text/icon on warning fill |
| `focus-ring` | `#A16207` | `#FACC15` | Input focus and keyboard focus ring |
| `skeleton-base` | `#E4E4E7` | `#111111` | Skeleton shimmer base |
| `skeleton-highlight` | `#F4F4F5` | `#1A1A1A` | Skeleton shimmer highlight |
| `surface-pressed` | `rgba(234,179,8,0.08)` | `rgba(250,204,21,0.08)` | List item pressed-state highlight |
| `overlay-backdrop` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.6)` | Modal/sheet background dim |

### Opacity Tokens
| Token | Value | Usage |
|---|---|---|
| `opacity-disabled` | 0.5 | Disabled interactive elements |
| `opacity-loading` | 0.7 | Button loading states |
| `opacity-masked` | 0.8 | Sensitive data masking |

## 2. Spacing Scale
Feature UI must use these named spacing tokens and may not invent arbitrary spacing:
`space-1 = 4`
`space-2 = 8`
`space-3 = 12`
`space-4 = 16`
`space-5 = 20`
`space-6 = 24`
`space-7 = 32`
`space-8 = 40`
`space-9 = 48`

## 3. Typography Scale

### React Native Typography Contract

All typography values MUST be expressed as explicit React Native unit properties. "Platform-independent units" are not sufficient — specify the exact numeric values below:

| Token | `fontSize` | `lineHeight` | `letterSpacing` | `fontWeight` | Usage |
|---|---|---|---|---|---|
| `caption` | 12 | 18 | 0.5 | `'400'` | Captions, timestamps, badge text |
| `body-sm` | 14 | 21 | 0 | `'400'` | Body secondary, helper text |
| `body` | 16 | 24 | 0 | `'400'` | Body primary, input text |
| `heading-sm` | 18 | 22 | -0.5 | `'600'` | Section headers, card titles |
| `heading-lg` | 22 | 28 | -0.5 | `'700'` | Screen titles |
| `kpi` | 28 | 34 | -1 | `'700'` | KPI / stat numbers on dashboard cards |
| `label-uppercase` | 11 | 16 | 1 | `'600'` | UPPERCASED stat card labels, table headers |

**Font family contract:**
- Default: System UI font stack (`System` — resolves to San Francisco on iOS, Roboto on Android).
- Custom fonts: Must be linked via React Native's native font linking mechanism (`react-native link` or manual native project configuration). Never use `expo-font`.
- Fallback: If a custom font fails to load, always fall back to the system default.

**Truncation behavior:**
- Single-line truncation: `numberOfLines={1}` + `ellipsizeMode='tail'`
- Multi-line truncation: `numberOfLines={N}` + `ellipsizeMode='tail'`
- Never clip text without a visible indicator that content was truncated.

**Font Scaling — Dynamic Type (iOS) and Font Size (Android):**
- The theme MUST handle Dynamic Type and Android font scaling properly.
- Set `allowFontScaling={true}` (default) on all `<Text>` components unless a specific measured UI element has a documented exception.
- Do not apply `maxFontSizeMultiplier` to general body content, form labels,
  validation messages, legal text, or primary action labels by default.
- A cap may be used only for tightly measured secondary UI such as a compact badge,
  tab label, or decorative KPI label where the full text remains available through
  an accessible label or alternate layout.
- Any cap requires a `// design-exception:` comment and must be listed in the
  owning feature's `_features.md`.
- The application must remain usable at the platform's largest accessibility text size.
- Developers MUST test all screens at the largest accessibility text size on both iOS and Android.
- NEVER hardcode pixel-specific layout dimensions that assume a fixed font size — use `flexShrink`, `flexWrap`, and `minHeight` to accommodate text growth.

### Text Resilience Rules

Every text-bearing layout must be tested with:
- longest translated string (Hindi/other languages can be 40-100% longer than English),
- long user-entered name/address,
- Dynamic Type / Android largest font setting,
- RTL locale when supported,
- null/undefined display fallback.

Rules:
- Use `flexShrink: 1` for text sharing a row with icons or actions.
- Use `minWidth: 0` in horizontal containers when required for truncation to work.
- Never truncate primary legal, financial, validation, or destructive-action text.
- For essential content that cannot fit, allow wrapping or navigate to a detail view.
- Numeric data must use locale-aware formatting and tabular alignment where comparison matters.

## 4. Radius Scale
`radius-sm (4)`, `radius-md (8)`, `radius-lg (12)`, `radius-xl (16)`, `radius-full`
— cards default to `radius-lg`, buttons/inputs to `radius-md`.

## 5A. Layout Tokens

| Token | Value | Usage |
|---|---|---|
| `button-min-width` | 120 | Minimum button width to prevent layout shift on loading |
| `min-touch-target-ios` | 44 | Minimum interactive target on iOS |
| `min-touch-target-android` | 48 | Minimum interactive target on Android |
| `min-touch-target` | platform-resolved | Use through `getMinTouchTarget()` only |
| `header-height` | 56 | Top navigation bar height |
| `bottom-tab-height` | 60 | Bottom tab bar height |
| `content-padding` | 16 | Standard screen horizontal padding |
| `card-padding` | 16 | Standard card internal padding |
| `fab-size` | 56 | Floating action button size |

## 5B. Icon Sizes

`icon-sm (16)`, `icon-md (20)`, `icon-lg (24)` — default stroke/weight `1.75`.

Use named `icon-*` size tokens. Introduce a new token when a supported icon library or specific platform convention strictly requires a new standard size.
**Note:** Icon visual size and interactive hit area are separate concepts. No arbitrary icon sizes without justification. Touch targets remain governed by the 44 iOS pt / 48 Android dp rule.

---

## 5C. Mobile Navigation Shell Architecture & Navigation Token Contract (Bottom Tabs, Drawer, Segmented Tabs, and Action Bottom Sheets)

Every authenticated mobile screen renders within a platform-native navigation hierarchy. Primary navigation maps 1-to-1 to Tier 3 Domain Containers (`manager_crm`, `manager_attendance`, `manager_accounting`), secondary navigation accesses Tier 4 Autonomous Sub-Modules (`crm_enquiries`, `crm_leads`), and actions/forms are presented via `@gorhom/bottom-sheet` panels.

```text
┌────────────────────────────────────────────────────────────────────────┐
│  STATUS BAR (Style: light-content in Dark Mode / dark-content in Light)│
├────────────────────────────────────────────────────────────────────────┤
│  TOP HEADER (height: 56pt, SafeAreaView top)                           │
│  [☰ Drawer]   [CRM: Enquiries]                     [🔔 (3)] [👤 Profile]│
├────────────────────────────────────────────────────────────────────────┤
│  SUB-MODULE SEGMENTED TOP BAR (height: 44pt — Pattern A)               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [📌 Enquiries (Active)]    [🎯 Leads]    [📈 Pipeline]            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  MAIN SCREEN AREA (Virtualized List: FlashList / FlatList)             │
│                                                                        │
│  [🔍 Search Enquiries input field ────────────────────────────────────]│
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  CARD 1: Rahul Sharma — Gold Annual Plan (Trial)                 │  │
│  │  Status: [New] · Source: Instagram · Date: Today 10:30 AM        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  CARD 2: Priya Patel — Personal Training Inquiry                 │  │
│  │  Status: [Follow-up] · Source: Walk-in · Date: Yesterday         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                                                ┌─────────────────────┐ │
│                                                │ [+] FAB: Add Enquiry│ │
│                                                │ (56x56pt, Gold Fill)│ │
│                                                └─────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  BOTTOM TAB BAR (height: 60pt + safeArea.bottom)                       │
│  [📊 Dashboard]   [👥 Members]   [🎯 CRM (Active)]   [⏱️ Attendance] [⋯] │
└────────────────────────────────────────────────────────────────────────┘
```

### 5C.1 Canonical Mobile Domain Navigation Architecture (Zero Flat Submodule Dumping — No Arbitrary Count Locks)

Primary mobile navigation destinations (Bottom Tab Bar items and Role Drawer items) MUST represent cohesive, high-level Business Domains (Tier 3 Domain Containers):
- **NO RIGID FIXED COUNT OR ARTIFICIAL CEILINGS:** Roles are **NOT** locked to any rigid count (neither 5, nor 6–10, nor any fixed count). A role contains as few or as many business domains as its authentic business aggregate roots require.
- **Physical Layout Distribution:** On mobile devices, the physical Bottom Tab Bar comfortably accommodates core primary domains (with additional domains accessible via the Role Drawer or a "More" domain hub), while all granular sub-modules reside inside domains and are accessed via Secondary Navigation.
- **Self-Evident Navigation Naming Invariant (Zero Mystery Buckets):** Navigation labels and domain folders MUST be 100% self-evident and descriptive. Anyone reading the tab/drawer title MUST know within 1 second exactly what capabilities exist inside without tapping. In multi-resource domains (e.g. Study Library / Co-working / Facility ERPs where Seats, Shifts, and Lockers are allocated together), use **Explicit Composite Domain Naming** (e.g., `admin_seat_shift_locker` → `"Seats, Shifts & Lockers"` with secondary tabs `[ Seats ] [ Shifts ] [ Lockers ]`). Vague umbrella names (`admin_facilities`, `admin_operations`, `admin_management`, `admin_resources`) are PERMANENTLY BANNED.
- **Extensibility:** New genuine business domains (e.g., `manager_pos`, `manager_nutrition`, `admin_seat_shift_locker`, `manager_marketing`) CAN be added whenever new business requirements emerge, provided they satisfy the Bounded Context Affinity rule and avoid generic junk-drawer names.
- **Sub-Module Granularity:** Inside each domain, there is no restriction on the number of autonomous sub-modules (mounted via secondary segmented tabs or stack screens).

#### Canonical Baseline Domain Matrix by Role (Mobile Native & Extensible):
1. **Manager Role (`frontend_manager`):**
   - 📊 **Dashboard** (`manager_dashboard`) — KPIs, Branch Snapshot, Quick Actions
   - 👥 **Members** (`manager_members`) — Directory, Subscriptions, Renewals
   - 🎯 **CRM** (`manager_crm`) — Enquiries, Leads, Sales Pipeline
   - ⏱️ **Attendance** (`manager_attendance`) — Daily Logs, Biometrics, History
   - 💰 **Accounting** (`manager_accounting`) — Assets, Ledgers, Maintenance
   - 📦 **Inventory** (`manager_inventory`) — Equipment, Supplements, Lockers
   - 👔 **Staff** (`manager_staff`) — Trainers, Roster, Payroll Summary
   - ⚙️ **Settings** (`manager_settings`) — Branch Profile, Operating Hours, Tax/GST

2. **Superadmin Role (`frontend_superadmin`):**
   - 📊 **Dashboard** (`superadmin_dashboard`) — Platform MRR, System Health
   - 🏢 **Tenants** (`superadmin_tenants`) — Gym Chains, Branch Onboarding
   - 💳 **Plans** (`superadmin_plans`) — SaaS Tiers, Feature Modules, Pricing
   - 💵 **Billing** (`superadmin_billing`) — Tenant Invoices, Payouts, Gateways
   - 📈 **Analytics** (`superadmin_analytics`) — Global Revenue, Churn, Retention
   - 🛡️ **Audit Logs** (`superadmin_audit`) — Security Trails, Admin Activity
   - ⚙️ **Settings** (`superadmin_settings`) — Platform Gateways, Master Admins

---

### 5C.2 Sub-Navigation Hierarchy: Two Approved Mobile Patterns

When a user taps a Domain Container from the Bottom Tab or Drawer (e.g. `CRM`), its autonomous sub-modules (`crm_enquiries`, `crm_leads`, `crm_pipeline`) MUST be accessed via one of these two approved patterns:

#### Pattern A: The Native Top Segmented Bar / Material Top Tabs (Canonical)
- **Mount Point:** Rendered by `Manager[Domain]Navigator.tsx` across the top of the screen directly beneath the safe-area header.
- **Visual Design:**
  - Container: `height: 44pt`, `backgroundColor: tokens.color.background`, `flexDirection: 'row'`, `paddingHorizontal: tokens.spacing.md`, `borderBottomWidth: 1`, `borderBottomColor: tokens.color.border`.
  - Active Segment: Pill background `tokens.color.primary` (`#FACC15`), label text `tokens.color.onPrimary` (`#111111`, font-weight: 600, font-size: 13pt), active slide spring animation (`spring-medium`).
  - Inactive Segment: Transparent background, label text `tokens.color.muted` (`#A1A1AA`), font-weight: 500.
  - Badge Count: Pill indicator with `backgroundColor: tokens.color.primarySubtle`, text `tokens.color.primaryText`, font-size: 11pt, bold.
- **Benefit:** Keeps the mobile bottom tabs focused while providing a swipeable, instant secondary workspace for the active business domain.

#### Pattern B: Domain Hub & Stack Screen Drilldown
- **Mount Point:** The domain navigator starts with `Manager[Domain]IndexScreen.tsx`.
- **Visual Design:**
  - Screen displays high-level operational metric cards and navigable list items leading to sub-modules via `navigation.navigate('SubmoduleScreen')`.
  - Cards use `backgroundColor: tokens.color.card`, `borderRadius: tokens.radius.lg`, with right chevron `lucide-react-native` (`ChevronRight`, 18pt, `tokens.color.muted`).
  - Tapping any card executes a native stack push animation (`duration-slow`).

---

### 5C.3 Action Presentation Layer (The Anti-Action Ban & Bottom Sheet Contract)

> ⛔ **STRICT BAN ON ACTION NANO-MODULES:**
> Forms, creation workflows, edit sheets, and filter modals MUST NEVER be made into sub-modules or primary navigation items (e.g., `crm_enquiry_add/`, `member_add/` are STRICTLY FORBIDDEN).
> They MUST live inside the owning sub-module's `components/` folder as `@gorhom/bottom-sheet` panels or child stack screens.

#### Canonical Action Bottom Sheet Specification (`@gorhom/bottom-sheet`):
- **Snap Points:** `['50%', '90%']` for creation/edit forms; `['40%']` for quick confirmation or filter sheets.
- **Surface Token:** `backgroundColor: tokens.color.card` (`#111111` dark / `#FFFFFF` light), `borderTopLeftRadius: tokens.radius.xl`, `borderTopRightRadius: tokens.radius.xl`.
- **Handle Indicator:** Centered pill, `width: 36`, `height: 4`, `borderRadius: 2`, `backgroundColor: tokens.color.border`.
- **Backdrop:** `tokens.color.overlay` (`rgba(0,0,0,0.7)`), tap outside dismisses sheet unless uncommitted dirty form state exists.
- **Header:** Title in `heading-sm` (bold, `tokens.color.foreground`), right close icon button `lucide-react-native` (`X`, 20pt, `tokens.color.muted`, hitSlop: 12).
- **Primary CTA:** Full-width button, `backgroundColor: tokens.color.primary`, text `tokens.color.onPrimary` (`#111111`, bold), height: 48pt (WCAG touch-target compliant).

---

### 5C.4 Mobile Navigation Visual Token Contract & States

To maintain the Luxury Premium Gold aesthetic across all mobile screens, navigation elements adhere to these exact token bindings:

| Navigation Element | State | Background Token | Border / Accent | Label / Text Token | Icon Token | Touch Feedback |
|---|---|---|---|---|---|---|
| **Bottom Tab Item** | Default / Inactive | `transparent` | `none` | `tokens.color.muted` (`#A1A1AA`) | `tokens.color.muted` (`#A1A1AA`) | `press-scale: 0.96` |
| **Bottom Tab Item** | Active / Selected | `transparent` | Top accent dot / pill in `tokens.color.primary` | `tokens.color.primary` (`#FACC15`) | `tokens.color.primary` (`#FACC15`) | Light Haptic Impact |
| **Drawer Nav Item** | Default / Inactive | `transparent` | `none` | `tokens.color.muted` (`#A1A1AA`) | `tokens.color.muted` (`#A1A1AA`) | `opacity: 0.7` |
| **Drawer Nav Item** | Active / Selected | `tokens.color.primarySubtle` | 3px left border `tokens.color.primary` | `tokens.color.foreground` (Weight: 600) | `tokens.color.primary` (`#FACC15`) | Light Haptic Impact |
| **Top Tab Segment** | Default / Inactive | `transparent` | `none` | `tokens.color.muted` (`#A1A1AA`) | `tokens.color.muted` | `press-scale: 0.96` |
| **Top Tab Segment** | Active / Selected | `tokens.color.primary` (`#FACC15`) | `border-radius: tokens.radius.full` | `tokens.color.onPrimary` (`#111111`, Bold) | `tokens.color.onPrimary` | Spring slide animation |
| **Floating Action Button** | Default | `tokens.color.primary` (`#FACC15`) | `shadow-xl` | — | `tokens.color.onPrimary` (`#111111`) | `press-scale: 0.92` + Light Haptic |

---

## 6. Touch Targets
`min-touch-target = 44` (iOS pt) / `48` (Android dp) — every tappable element
must meet this via minimum height/width or padding.

Do not use `tokens.layout.minTouchTargetIos` or `tokens.layout.minTouchTargetAndroid` directly inside feature UI.
Feature UI MUST use the central helper:
`src/core/theme/getMinTouchTarget.ts`

This helper returns the correct platform target (`44` on iOS, `48` on Android). This avoids repeated `Platform.OS` checks inside feature components.

## 7. Motion
- **Press configuration:** 
  - `press-scale = 0.96`
  - `spring-medium` = canonical React Native preset defined in the shared animation-config module. Feature UI MUST never define its own spring parameters.
- Standard screen-transition fade/slide: `duration-slow` (300ms) duration, ease-out curve.
- All presets centralized in one shared animation-config module — never
  redefined inline per screen.
- **`prefers-reduced-motion` compliance (mandatory):** Always check the OS
  reduced-motion setting before playing non-essential animations. Users with
  vestibular disorders or motion sensitivity configure this at the OS level.
  - React Native: `import { AccessibilityInfo } from 'react-native'` — use
    `AccessibilityInfo.isReduceMotionEnabled()` or the `useReduceMotion()` hook
    from `react-native-reanimated` to skip or shorten animations.

  - **Rule:** Any animation that is purely decorative (card press / active / focus lift, skeleton
    shimmer, screen transition) MUST be skipped or reduced to an instant
    state-change when reduced-motion is enabled. Functional animations (e.g.
    a spinner indicating in-progress work) may remain.

  - **Non-animated equivalents required:** Every animated state change MUST have a
    non-animated equivalent that communicates the same information without motion.
    Motion must NEVER be the sole indicator of a state change. Examples:
    - Loading: spinner → static "Loading..." label fallback when reduced-motion enabled
    - Success: checkmark flash → instant checkmark display (no animation)
    - Screen transition: slide → instant cross-fade or direct render
    - Bottom sheet: slide-up → instant appear
    - Skeleton shimmer: animated shimmer → static muted placeholder

  - **Test requirement:** Every animated component MUST be tested with `AccessibilityInfo.isReduceMotionEnabled()` returning `true` to confirm non-animated behavior works correctly.

### Motion Token Scale
All animation durations MUST use these named tokens — never arbitrary inline values:

| Token | Duration | Usage |
|---|---|---|
| `duration-fast` | 150ms | Micro-interactions: button press, checkbox toggle |
| `duration-base` | 200ms | Standard transitions: press / active / focus/press states, dropdown open |
| `duration-slow` | 300ms | Screen-level transitions: bottom sheet open, modal appear |
| `duration-xslow` | 500ms | Complex layout shifts: skeleton → content swap |

## 8. Status & Semantic Colors

Every status badge, label, and icon color MUST use these tokens — never raw hex
values inline. Global design defines only semantic visual meaning such as success, warning, danger, info, neutral, and purple.

| Token | Light | Dark |
|---|---|---|
| `status-success-text` | `#064E3B` | `#86EFAC` |
| `status-success-bg` | `#D1FAE5` | `#064E3B` |
| `status-warning-text` | `#92400E` | `#F59E0B` |
| `status-warning-bg` | `#FEF3C7` | `#451A03` |
| `status-danger-text` | `#7F1D1D` | `#FCA5A5` |
| `status-danger-bg` | `#FEE2E2` | `#450A0A` |
| `status-info-text` | `#1E3A8A` | `#93C5FD` |
| `status-info-bg` | `#DBEAFE` | `#1E3A5F` |
| `status-neutral-text` | `#3F3F46` | `#A1A1AA` |
| `status-neutral-bg` | `#F4F4F5` | `#1E1E2E` |
| `status-purple-text` | `#581C87` | `#C084FC` |
| `status-purple-bg` | `#F3E8FF` | `#3B0764` |

**Rule:** Each feature owns its own status-to-semantic-token mapping inside its feature folder (e.g., `/features/members/config/membersStatusConfig.ts`). Do NOT make global design responsible for feature business-status mapping (like `Active`, `Paid`, `Pending`).

## 8a. Payment Mode Color Tokens

Payment mode colors are separated from status colors to avoid visual collision. Keep payment visual tokens global, but do not put payment business logic or feature mappings in this file.

| Token | Light | Dark |
|---|---|---|
| `pay-cash-text` | `#0F766E` | `#5EEAD4` |
| `pay-cash-bg` | `#CCFBF1` | `#134E4A` |
| `pay-upi-text` | `#0E7490` | `#67E8F9` |
| `pay-upi-bg` | `#CFFAFE` | `#164E63` |
| `pay-card-text` | `#334155` | `#94A3B8` |
| `pay-card-bg` | `#F1F5F9` | `#1E293B` |
| `pay-bank-text` | `#0369A1` | `#7DD3FC` |
| `pay-bank-bg` | `#E0F2FE` | `#0C4A6E` |

## 9. Chart Palette
Series color order (applied consistently across every chart in the app). Charts in feature UI must consume only these semantic tokens.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `chart-primary` | `#EAB308` | `#FACC15` | Primary series (Gold — matches brand primary) |
| `chart-success` | `#16A34A` | `#4ADE80` | Positive series (Green) |
| `chart-warning` | `#F59E0B` | `#FBBF24` | Warning series (Amber) |
| `chart-danger` | `#DC2626` | `#F87171` | Negative series (Red) |
| `chart-info` | `#2563EB` | `#60A5FA` | Info series (Blue) |
| `chart-secondary` | `#7C3AED` | `#D8B4FE` | Secondary breakdown (Purple) |
| `chart-grid` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.05)` | Gridlines |
| `chart-tooltip-bg` | `#FFFFFF` | `#111111` | Tooltip backgrounds |

## 10. Elevation / Shadow

| Level | Effect (iOS-style shadow) | Effect (Android-style elevation) | Usage |
|---|---|---|---|
| `shadow-sm` | opacity 0.05, radius 2 | elevation 1 | Subtle card elevation |
| `shadow-md` | opacity 0.1, radius 6 | elevation 3 | Standard card, list item |
| `shadow-lg` | opacity 0.15, radius 12 | elevation 8 | Bottom sheet, modal |
| `shadow-xl` | opacity 0.2, radius 20 | elevation 16 | FAB, prominent overlays |

Shadow tokens must be implemented through a central `getShadowStyle(level)` helper (`src/core/theme/getShadowStyle.ts`).
Feature UI MUST NOT manually compose `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`, or `elevation`.

The helper resolves:
- iOS: complete native shadow style (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`)
- Android: `elevation` and any supported visual treatment

## 11. Core Semantic Color Usage (How to Apply Tokens — No Guessing)

Every color token has ONE canonical usage. Never apply a token outside its role.

| Token | Foreground (text/icon) | Background | Border |
|---|---|---|---|
| `primary` | Primary button fill, selected primary icon | Primary button fill | — |
| `destructive` | Destructive button fill, delete icon | Destructive button fill | Error input border |
| `muted` | Placeholder text, disabled label | — | Disabled input border |
| `foreground` | All body text | — | — |
| `background` | — | Screen root background | — |
| `card` | — | Card / surface / bottom sheet | — |
| `border` | — | — | Dividers, default input border |
| `on-*` | Text/icon over corresponding fill | — | — |
| `focus-ring` | — | — | Input/keyboard focus ring |
| `skeleton-*` | — | Skeleton shimmer effects | — |
| `status-*-text` | Status badge text | — | — |
| `status-*-bg` | — | Status badge background | — |
| `pay-*-text` | Payment badge text | — | — |
| `pay-*-bg` | — | Payment badge background | — |
| `chart-*` | Chart series data | Chart fill | Chart border |

**Rules:**
- Never use `primary` for body text.
- Never use `destructive` for error text (use `status-danger-text` instead).
- Never use `foreground` as a background.
- Token names describe intent, not appearance — they resolve differently in light vs dark mode.
- **CRITICAL: Solid Background Contrast** — If you use a solid background token (e.g., `primary`, `destructive`), you MUST pair it with the appropriate `on-*` contrasting text token. `on-primary` is `#111111` (dark text on gold), NOT white.

## 12. Form Interaction States (All 9 States — No Invented Colors)

Every input field (text, select, date picker) MUST support all applicable states.
Token values below are used for the input **border and label color** only.

| State | Border color token | Label color token | Notes |
|---|---|---|---|
| `default` | `border` | `muted` | Resting state |
| `focused` | `focus-ring` | `primary-text` | Active input — platform focus ring |
| `filled` | `border` | `foreground` | Has a value, not focused |
| `error` | `destructive` | `status-danger-text` | After validation failure |
| `success` | `status-success-text` | `status-success-text` | After successful validation |
| `disabled` | `border` (`opacity-disabled`) | `muted` (`opacity-disabled`) | Non-interactive |
| `read-only` | `border` (dashed) | `muted` | Displayed but not editable |
| `loading` | `border` | `muted` | Async options loading (e.g. remote select) |
| `warning` | `status-warning-text` | `status-warning-text` | Soft advisory — not a hard error |

Inline validation error messages appear **below** the field in `caption` typography, `status-danger-text` color.

## 13. Async / Content UI States (Mandatory — No Component is Exempt)

Every screen section that loads data MUST implement all applicable states.
No component may ship without its loading, empty, and error states.
Every state MUST be deterministically testable via the module's `mocks/scenarios/[role_module].scenarios.ts` presets.

| State | Canonical Scenario Key | When to show | Implementation |
|---|---|---|---|
| **Sunny Day / Populated** | `ACTIVE_RECORDS` | Normal list/detail render | Real fixture/backend response rendered via semantic tokens. |
| **Loading / skeleton** | `NETWORK_TIMEOUT` | Data fetch in progress | A skeleton component that mimics the exact layout of the real content. Use `skeleton-base` for shimmer base, `skeleton-highlight` for shimmer highlight. **Never a full-screen spinner for content areas** — spinner only for button-level actions. |
| **Empty** | `EMPTY_DATA` | Fetch succeeded, zero results (`data: []`) | A dedicated `[Feature]EmptyState` component with a contextual icon, a short human-readable message, and a primary CTA (e.g. "Add your first member"). Never a blank white screen. |
| **Error** | `SERVER_500_ERROR` | Fetch failed or network error (500) | A `[Feature]ErrorFallback` component showing a safe user-facing message, a "Try again" retry button, and optionally a help link. Use backend `response.message` only when the API contract explicitly guarantees that it is user-safe and localized for the active app locale. Otherwise show a feature-specific translated fallback through `t('...')`. Never expose raw Axios errors, JavaScript errors, stack traces, raw `error.message`, or unvalidated server text. |
| **Permission denied** | `UNAUTHORIZED_401` | User lacks role access to the resource (401/403) | A `[Feature]PermissionDenied` component explaining the access restriction. Never show a blank screen or a cryptic error code. |
| **Offline** | `NETWORK_TIMEOUT` | No network detected (if offline is a declared feature) | An inline `OfflineBanner` (not a full-screen takeover) with the last-cached data still visible. Only for features that explicitly declare offline support in `_features.md`. |
| **Offline Blocker** | `NETWORK_TIMEOUT` | No network AND feature has no cached data to show | A full-screen `[Feature]OfflineBlocker` component that blocks interaction and explains the feature requires connectivity. Use ONLY when the feature cannot function at all without network (e.g., payment processing). Never use `OfflineBlocker` for features that can show cached data — use `OfflineBanner` instead. |

## 14. Safe Area & Notch Handling

Mobile screens have physical obstructions (notch, Dynamic Island, home indicator, status bar).
Every screen MUST account for safe areas — never let interactive content sit under them.

- Screen roots MUST use `SafeAreaView` from `react-native-safe-area-context`.
- Bottom tab bars and FABs MUST account for bottom safe-area insets.
- Full-screen modals and bottom sheets MUST account for top safe-area insets.
- Never hardcode inset values.
- `useSafeAreaInsets()` MUST be used wherever explicit inset handling is required.
- Safe-area handling belongs at screen/container level, not inside reusable business components.

## 15. Z-Index / Elevation Stack

Define a named z-index scale so overlapping elements are never resolved with arbitrary numbers.

| Token | Value | Usage |
|---|---|---|
| `z-base` | 0 | Default screen content |
| `z-sticky` | 10 | Sticky list section headers |
| `z-fab` | 20 | Floating action button |
| `z-bottom-tab` | 30 | Bottom tab navigation bar |
| `z-bottom-sheet` | 40 | Bottom sheet / action sheet |
| `z-modal` | 50 | Modal dialogs |
| `z-toast` | 60 | Toast / snackbar notifications |
| `z-overlay` | 70 | Full-screen loading overlay |

**Rule:** Never use a raw z-index / elevation number outside this table.
If a new layer type is needed, extend this table — don't invent an arbitrary value inline.

## 16. Sensitive Data Masking — Visual Specification

Any field displaying sensitive personal or financial data MUST be masked by default
in list views, card components, and summary screens. Full values appear ONLY in
dedicated detail/profile screens.

| Data Type | Masked Display | Full Display (detail screen only) |
|---|---|---|
| Phone number | `98****2310` (first 2 + last 4) | `9876542310` |
| National ID / Aadhaar | `**** **** 2310` (last 4 only) | Full number |
| Bank account / card | `**** 2310` (last 4 only) | Full number |
| Payment amount (bulk list) | Summarized total only | Per-record amount |

**Token:** Masked text uses `muted` color token at `opacity-masked` — visually distinct
from real data without being invisible.

---

## 17. Confirmation Bottom Sheet — Visual Specification

### Layout
```
┌─────────────────────────────────────┐
│  ████  [Warning icon — destructive] │  ← icon color: `destructive` token
│  [Action Title — heading-sm, bold]  │
│  [Description — body-sm, muted]     │  ← must state if irreversible
│  [Detail context if needed]         │
├─────────────────────────────────────┤
│  [Cancel — ghost, full width]       │
│  [Confirm — destructive fill, fw]   │  ← disabled + spinner while in-flight
└─────────────────────────────────────┘
```

### Token Mapping
| Element | Token |
|---|---|
| Sheet background | `card` |
| Warning icon | `destructive` |
| Title | `foreground`, `heading-sm` |
| Description | `muted`, `body-sm` |
| Cancel button | `border` outline, `foreground` text |
| Confirm button | `destructive` fill, `on-destructive` text |
| Confirm (loading) | `destructive` fill, `Loader` spinner, `disabled` |

**Z-index:** `z-bottom-sheet` (40) from Section 15.

### Bottom Sheet Accessibility and Interaction Rules

Every bottom sheet must:
- Expose a meaningful accessible title via `accessibilityLabel` and `accessibilityRole="header"`.
- Provide an explicit accessible close/cancel action unless closure is intentionally blocked during in-flight mutations.
- Announce opening context to screen readers via `AccessibilityInfo.announceForAccessibility()`.
- Prevent interaction with obscured background content while visible (backdrop absorbs taps).
- Restore focus to the triggering control after dismissal where supported.
- Handle keyboard appearance for form sheets via keyboard-aware scroll wrappers.
- Avoid nested bottom sheets: close the parent before opening a replacement sheet.
- Disable duplicate confirmation presses while the mutation is pending (`disabled={isPending}`).
- Distinguish swipe-to-dismiss from confirmed destructive action (swipe dismiss = cancel).

---

## 18. Button Visual Hierarchy & Loading State

### General Button Visual Hierarchy

| Button Type | Visual Contract |
|---|---|
| Primary | `primary` fill + `on-primary` text |
| Secondary / Outlined | `border` outline + `foreground` text |
| Ghost | transparent fill + `foreground` text |
| Destructive | `destructive` fill + `on-destructive` text |
| Icon button | icon token + `min-touch-target` |
| Text button / link | `primary-text` |

### Loading Button State
When any button triggers an async action it MUST transition to a loading state immediately on tap. The button width MUST remain unchanged. The accessible label MUST remain available. Prefer showing the label with a spinner rather than removing the label. Prevent double submission.

| State | Visual |
|---|---|
| Default | Label text, `primary` fill |
| Loading | Label remains available; spinner MUST be shown beside the label, `Loader` icon `RN ActivityIndicator`, `disabled=true`, same fill color at `opacity-loading`, button `minWidth` locked to prevent layout shift |
| Success | **Conditional — context-sensitive only:** Brief checkmark flash (`duration-fast`) is used ONLY when ALL of the following are true: (1) the user remains on the same screen, (2) a visible completion state is meaningful to the user, (3) the operation has confirmed final completion (not eventual consistency), (4) the action is NOT destructive, (5) navigation does NOT immediately follow. Skip the checkmark for: immediate navigation after submit, destructive operations (deletion, suspension), background/long-running operations, and operations with eventual consistency where the server response doesn't confirm final state. |
| Error | Revert to default state — error shown in toast or inline field |

**Token:** Loading spinner uses `on-primary` / `on-destructive` on primary/destructive fill buttons.
Spinner size: `icon-sm`.

---

## 19. Theme Contract Cross-Reference

This file (`MOBILE_UI_UX_DESIGN.md`) serves two roles simultaneously:
1. **VALUES source** — it defines what every token is worth in light and dark mode (the tables above).
2. **AI-readable catalogue** — it lists every token name, value, and usage context in one scannable table that AI agents read before writing any styled component.

**Hierarchy:**
```
MOBILE_UI_UX_DESIGN.md   ← this file (values + catalogue)
       ↓
React Native theme module  ← implements the token values from this file
       ↓
Feature UI                 ← consumes semantic tokens ONLY; never hardcodes values
```

### Theme Implementation Model

The design document owns token names and light/dark values.

The application implementation must have three separate layers:

1. `tokenDefinitions.ts`
   - Stable token names and non-theme scales.
   - Spacing, typography, radius, durations, icon sizes, z-index, layout.

2. `lightTheme.ts` and `darkTheme.ts`
   - Each implements the complete `color` object using exactly the same keys.

3. `useThemeTokens()` / `ThemeProvider`
   - Resolves the active theme and exposes one typed `tokens` object to UI.

Feature UI MUST consume tokens through the theme resolver. It must not directly
branch on `isDarkMode` to choose colors.

Recommended structure under `src/core/theme/`:
```text
src/core/theme/
  tokenDefinitions.ts
  lightTheme.ts
  darkTheme.ts
  ThemeProvider.tsx
  useThemeTokens.ts
  getMinTouchTarget.ts
  getShadowStyle.ts
  animationConfig.ts
```

### CANONICAL ACTIVE TOKEN OBJECT SHAPE (LOCKED)

> ⛔ **AI AGENTS: ALL token property access in components MUST use EXACTLY this object shape. Never guess token names. If you write `theme.colors.primary` when the shape is `tokens.color.primary`, TypeScript will fail. Use this as your reference.**

```typescript
// This is a TypeScript contract shape, not a directly imported static theme object.
// src/core/theme/tokenDefinitions.ts defines stable scales and Tokens type.
// src/core/theme/useThemeTokens.ts returns the active light/dark Tokens value.

export interface Tokens {
  color: {
    // Core surfaces (Section 1)
    background:          string,
    foreground:          string,
    card:                string,
    cardElevated:        string,  // 'card-elevated'
    overlay:             string,
    popover:             string,
    primary:             string,
    primaryPressed:      string,  // 'primary-pressed'
    primarySubtle:       string,  // 'primary-subtle'
    primaryText:         string,  // 'primary-text'
    destructive:         string,
    border:              string,
    borderFocus:         string,  // 'border-focus'
    muted:               string,
    onPrimary:           string,  // 'on-primary' = #111111 (dark text on gold)
    onDestructive:       string,
    onSuccess:           string,
    onInfo:              string,
    onWarning:           string,  // 'on-warning' = #111111
    focusRing:           string,
    skeletonBase:        string,
    skeletonHighlight:   string,
    surfacePressed:      string,  // 'surface-pressed'
    overlayBackdrop:     string,  // 'overlay-backdrop'
    // Status tokens (Section 8)
    statusSuccessText:   string,
    statusSuccessBg:     string,
    statusWarningText:   string,
    statusWarningBg:     string,
    statusDangerText:    string,
    statusDangerBg:      string,
    statusInfoText:      string,
    statusInfoBg:        string,
    statusNeutralText:   string,
    statusNeutralBg:     string,
    statusPurpleText:    string,
    statusPurpleBg:      string,
    // Payment tokens (Section 8a)
    payCashText:         string,
    payCashBg:           string,
    payUpiText:          string,
    payUpiBg:            string,
    payCardText:         string,
    payCardBg:           string,
    payBankText:         string,
    payBankBg:           string,
    // Chart tokens (Section 9)
    chartPrimary:        string,
    chartSuccess:        string,
    chartWarning:        string,
    chartDanger:         string,
    chartInfo:           string,
    chartSecondary:      string,
    chartGrid:           string,
    chartTooltipBg:      string,
  },
  opacity: {
    disabled:  number,  // 0.5
    loading:   number,  // 0.7
    masked:    number,  // 0.8
  },
  space: {
    1: number,  // 4
    2: number,  // 8
    3: number,  // 12
    4: number,  // 16
    5: number,  // 20
    6: number,  // 24
    7: number,  // 32
    8: number,  // 40
    9: number,  // 48
  },
  typography: {
    caption:        { fontSize: 12, lineHeight: 18, letterSpacing: 0.5,  fontWeight: '400' as const },
    bodySm:         { fontSize: 14, lineHeight: 21, letterSpacing: 0,    fontWeight: '400' as const },
    body:           { fontSize: 16, lineHeight: 24, letterSpacing: 0,    fontWeight: '400' as const },
    headingSm:      { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' as const },
    headingLg:      { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' as const },
    kpi:            { fontSize: 28, lineHeight: 34, letterSpacing: -1,   fontWeight: '700' as const },
    labelUppercase: { fontSize: 11, lineHeight: 16, letterSpacing: 1,    fontWeight: '600' as const },
  },
  radius: {
    sm:   4,
    md:   8,
    lg:   12,
    xl:   16,
    full: 9999,
  },
  icon: {
    sm:     16,
    md:     20,
    lg:     24,
    stroke: 1.75,
  },
  layout: {
    buttonMinWidth:        120,
    minTouchTargetIos:      44,
    minTouchTargetAndroid:  48,
    headerHeight:           56,
    bottomTabHeight:        60,
    contentPadding:         16,
    cardPadding:            16,
    fabSize:                56,
  },
  duration: {
    fast:   150,
    base:   200,
    slow:   300,
    xslow:  500,
  },
  pressScale: 0.96,
  shadow: {
    sm: { opacity: 0.05, radius: 2,  elevation: 1 },
    md: { opacity: 0.1,  radius: 6,  elevation: 3 },
    lg: { opacity: 0.15, radius: 12, elevation: 8 },
    xl: { opacity: 0.2,  radius: 20, elevation: 16 },
  },
  zIndex: {
    base:        0,
    sticky:      10,
    fab:         20,
    bottomTab:   30,
    bottomSheet: 40,
    modal:       50,
    toast:       60,
    overlay:     70,
  },
}

// Usage in components:
// tokens.color.primary          ✅
// tokens.space[4]               ✅
// tokens.typography.headingSm   ✅
// tokens.zIndex.bottomSheet     ✅
// tokens.icon.sm                ✅
// tokens.layout.buttonMinWidth  ✅
// tokens.layout.headerHeight     ✅
// tokens.shadow.xl               ✅
// tokens.color.onPrimary         ✅  (= #111111 — dark text on gold)
```

Feature UI MUST access the active token value only through:

```ts
const tokens = useThemeTokens();
```

Feature UI MUST NOT import `lightTheme`, `darkTheme`, `tokenDefinitions`, or a
static `tokens` object directly. Those imports are restricted to `src/core/theme/`.

### Machine-Readable Token Authority & Sync

`MOBILE_UI_UX_DESIGN.md` is the canonical human-readable design specification.
`src/core/theme/tokenDefinitions.ts` is the executable machine-readable authority.
Both MUST remain synchronized through automated CI tooling.

A CI token-sync script compares:
- token property names and hierarchy;
- light and dark value pairs;
- deprecated token aliases;
- WCAG AA contrast compliance (4.5:1 for normal text, 3:1 for large text/icons).

### Theme Consumption Performance Rule

Feature UI MUST obtain tokens through `useThemeTokens()`.

For render-heavy components:
- token-dependent StyleSheet creation MUST be memoized via `useMemo(() => StyleSheet.create({...}), [tokens])`;
- list item components (e.g. inside `FlashList`) MUST avoid recreating style objects on every render;
- memoization MUST NOT bypass dynamic theme switching;
- static token imports remain strictly forbidden outside `src/core/theme/`.

**Workflow rule (when a new token is needed):**
1. Add the token to THIS file first — with light + dark values and a usage description.
2. Implement it in the React Native theme module (Rule 3).
3. List it in the owning feature's `[featureName]_theme_contract.md` (Rule 52A).
4. AI agents writing components MUST reference THIS document to pick token names — never guess a token name or hardcode a value from memory.


**Token categories that MUST be explicitly declared in the React Native theme module:**
- Color tokens (Section 1)
- Status text/background tokens (Section 8)
- Payment text/background tokens (Section 8a)
- Spacing tokens (Section 2)
- Typography line-height tokens (Section 3)
- Typography letter-spacing tokens (Section 3)
- Border radius tokens (Section 4)
- Layout tokens (Section 5A)
- Icon size tokens (Section 5B)
- Touch target tokens (Section 6)
- Motion duration tokens (Section 7)
- Press-scale/spring tokens (Section 7)
- Opacity tokens (Section 1)
- Skeleton tokens (Section 1)
- Elevation/shadow tokens (Section 10)
- Z-index/elevation stack (Section 15)

**CI Check Requirements (Mandatory Sync & Enforcements):**
CI MUST fail when:
- the React Native theme implementation references an unknown token;
- a required Light/Dark token pair is incomplete;
- token values are out of sync with the theme module;
- deprecated tokens are used;
- defined text/background semantic pairs fail WCAG AA contrast requirements;
- interactive controls fail the required minimum touch-target size (44pt/48dp);
- any screen component introduces a raw visual design value for color, spacing,
  typography, radius, icon size, touch target, shadow, opacity, duration,
  z-index, or elevation without using an approved token or a documented
  `// design-exception:`.

Structural React Native values are permitted where they are not visual design
choices, including Flexbox control values, Boolean props, semantic native props,
`StyleSheet.hairlineWidth`, and documented runtime/native-library requirements.

**Token Validation Tooling (Required):**
A token-sync script MUST be included in the CI pipeline that:
1. Reads the theme module and verifies every token name maps to a value defined in this file.
2. Verifies every Light/Dark token pair is complete (no orphaned light-only or dark-only tokens).
3. Verifies no deprecated token names appear anywhere in the codebase.
4. Verifies all semantic text/background pairs meet WCAG AA contrast (4.5:1 for normal text).
5. Verifies all interactive control sizes meet the minimum 44pt/48dp touch target.

This script runs on every PR and blocks merge on failure.

---

## 20. Premium Native Micro-Interactions (The WOW Factor)

To ensure the application feels like a world-class, premium native app, **every developer and AI agent MUST adhere to these interaction details:**

1. **Universal Micro-Animations:** Use the motion tokens (Section 7) universally. Press states MUST scale down slightly (`press-scale = 0.96`). Bottom sheets MUST slide in smoothly. **Reduced-Motion Compliance:** Always respect the OS-level reduced-motion preference as strictly outlined in Section 7. Remove non-essential motion and never use animation as the sole indicator of a state change.
2. **Haptic Feedback:** Pair visual feedback with tactile feedback.

Haptic feedback is a progressive enhancement, not a mandatory response to every
tap or navigation event.

Use haptics only for meaningful state transitions such as:
- successful submit, confirmation, or completion;
- destructive action confirmation;
- validation failure or blocked action;
- selection/toggle state change where tactile confirmation adds value.

Do NOT use haptics for:
- ordinary navigation;
- list scrolling;
- passive card presses;
- automatic refreshes;
- repeated rendering;
- background sync;
- automatic retries.

Haptic failure or unsupported-device behavior MUST safely no-op and MUST NOT
delay, block, or change the user action.

   - **Light Impact:** Minor UI changes (switches, dropdown toggles).
   - **Success Notification:** Completing a wizard, saving a form, processing payment.
   - **Error Notification:** Destructive actions, or when validation fails.
3. **Custom Scroll/Pull-to-Refresh:** Use native refresh controls tinted with the `primary` token.

### Haptic Failure Safety & Progressive Enhancement

Haptic feedback is a progressive enhancement:
- A haptic failure MUST NOT block navigation, submit, mutation, or UI state changes.
- Haptics must be triggered through one central adapter (`src/core/interaction/haptics.ts`).
- The adapter must safely no-op when unsupported, disabled by user preference, or unavailable.
- Haptics must not fire repeatedly during rapid re-renders, list scrolling, or automatic retries.

**Haptic Hierarchy (Prevent UI Fatigue):**
- Primary user action (wizard complete, primary submit) → clear visual pending state + haptic notification.
- Minor toggle / switch → light impact haptic.
- Error → visual text/icon first, haptic notification second.
- Background refresh / pull-to-refresh completion → NO haptic.
- Auto-updating dashboard / KPI chart → NO haptic.
- Repeated list rows / cards tap → subtle press scale (0.96) only, NO haptic.

---

## 21. Platform Convention Guidance (iOS & Android)

Mobile users expect familiar native behavior. UI that ignores platform conventions feels foreign and reduces trust. The following platform-specific behaviors MUST be respected:

### Navigation
| Convention | iOS | Android |
|---|---|---|
| Back navigation | Swipe-right gesture (native stack) + back button in nav bar | Hardware/software back button + swipe-right |
| Gesture navigation | Always use `react-navigation` native stack — never block gestures | React Navigation default hardware/software back behavior MUST work correctly. Use a custom `BackHandler` only for documented interception cases such as a dirty form, active selection mode, or an open sheet/modal. Never register a custom back handler on ordinary stack screens. |
| Confirmation before back | Show a bottom sheet confirmation when the user tries to go back from a dirty (unsaved) form | Same behavior |

### Android Back Interception Safety

When a custom Android `BackHandler` is required:

- It MUST be registered only while the interception state is active.
- It MUST be removed during cleanup/unmount.
- First back press behavior, repeated back press, sheet/modal dismissal, and
  app-root behavior MUST be tested.
- A custom handler MUST NOT block React Navigation's normal stack pop unless a
  documented unsaved-change or critical-flow reason exists.

### Safe Area & Status Bar


### Bottom Sheets & Action Sheets
- Use bottom sheets (slide-up panels) for contextual actions, not full modals. Bottom sheets feel native on both platforms.
- Use `@gorhom/bottom-sheet` or the project-approved equivalent — never build a custom bottom-sheet from scratch without documented approval.
- iOS: Action sheets for simple choices (3 or fewer options). Bottom sheet for richer content.
- Android: Bottom sheets for all contextual selection.

### Date & Time Pickers
- Use platform-native date/time pickers via `@react-native-community/datetimepicker`.
- Never use a custom HTML-style date picker in a native mobile context.
- Present date pickers in a bottom sheet on Android (system default) and as an inline or modal picker on iOS (context-dependent).

### Haptics
- Pair significant UI state changes with appropriate haptic feedback using `react-native-haptic-feedback` (NOT expo-haptics):
  - Light impact — minor UI interactions (tab switch, toggle)
  - Success notification — form submit, payment success
  - Error notification — validation failure, destructive action
- Never trigger haptics for purely visual/decorative events.

### Permissions Prompts
- Always request permissions with `react-native-permissions` at the time of use, never at app launch.
- Always provide a clear in-app explanation of WHY the permission is needed before the system dialog appears.
- Handle denied permissions gracefully: show an informational UI with a link to Settings — never crash or show a blank screen.

### Icons
- Use `lucide-react-native` as the canonical icon library — 100% symmetry with the Web app's `lucide-react`. Never mix icon families within the same screen.
- iOS uses SF Symbols conventions for system-level actions (share, compose). Android uses Material Design icon conventions for system-level actions.
- Always pair icon-only controls with `accessibilityLabel`.

### Status Bar
- Status bar style MUST be set per-screen using React Native's built-in `StatusBar` component. Never hardcode a single global style.
- Full-screen modals MUST account for top safe area inset.
- Bottom tab bars MUST account for home indicator safe area.
- Use `react-native-safe-area-context` `<SafeAreaView>` at screen roots. Never hardcode inset values.

---

## 22. DEFINITION OF DONE — Mobile UI/UX Release Checklist

> ⛔ **RELEASE CRITERIA & SOURCE DELIVERY MANDATE:**
> **Every item MUST be verified against actual code with file and line evidence. Record `NON_COMPLIANT` for any failure in audit.**
> **In Repair Mode:** If any code defect is found, repair the code. Once all fixable source-level code is implemented, package and deliver the ZIP.
> Packaging is mandatory only when archive-generation capability is available.
> Otherwise, apply the Capability-Truth Delivery Rule and report `SOURCE_COMPLETE_ARTIFACT_PENDING_HOST_PACKAGING`.
>
> This requirement is subject to the Capability-Truth Delivery Rule. If archive generation
> is unavailable, the AI MUST report SOURCE_COMPLETE_ARTIFACT_PENDING_HOST_PACKAGING
> and MUST NOT claim that a ZIP was generated.
>
> **Dynamic/runtime verification steps (`DEFERRED_TO_HOST_RUNTIME`) do NOT trigger `BLOCKED_RELEASE` and must never prevent delivering the repaired source.**

### 1. Functional Completeness Gate
- [ ] **End-to-End User Flows:** All documented user flows work end-to-end with verified navigation transitions. — *STOP if broken navigation or orphaned screen.*
- [ ] **Validation & Error States:** All form validations and error states trigger correctly with field-level feedback. — *STOP if generic error toast replaces field errors.*
- [ ] **Authoritative Data Rendering:** All API-driven data renders from real fixture or backend response. — *STOP if hardcoded mock data remains in production paths.*
- [ ] **Mutation Feedback:** All mutations show correct success/error feedback via non-blocking toasts/alerts with stable `dedupKey`. — *STOP if mutation completes without visual feedback or duplicate toasts stack.*
- [ ] **Null & Undefined Safe-Fallbacks:** Every nullable or optional field in lists, cards, and profiles uses `displayValue(val, '—')`. — *STOP if raw 'null', 'undefined', or blank cell rendered.*
- [ ] **Debounced Search Inputs:** All search and rapid filter inputs debounced by ≥ 300ms. — *STOP if API triggers on every keystroke.*

### 2. State Coverage Gate (Section 13)
- [ ] **Loading / Skeleton State:** Mimics exact layout of real content (`[Feature]Skeleton.tsx`); never a full-screen spinner. — *STOP if full-screen spinner used.*
- [ ] **Empty State:** `[Feature]EmptyState.tsx` rendered with icon, message, and CTA where applicable. — *STOP if blank screen shown on empty list.*
- [ ] **Error State:** `[Feature]ErrorFallback.tsx` rendered with retry button and user-friendly message. — *STOP if raw JavaScript exception shown to user.*
- [ ] **Large List Virtualization:** Any collection with potential > 50 items uses `FlashList` or optimized `FlatList` with `windowSize={5}`. — *STOP if plain ScrollView or un-virtualized View used.*
- [ ] **Permission Denied State:** `[Feature]PermissionDenied.tsx` rendered with clear rationale and settings deep link. — *STOP if feature silently fails when permission denied.*
- [ ] **Offline State:** Non-blocking banner displayed if feature declares offline support. — *STOP if app crashes or locks up when offline.*
- [ ] **Mock Scenario Validation:** All 5 canonical scenarios (`ACTIVE_RECORDS`, `EMPTY_DATA`, `SERVER_500_ERROR`, `NETWORK_TIMEOUT`, `UNAUTHORIZED_401`) validated against the UI using the standalone `bootstrap.ts` harness. — *STOP if any scenario fails to render or crashes.*

### 3. Accessibility Gate (Section 1C)
- [ ] **Interactive Labels:** All interactive elements have meaningful `accessibilityLabel` strings. — *STOP if icon-only button lacks accessibility label.*
- [ ] **Accessibility Roles:** `accessibilityRole` set correctly on all interactive controls (button, header, link, search). — *STOP if generic view used for interactive element.*
- [ ] **Accessibility States:** `accessibilityState` reflects current state (disabled, selected, busy, checked). — *STOP if disabled button fails to declare disabled state.*
- [ ] **Reading Order:** Logical traversal order matches visual reading order across all screen sizes. — *STOP if screen reader navigates elements out of logical order.*
- [ ] **Touch Target Ceilings:** All touch targets ≥ 44pt (iOS) / 48dp (Android); `hitSlop` applied where visual size is smaller. — *STOP if interactive target < 44pt/48dp.*
- [ ] **Dynamic Type Scaling:** Dynamic Type tested at largest accessibility size without text truncation. — *STOP if text clips or overflows container.*
- [ ] **Reduced Motion:** Reduced-motion behavior verified; non-animated transitions work when enabled. — *STOP if animation triggers despite reduced-motion preference.*
- [ ] **Async Announcements:** Error and success states are announced using the appropriate platform mechanism—`accessibilityLiveRegion` on Android and `AccessibilityInfo.announceForAccessibility` on iOS. — *STOP if critical alert omitted from screen reader.*
- [ ] **Non-Color State Differentiation:** Color is never the sole state differentiator; paired with text or icon. — *STOP if state distinguished only by red/green color.*

### 4. Design System Compliance Gate
- [ ] **Zero Magic Values:** No raw hex/RGB/arbitrary values in any component (Section 1 — Global Token Rule). — *STOP if raw color string or arbitrary number in StyleSheet.*
- [ ] **Documented Exceptions:** All runtime-derived exceptions documented with `// design-exception: <reason>`. — *STOP if undocumented raw value found.*
- [ ] **Typography Tokens:** Typography uses token values from Section 3 (exact numeric `fontSize`, `lineHeight`). — *STOP if ad-hoc font size declared.*
- [ ] **Motion Tokens:** All animations use motion token durations from Section 7. — *STOP if hardcoded millisecond duration used.*
- [ ] **Named Z-Index:** Z-index uses named tokens from Section 15. — *STOP if arbitrary zIndex value used.*

### 5. Platform Conventions Gate (Section 21)
- [ ] **Back Navigation:** Back navigation works correctly on both iOS (native swipe) and Android (hardware back). — *STOP if Android back button exits app unexpectedly.*
- [ ] **Safe Area Handling:** Safe area insets handled at screen root via `SafeAreaView` / `useSafeAreaInsets()`. — *STOP if content clips notch, dynamic island, or home bar.*
- [ ] **Status Bar Styling:** Status bar style set per-screen (light/dark content) matching background contrast. — *STOP if white status icons on white background.*
- [ ] **Native Pickers & Sheets:** Platform-native date/time pickers and bottom sheets (`@gorhom/bottom-sheet`) used. — *STOP if custom web select dropdown used.*
- [ ] **Haptic Feedback:** Haptic feedback paired with significant state changes (switches, submissions, deletes). — *STOP if major action lacks haptic tactile response.*
- [ ] **Just-In-Time Permissions:** Permission prompts requested at time of use with clear in-app rationale. — *STOP if permission requested on app launch.*

### 6. Security & Token Sync Gate
- [ ] **Sensitive Data Masking:** Sensitive data masked per Section 16 rules in all list and card views. — *STOP if unmasked PII displayed.*
- [ ] **Zero PII in Telemetry:** No PII in error monitoring or analytics payloads. — *STOP if user emails or tokens logged.*
- [ ] **Server-Enforced Auth:** Frontend permission checks are UX controls only; server auth enforced for all endpoints. — *STOP if frontend assumes bypass.*
- [ ] **Token Sync CI Check:** Token-sync CI script passes (no unknown tokens, no missing dark/light pairs). — *STOP if orphan token found.*
- [ ] **WCAG AA Contrast:** All semantic text/background pairs pass WCAG AA contrast check (4.5:1 minimum). — *STOP if contrast ratio fails WCAG AA.*

### 7. Documentation & Testing Gate
- [ ] **Sub-Module Theme Contract Artifact:** `[role]_[submodule]_theme_contract.md` lists all consumed tokens for this sub-module. — *STOP if theme contract missing or empty.*
- [ ] **Sub-Module Feature Spec Sync:** `[role]_[submodule]_features.md` updated with all 22 canonical sections (including Section 20 Standalone Harness). — *STOP if features doc out of sync.*
- [ ] **Sub-Module Forbidden Patterns:** `[role]_[submodule]_forbidden.md` present with zero cross-submodule imports and parent shared folder ban. — *STOP if forbidden patterns missing or generic.*
- [ ] **Behavioral Tests:** Component and hook tests verify real user actions (tap -> submit -> visible state update). — *STOP if tests only check shallow renders.*
- [ ] **Maestro E2E Flows:** E2E tests verify critical mobile flows (login, CRUD, permissions). — *STOP if critical user journey lacks E2E coverage.*
