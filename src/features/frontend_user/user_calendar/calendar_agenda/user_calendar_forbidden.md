# Forbidden Patterns: User Calendar Agenda (`user_calendar_calendar_agenda`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business models or components from sibling sub-modules.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` barrels.
3. **Zero Magic Values:**
   - Selected date highlights and grid cells MUST use semantic theme tokens (`tokens.color.primary`, `tokens.color.card`).
4. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
