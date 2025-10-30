#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function logStep(message) {
  console.log(`\n➡️  ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logWarning(message) {
  console.warn(`⚠️  ${message}`);
}

async function ensureEnvFile() {
  const envPath = path.join(projectRoot, '.env');
  const examplePath = path.join(projectRoot, '.env.example');

  if (existsSync(envPath)) {
    logSuccess('Existing .env detected – skipping template copy.');
    return;
  }

  if (!existsSync(examplePath)) {
    logWarning('No .env.example template found; create .env manually.');
    return;
  }

  copyFileSync(examplePath, envPath);
  logSuccess('Copied .env.example -> .env');
}

async function ensureDataDirectory() {
  const dataDir = path.join(projectRoot, 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    logSuccess('Created data/ directory for SQLite and cache artifacts.');
  } else {
    logSuccess('data/ directory already present.');
  }
}

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function installDependencies() {
  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  logStep('Installing Node.js dependencies with pnpm');
  try {
    await runCommand(pnpmCommand, ['install']);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logWarning('pnpm was not detected. Attempting to enable Corepack and install pnpm@10.20.0.');
      try {
        await runCommand('corepack', ['enable']);
        await runCommand('corepack', ['prepare', 'pnpm@10.20.0', '--activate']);
      } catch (corepackError) {
        logWarning('Automatic Corepack provisioning failed. Install pnpm manually and re-run pnpm setup.');
        throw corepackError;
      }
      await runCommand(pnpmCommand, ['install']);
      logSuccess('Dependencies installed successfully.');
      return;
    }

    throw error;
  }
  logSuccess('Dependencies installed successfully.');
}

async function main() {
  const [major] = process.versions.node.split('.').map(Number);
  if (Number.isFinite(major) && major < 18) {
    logWarning('Node.js 18+ is required. Please upgrade your runtime before continuing.');
  }

  logStep('Preparing environment configuration');
  await ensureEnvFile();

  logStep('Ensuring local data directories exist');
  await ensureDataDirectory();

  logStep('Bootstrapping project dependencies');
  try {
    await installDependencies();
  } catch (error) {
    logWarning(
      'Automatic dependency installation failed. Run "pnpm install" manually after resolving the issue.'
    );
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  logSuccess('Setup complete! Next steps: pnpm lint, pnpm test, pnpm dev');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
