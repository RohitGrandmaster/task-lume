# Forbidden Patterns: User Overview Dashboard (`user_overview_overview_dashboard`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business models or components from sibling sub-modules.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` barrels.
3. **Zero Magic Values:**
   - MUST NOT write inline hex colors for charts or cards. All chart series colors MUST use `tokens.color.chart*` tokens.
4. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
