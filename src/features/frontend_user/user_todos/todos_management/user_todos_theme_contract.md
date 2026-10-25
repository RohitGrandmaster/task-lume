# Theme Contract: User Todos Management (`user_todos_todos_management`)

## Consumed Design Tokens

### Color Tokens
- `tokens.color.background` — Screen background
- `tokens.color.foreground` — Primary typography & headings
- `tokens.color.card` — Todo card surface
- `tokens.color.cardElevated` — Input field background & elevated action cards
- `tokens.color.primary` — Primary FAB, active category pills, action buttons
- `tokens.color.primarySubtle` — Selected filter tab background
- `tokens.color.onPrimary` — Text on primary gold fills (`#111111`)
- `tokens.color.border` — Card dividers & input outlines
- `tokens.color.borderFocus` — Focused input ring
- `tokens.color.muted` — Secondary timestamps & helper text
- `tokens.color.destructive` — Delete actions & trash badge
- `tokens.color.statusDangerText` / `statusDangerBg` — High priority badges
- `tokens.color.statusWarningText` / `statusWarningBg` — Medium priority badges
- `tokens.color.statusSuccessText` / `statusSuccessBg` — Low priority badges
- `tokens.color.skeletonBase` / `skeletonHighlight` — Skeleton shimmer

### Layout & Spacing Tokens
- `tokens.space[2]` (8), `tokens.space[3]` (12), `tokens.space[4]` (16), `tokens.space[5]` (20), `tokens.space[6]` (24)
- `tokens.radius.sm` (4), `tokens.radius.md` (8), `tokens.radius.lg` (12), `tokens.radius.full` (9999)
- `tokens.layout.minTouchTargetIos` (44) / `minTouchTargetAndroid` (48) via `getMinTouchTarget()`
- `tokens.layout.fabSize` (56)
