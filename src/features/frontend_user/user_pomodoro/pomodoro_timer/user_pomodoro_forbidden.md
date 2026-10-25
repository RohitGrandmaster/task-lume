# Forbidden Patterns: User Pomodoro Timer (`user_pomodoro_pomodoro_timer`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business models or components from sibling sub-modules.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` barrels.
3. **Zero Magic Values:**
   - MUST NOT write inline hex colors. Timer ring and active chips MUST use semantic theme tokens.
4. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
