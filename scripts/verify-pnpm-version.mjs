#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function parseVersion(input) {
  const [major = '0', minor = '0', patch = '0'] = input.split('.', 3);
  return {
    major: Number.parseInt(major, 10) || 0,
    minor: Number.parseInt(minor, 10) || 0,
    patch: Number.parseInt(patch, 10) || 0
  };
}

function isLessThan(a, b) {
  if (a.major !== b.major) return a.major < b.major;
  if (a.minor !== b.minor) return a.minor < b.minor;
  return a.patch < b.patch;
}

const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const packageManager = packageJson.packageManager || '';
const [manager, versionSpec = ''] = packageManager.split('@');

if (manager !== 'pnpm') {
  // Not using pnpm, nothing to validate.
  process.exit(0);
}

const requiredVersion = parseVersion(versionSpec.replace(/[^0-9.].*$/, ''));

let currentVersion;
try {
  currentVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
} catch (error) {
  console.error('\n@tornado-ai: pnpm is required before installing dependencies.');
  console.error('Install pnpm via Corepack: "corepack prepare pnpm@%s --activate".', versionSpec || '10.20.0');
  process.exit(1);
}

const current = parseVersion(currentVersion);

if (isLessThan(current, requiredVersion)) {
  console.error(`\n@tornado-ai: pnpm ${versionSpec || '10.20.0'} or newer is required. Detected ${currentVersion}.`);
  console.error('Upgrade pnpm with: corepack prepare pnpm@%s --activate', versionSpec || '10.20.0');
  process.exit(1);
}

// If we reach here the pnpm version is acceptable.
