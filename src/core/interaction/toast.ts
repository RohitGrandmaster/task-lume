/**
 * RESPONSIBILITY: Canonical interaction toast trigger (Section 965).
 * FLOW: Re-exports showToast from core toast engine for unified interaction boundary.
 */

import { showToast } from '../toast/showToast';

export { showToast };
export default { showToast };
