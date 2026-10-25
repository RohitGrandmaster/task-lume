# Forbidden Patterns: User Settings Profile (`user_settings_settings_profile`)

## Absolute Prohibitions
1. **Zero Cross-Feature Imports:**
   - MUST NOT import business models or components from sibling sub-modules.
2. **Zero Barrel Files:**
   - MUST NOT create `index.ts` barrels.
3. **Zero Credentials in AsyncStorage:**
   - App lock and auth tokens MUST use `react-native-keychain` hardware storage.
4. **Zero Magic Values:**
   - Switches, cards, and dividers MUST use semantic theme tokens.
5. **Screen Line Ceilings:**
   - Screen files in `screens/` MUST NOT exceed 80 lines.
