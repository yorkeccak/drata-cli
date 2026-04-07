export function isTTY(): boolean {
  return Boolean(process.stdout.isTTY);
}

export function supportsUnicode(): boolean {
  if (process.platform === 'win32') return false;
  const term = process.env.TERM ?? '';
  return term !== 'linux' && term !== 'dumb';
}
