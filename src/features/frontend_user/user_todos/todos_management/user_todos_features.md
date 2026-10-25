# Sub-Module Feature Specification: User Todos Management (`user_todos_todos_management`)

## 1. Scope and Non-Scope
- **Role:** User (`frontend_user`)
- **Domain:** `user_todos`
- **Sub-module:** `todos_management`
- **Scope:** Task creation, list management, completion toggle, priorities (High/Medium/Low), due dates, recurrence rules, custom categories, soft deletion to trash, and favorites.
- **Non-Scope:** Audio recording (owned by `user_voice`), Pomodoro timer execution (owned by `user_pomodoro`), App lock PIN credentials (owned by `user_settings`).

## 2. Screen Inventory & Component Responsibility Map
- `UserTodosHomeScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosHomeMainView`.
- `UserTodosAddScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosAddMainView`.
- `UserTodosEditScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosEditMainView`.
- `UserTodosDetailScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosDetailMainView`.
- `UserTodosTrashScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosTrashMainView`.
- `UserTodosFavoritesScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosFavoritesMainView`.
- `UserTodosCategoriesScreen.tsx`: Thin screen (≤80 lines) composing `UserTodosCategoriesMainView`.
- Components:
  - `UserTodosTodoCard.tsx`: Task card with priority pill, checkbox, favorite star, hitSlop touch target.
  - `UserTodosTodoList.tsx`: Virtualized list with pull-to-refresh and empty state.
  - `UserTodosTodoForm.tsx`: Form fields with validation feedback.
  - `UserTodosSkeleton.tsx`: Layout-mimicking shimmer loading state.
  - `UserTodosEmptyState.tsx`: Contextual icon, message, and CTA.
  - `UserTodosErrorFallback.tsx`: Error state with retry action.

## 3. Navigation Contract & User Flows
- Home -> Tap Task -> Detail Screen (`USER_TODOS_ROUTES.DETAIL`)
- Home -> Tap FAB -> Add Task Screen (`USER_TODOS_ROUTES.ADD`)
- Detail -> Tap Edit -> Edit Task Screen (`USER_TODOS_ROUTES.EDIT`)
- Drawer / Tab -> Categories / Trash / Starred

## 4. API Contract & UI Data Requirements
- Task entity properties: `id`, `title`, `description`, `category`, `priority`, `dueDate`, `completed`, `favorite`, `pinned`, `deleted`.

## 5. Query Key Registry & Server State
- Resource identity: `['user', 'todos']`

## 6. Mutation Inventory & Lifecycle Operations
- Create task, update task, toggle completion, toggle favorite, soft-delete, restore from trash, permanent delete (requires double-confirmation bottom sheet).

## 7. Permissions and Role Rules
- User authenticated context.

## 8. State Ownership & Architecture Flow
- Local persistence via `storage.js` with optimistic UI for instant checkoff and pessimistic double verification for permanent deletion.

## 9. Offline, Loading, Empty, and Error States
- Fully offline-capable local storage.
- Loading skeleton mimics card layout (`UserTodosSkeleton.tsx`).
- Empty state rendered when 0 records match active filter (`UserTodosEmptyState.tsx`).

## 10. Security and PII Rules
- Zero credentials stored in task descriptions; sensitive data masking where applicable.

## 11. Accessibility Requirements (A11y)
- All interactive controls have min touch targets (44pt iOS / 48dp Android) via `getMinTouchTarget()`.
- Every checkbox and button has explicit `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`.
- Dynamic type supported (`allowFontScaling={true}`).

## 12. Background Tasks & Realtime Events
- Due date reminder scheduling via `notifee`.

## 13. Feature Flags & Tenant Settings
- Single tenant user mode.

## 14. Cache Invalidation & Consistency
- Immediate task list update on mutation.

## 15. Migration, Rollback & Edge Cases
- Expired trash automatically purged after retention window.

## 16. Test Coverage Map & Quality Gates
- Component render tests, filter toggle tests, task completion tests.

## 17. Architecture Exceptions (ADRs)
- None.

## 18. Known Contract Gaps & Bug Log
- None.

## 19. Rule Compliance Checklist
- [x] Canonical role prefix (`frontend_user`)
- [x] Thin screen composition (≤80 lines)
- [x] Zero cross-feature imports (Rule 28)
- [x] Luxury Premium Gold theme tokens (Rule 52)
- [x] Touch target minimums (Rule 6)

## 20. Standalone Run, Mock & Test Harness
- Sub-module can be mounted with local mock seeders for isolated preview.

## 21. Module Portability & Host Integration Guide
- Mount `UserTodosHomeScreen` directly in parent stack navigator without sibling business dependencies.

## 22. Deliverables & Version History
- Version: 1.0.0 (Portability Score: 8/8)
