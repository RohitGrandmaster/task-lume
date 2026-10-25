#!/usr/bin/env node
/**
 * RESPONSIBILITY: Mechanical source checks for the mobile architecture and UI/UX contracts.
 * FLOW: npm scripts / CI → this scanner → file-level diagnostics and a failing exit code on violations.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const EXCLUDED = new Set(['node_modules', '.git', 'Pods', 'build', 'coverage']);
const FEATURE_SUFFIXES = ['_features.md', '_forbidden.md', '_theme_contract.md'];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && EXCLUDED.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
const allFiles = walk(ROOT);
const srcFiles = allFiles.filter((file) => file.startsWith(SRC + path.sep));
const sourceFiles = srcFiles.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file) && !/\.(test|spec)\./.test(file));
const relative = (file) => path.relative(ROOT, file).split(path.sep).join('/');
const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
function add(rule, file, line, detail) {
  failures.push({ rule, file: relative(file), line: line || 1, detail });
}
function report(selectedRules) {
  const results = failures.filter((item) => selectedRules.includes(item.rule));
  if (results.length === 0) {
    console.log('PASS: ' + selectedRules.join(', ') + ' (static checks only)');
    return;
  }
  const cap = 80;
  for (const item of results.slice(0, cap)) {
    console.error(`FAIL ${item.rule} ${item.file}:${item.line} — ${item.detail}`);
  }
  if (results.length > cap) console.error(`… ${results.length - cap} more findings not printed`);
  console.error(`FAILED: ${results.length} finding(s) in ${selectedRules.join(', ')}`);
  process.exitCode = 1;
}

const featureRoots = srcFiles
  .filter((file) => FEATURE_SUFFIXES[0] && file.endsWith('_features.md'))
  .map((file) => path.dirname(file))
  .sort((a, b) => a.length - b.length);
function owningFeature(file) {
  return featureRoots.filter((root) => file === root || file.startsWith(root + path.sep)).sort((a, b) => b.length - a.length)[0];
}
const currentFile = (target) => {
  const direct = path.resolve(target);
  const candidates = [direct, direct + '.ts', direct + '.tsx', direct + '.js', direct + '.jsx', path.join(direct, 'index.ts'), path.join(direct, 'index.tsx')];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
};

function checkBoundaries() {
  const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  for (const file of sourceFiles) {
    const owner = owningFeature(file);
    if (!owner) continue;
    const contents = read(file);
    if (/from\s+['"][^'"]*\/src\/context\//.test(contents) || /from\s+['"][^'"]*context\/(?:Todo|Settings|Auth|AppLock)Context/.test(contents)) {
      add('boundaries', file, 1, 'Feature imports a legacy global business context instead of an owning feature contract.');
    }
    let match;
    while ((match = importPattern.exec(contents))) {
      const specifier = match[1];
      let target;
      if (specifier.startsWith('@/')) target = currentFile(path.join(SRC, specifier.slice(2)));
      else if (specifier.startsWith('.')) target = currentFile(path.resolve(path.dirname(file), specifier));
      if (!target) continue;
      const targetOwner = owningFeature(target);
      if (targetOwner && targetOwner !== owner) {
        const line = contents.slice(0, match.index).split('\n').length;
        add('boundaries', file, line, `Cross-feature import into ${relative(targetOwner)} from ${relative(owner)}.`);
      }
    }
  }
}

function checkNaming() {
  for (const file of srcFiles.filter((value) => value.includes(path.sep + 'features' + path.sep))) {
    const base = path.basename(file);
    if (/^(index|common|shared|misc|helpers|utils|main|default|tab\d*)\.(ts|tsx|js|jsx)$/i.test(base)) {
      add('naming', file, 1, 'Generic/barrel filename is forbidden in feature code.');
    }
  }
}

function checkSizes() {
  for (const file of sourceFiles) {
    const rel = relative(file);
    const count = read(file).split('\n').length;
    let ceiling;
    if (rel.includes('/screens/') && /Screen\.(tsx|ts|jsx|js)$/.test(rel)) ceiling = 80;
    else if (rel.includes('/components/')) ceiling = 200;
    else if (rel.includes('/hooks/')) ceiling = 150;
    else if (rel.includes('/state/')) ceiling = 180;
    else if (rel.includes('/schemas/') || rel.includes('/types/')) ceiling = 150;
    else if (rel.includes('/utils/')) ceiling = 120;
    if (ceiling && count > ceiling) add('size', file, count, `File contains ${count} lines; ceiling is ${ceiling}.`);
  }
}

function checkBarrels() {
  for (const file of srcFiles) {
    if (file.startsWith(path.join(SRC, 'features') + path.sep) && /^index\.(ts|tsx)$/.test(path.basename(file))) {
      add('barrels', file, 1, 'Feature barrel files are forbidden.');
    }
  }
}

function checkTokens() {
  const colorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/g;
  for (const file of srcFiles.filter((value) => /\.(tsx|jsx)$/.test(value))) {
    const rel = relative(file);
    if (!rel.includes('/features/')) continue;
    const lines = read(file).split('\n');
    lines.forEach((line, index) => {
      if (line.includes('design-exception:')) return;
      if (colorPattern.test(line)) add('tokens', file, index + 1, 'Raw hexadecimal/RGB color in feature UI; use a semantic token or document an approved exception.');
      colorPattern.lastIndex = 0;
    });
  }
}

function contrastRatio(hexA, hexB) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (hex) => {
    const raw = hex.replace('#', '');
    const values = [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
    return 0.2126 * channel(values[0]) + 0.7152 * channel(values[1]) + 0.0722 * channel(values[2]);
  };
  const a = lum(hexA), b = lum(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function checkContrast() {
  const pairs = [
    ['onPrimary', 'primary'], ['onDestructive', 'destructive'],
    ['statusSuccessText', 'statusSuccessBg'], ['statusWarningText', 'statusWarningBg'],
    ['statusDangerText', 'statusDangerBg'], ['statusInfoText', 'statusInfoBg'],
    ['statusNeutralText', 'statusNeutralBg'], ['statusPurpleText', 'statusPurpleBg'],
    ['payCashText', 'payCashBg'], ['payUpiText', 'payUpiBg'],
    ['payCardText', 'payCardBg'], ['payBankText', 'payBankBg'],
    ['foreground', 'background'], ['foreground', 'card'], ['muted', 'background'], ['muted', 'card'],
  ];
  for (const mode of ['light', 'dark']) {
    const file = path.join(SRC, 'core', 'theme', mode + 'Theme.ts');
    if (!fs.existsSync(file)) { add('contrast', file, 1, 'Theme source missing.'); continue; }
    const text = read(file);
    const colors = {};
    for (const match of text.matchAll(/^\s*([A-Za-z]\w*)\s*:\s*['"](#(?:[0-9a-fA-F]{6}))['"]/gm)) colors[match[1]] = match[2];
    for (const [foreground, background] of pairs) {
      if (!colors[foreground] || !colors[background]) {
        add('contrast', file, 1, `Missing semantic pair token: ${foreground} / ${background}.`);
      } else if (contrastRatio(colors[foreground], colors[background]) < 4.5) {
        add('contrast', file, 1, `WCAG AA contrast below 4.5:1 for ${foreground} on ${background}.`);
      }
    }
  }
}

function checkAccessibility() {
  const interactive = /<(Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback)\b/g;
  for (const file of sourceFiles.filter((value) => /\.(tsx|jsx)$/.test(value))) {
    const lines = read(file).split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!interactive.test(lines[i])) { interactive.lastIndex = 0; continue; }
      interactive.lastIndex = 0;
      const block = lines.slice(i, Math.min(lines.length, i + 18)).join('\n');
      if (!/accessibilityLabel\s*=/.test(block)) add('accessibility', file, i + 1, 'Interactive element is missing an explicit accessible label.');
      if (!/testID\s*=/.test(block)) add('accessibility', file, i + 1, 'Interactive element is missing a deterministic testID.');
    }
  }
}

function checkDocs() {
  for (const root of featureRoots) {
    for (const suffix of FEATURE_SUFFIXES) {
      const file = path.join(root, path.basename(root) + suffix);
      if (!fs.existsSync(file)) add('docs', root, 1, `Required documentation trio artifact missing: ${suffix}.`);
    }
    const featureDoc = path.join(root, path.basename(root) + '_features.md');
    if (!fs.existsSync(featureDoc)) continue;
    const contents = read(featureDoc);
    const requiredSections = [
      'Scope and Non-Scope', 'Screen Inventory', 'Navigation Contract', 'API Contract',
      'Query Key Registry', 'Mutation Inventory', 'Permissions and Role Rules',
      'State Ownership', 'Offline, Loading, Empty, and Error States', 'Security and PII',
      'Accessibility Requirements', 'Background Tasks', 'Feature Flags', 'Cache Invalidation',
      'Migration, Rollback', 'Test Coverage Map', 'Architecture Exceptions', 'Known Contract Gaps',
      'Rule Compliance Checklist', 'Standalone Run', 'Module Portability', 'Deliverables',
    ];
    for (const section of requiredSections) {
      if (!contents.includes(section)) add('docs', featureDoc, 1, `Missing canonical section: ${section}.`);
    }
    if (!contents.startsWith('---\n')) add('docs', featureDoc, 1, 'Missing required freshness YAML frontmatter.');
  }
}

function checkSecrets() {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
    /\bsk_live_[A-Za-z0-9]{16,}\b/,
  ];
  for (const file of allFiles) {
    if (file.startsWith(path.join(ROOT, 'node_modules') + path.sep) || /package-lock\.json$/.test(file)) continue;
    if (!/\.(ts|tsx|js|jsx|json|md|yml|yaml|env|txt)$/.test(file)) continue;
    const lines = read(file).split('\n');
    lines.forEach((line, index) => {
      if (patterns.some((pattern) => pattern.test(line))) add('secrets', file, index + 1, 'Potential credential/private-key pattern found; review and rotate if real.');
    });
  }
}

checkBoundaries();
checkNaming();
checkSizes();
checkBarrels();
checkTokens();
checkContrast();
checkAccessibility();
checkDocs();
checkSecrets();

const mode = process.argv[2] || 'all';
const groups = {
  all: ['boundaries', 'naming', 'size', 'barrels', 'tokens', 'contrast', 'accessibility', 'docs', 'secrets'],
  boundaries: ['boundaries'],
  naming: ['naming'],
  size: ['size'],
  barrels: ['barrels'],
  tokens: ['tokens'],
  contrast: ['contrast'],
  accessibility: ['accessibility'],
  docs: ['docs'],
  secrets: ['secrets'],
};
if (!groups[mode]) {
  console.error('Unknown check mode: ' + mode);
  process.exit(2);
}
report(groups[mode]);
