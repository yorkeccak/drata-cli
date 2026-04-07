import pc from 'picocolors';
import { supportsUnicode } from './tty.js';

const UNICODE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ASCII_FRAMES = ['-', '\\', '|', '/'];

interface Spinner {
  stop(msg?: string): void;
  fail(msg: string): void;
  warn(msg: string): void;
  info(msg: string): void;
  update(msg: string): void;
}

function noop(): Spinner {
  return { stop() {}, fail() {}, warn() {}, info() {}, update() {} };
}

export function createSpinner(message: string, quiet = false): Spinner {
  if (quiet || !process.stderr.isTTY) return noop();

  const frames = supportsUnicode() ? UNICODE_FRAMES : ASCII_FRAMES;
  let i = 0;
  let text = message;

  const timer = setInterval(() => {
    process.stderr.write(`\r${pc.cyan(frames[i++ % frames.length])} ${text}`);
  }, 80);

  function clear() {
    clearInterval(timer);
    process.stderr.write('\r\x1b[K');
  }

  return {
    stop(msg?: string) {
      clear();
      if (msg) process.stderr.write(`${pc.green('✔')} ${msg}\n`);
    },
    fail(msg: string) {
      clear();
      process.stderr.write(`${pc.red('✖')} ${msg}\n`);
    },
    warn(msg: string) {
      clear();
      process.stderr.write(`${pc.yellow('⚠')} ${msg}\n`);
    },
    info(msg: string) {
      clear();
      process.stderr.write(`${pc.blue('ℹ')} ${msg}\n`);
    },
    update(msg: string) {
      text = msg;
    },
  };
}
