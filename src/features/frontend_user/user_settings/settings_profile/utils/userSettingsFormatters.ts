/**
 * RESPONSIBILITY: Feature-local presentation formatters for settings data size, app version, and security badges.
 * FLOW: Consumed by settings cards, links, and profile sections.
 */

export function formatByteSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function formatAppVersionDisplay(version: string, build: string): string {
  return `Version ${version} (Build ${build})`;
}
