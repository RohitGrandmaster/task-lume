# Forbidden Patterns: User Todos Management (`user_todos_todos_management`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business components, models, or state from `user_pomodoro`, `user_voice`, `user_overview`, or `user_settings`.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` or `index.js` barrels inside this sub-module. All imports must be direct paths.
3. **Zero Magic Values:**
   - MUST NOT write inline hex colors (`#FF0000`), raw dp sizes, or arbitrary z-index values. All visuals must resolve through `useThemeTokens()`.
4. **Zero Single-Tap Permanent Deletions:**
   - Permanent trash purge or record deletion MUST use double confirmation (`ConfirmModal` or bottom sheet).
5. **Zero Full-Screen Spinners for Lists:**
   - Content loading MUST use `UserTodosSkeleton.tsx`.
6. **Zero Blank Screens on Empty Data:**
   - Must render `UserTodosEmptyState.tsx` when list is empty.
7. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
