# Sub-Module Forbidden Patterns: User Settings & Profile (`user_settings_profile_forbidden.md`)

> **MANDATORY ENFORCEMENT DIRECTIVE (RULE 29 & RULE 28):**
> Every developer and AI assistant working on `user_settings/settings_profile` MUST adhere to the following negative constraints. Violations constitute immediate architectural failure.

1. **NEVER import from any sibling sub-module:**
   - `user_settings/settings_profile` MUST NOT import components, hooks, stores, or utilities from any other feature (e.g. `user_todos`, `user_overview`, `user_pomodoro`, `user_reminders`, `user_calendar`, `user_voice`, `user_settings`).
   - Sibling imports violate Rule 28 (Strict WET Principle). If logic is needed, duplicate locally inside `user_settings/settings_profile`.

2. **NEVER create or import from parent shared folders:**
   - Folders like `user_settings/common/` or `frontend_user/shared/` are strictly FORBIDDEN.
   - All components, hooks, schemas, and state must reside in their canonical autonomous sub-module directories.

3. **NEVER use raw hex or RGB colors:**
   - Inline hex strings (e.g. `#FF0000`, `#FFFFFF`) and `rgb()` values are strictly FORBIDDEN in StyleSheets.
   - All colors must resolve from `useThemeTokens()` (e.g. `tokens.colors.background`, `tokens.colors.primary`).

4. **NEVER hardcode numeric spacing or font sizes:**
   - Arbitrary pixel values for margins, padding, fontSize, or borderRadius are strictly FORBIDDEN.
   - Consume tokens from `tokens.space[*]`, `tokens.typography.*`, and `tokens.radius.*`.

5. **NEVER use AsyncStorage for auth credentials or PINs:**
   - Unencrypted `AsyncStorage` is strictly FORBIDDEN for tokens or security keys (Rule 6).
   - Use `react-native-keychain` / Keystore hardware-backed secure storage.

6. **NEVER execute single-tap permanent deletions:**
   - Single-tap destructive actions are strictly FORBIDDEN (Rule 31).
   - Destructive operations MUST require a confirmation bottom sheet or modal explaining the permanent consequences.

7. **NEVER render raw 'null', 'undefined', or blank data:**
   - Nullable fields must be wrapped with `displayValue(value, '—')` to ensure en-dash fallback (Rule 38).

8. **NEVER exceed file size ceilings:**
   - Screens in `screens/` MUST NOT exceed 80 lines (zero exceptions).
   - Components in `components/` MUST NOT exceed 200 lines.
   - Hooks in `hooks/` MUST NOT exceed 150 lines.
   - State stores in `state/` MUST NOT exceed 180 lines.
