# Forbidden Patterns: User Reminders Active (`user_reminders_reminders_active`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business models or components from sibling sub-modules.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` barrels.
3. **Zero Magic Values:**
   - Snooze modal and reminder cards MUST use semantic theme tokens.
4. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
