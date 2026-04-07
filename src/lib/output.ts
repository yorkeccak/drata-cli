import pc from 'picocolors';
import { isTTY } from './tty.js';

export interface OutputOpts {
  json?: boolean;
  quiet?: boolean;
}

export function shouldOutputJson(opts: OutputOpts): boolean {
  return Boolean(opts.json) || !isTTY();
}

export function outputResult(data: unknown, opts: OutputOpts): void {
  if (shouldOutputJson(opts)) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  } else if (typeof data === 'string') {
    process.stdout.write(data + '\n');
  } else {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  }
}

export function outputError(error: unknown, opts: OutputOpts): never {
  const msg = error instanceof Error ? error.message : String(error);
  if (shouldOutputJson(opts)) {
    process.stderr.write(JSON.stringify({ error: msg }) + '\n');
  } else {
    process.stderr.write(`${pc.red('Error:')} ${msg}\n`);
  }
  process.exit(1);
}

export function outputWarning(msg: string): void {
  if (isTTY()) {
    process.stderr.write(`${pc.yellow('Warning:')} ${msg}\n`);
  }
}

export function outputSuccess(msg: string): void {
  if (isTTY()) {
    process.stderr.write(`${pc.green('✔')} ${msg}\n`);
  }
}
