# Sub-Module Theme Contract: User Overview Dashboard (`user_overview_theme_contract.md`)

> **CANONICAL VISUAL CONTRACT (MOBILE_UI_UX_DESIGN.md):**
> This autonomous sub-module consumes the following Luxury Premium Gold design tokens exclusively via `useThemeTokens()`. No ad-hoc or unlisted tokens are permitted.

## Consumed Color Tokens
| Token Key | Design System Role | Sub-Module Usage Context |
|---|---|---|
| `tokens.colors.background` | Primary App Canvas | Screen root container and safe area background |
| `tokens.colors.card` | Surface Card Background | Task cards, stats boxes, modal panels, sheets |
| `tokens.colors.cardElevated` | Elevated Layer Surface | Popovers, active dropdowns, floating action menus |
| `tokens.colors.foreground` | High-Contrast Typography | Main headers, task titles, active metric numbers |
| `tokens.colors.muted` | Secondary Typography | Timestamps, subtitles, helper labels, empty messages |
| `tokens.colors.border` | Subtle Divider Line | Card outlines, row separators, bottom sheet borders |
| `tokens.colors.primary` | Luxury Metallic Gold | Active state pills, checkboxes, submit buttons, FAB |
| `tokens.colors.primaryPressed` | Deep Amber Gold | Button active/pressed touch feedback |
| `tokens.colors.primarySubtle` | Soft Gold Shimmer Tint | Selected filter pill background, badge tint |
| `tokens.colors.destructive` | Crimson Alert | Delete buttons, overdue flags, error messages |
| `tokens.colors.skeletonBase` | Shimmer Base Layer | Skeleton loading placeholder background |
| `tokens.colors.skeletonHighlight` | Shimmer Animated Sweep | Skeleton sweep animation gradient |

## Consumed Typography Tokens
| Token Key | Scale / Line Height | Usage Context |
|---|---|---|
| `tokens.typography.h1` | 28pt / 34pt | Primary screen headers |
| `tokens.typography.h2` | 22pt / 28pt | Section titles and modal headings |
| `tokens.typography.body` | 16pt / 22pt | Task card titles, form inputs, settings options |
| `tokens.typography.caption` | 13pt / 18pt | Timestamps, category pills, subtitle labels |

## Consumed Spacing & Radius Tokens
| Token Key | Value (dp) | Usage Context |
|---|---|---|
| `tokens.space[2]` | 8dp | Compact gap between icon and label |
| `tokens.space[3]` | 12dp | Padding inside pills and input fields |
| `tokens.space[4]` | 16dp | Standard card padding and container horizontal inset |
| `tokens.space[6]` | 24dp | Vertical spacing between sections |
| `tokens.radius.sm` | 6dp | Small tag / badge corner rounding |
| `tokens.radius.md` | 10dp | Card and input container corner radius |
| `tokens.radius.lg` | 16dp | Modal bottom sheet and dialog corner radius |
| `tokens.radius.full` | 9999dp | Pill filters, avatar circles, circular FAB |

## Touch Target Compliance
- All interactive controls enforce a minimum hit area of 44×44pt on iOS and 48×48dp on Android via `getMinTouchTarget()` or `hitSlop`.
