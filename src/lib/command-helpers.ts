import { type Command } from '@commander-js/extra-typings';
import { resolveAuth } from './config.js';
import { createClient, type DrataClient } from './client.js';
import { outputResult, outputError, type OutputOpts } from './output.js';
import { createSpinner } from './spinner.js';

export interface ActionContext {
  client: DrataClient;
  opts: OutputOpts & Record<string, unknown>;
  spinner: ReturnType<typeof createSpinner>;
  args: string[];
}

// withClient now takes just the async handler. It uses Commander's `this` binding
// to access the command instance, avoiding the "before initialization" problem.
export function withClient(
  fn: (ctx: ActionContext) => Promise<void>
): (...actionArgs: unknown[]) => Promise<void> {
  return async function (this: Command<any, any>, ...rawArgs: unknown[]) {
    // Commander passes parsed args then options then command - `this` is the command
    const cmd = this;
    const opts = cmd.optsWithGlobals();
    const spinner = createSpinner('', Boolean(opts.quiet));
    try {
      const auth = resolveAuth(opts);
      const client = createClient(auth.apiKey, auth.region);
      const args = cmd.args ?? [];
      await fn({ client, opts, spinner, args });
    } catch (err) {
      spinner.fail('');
      outputError(err, opts);
    }
  };
}

export function addPaginationOpts<T extends Command<any, any>>(cmd: T): T {
  return cmd
    .option('--cursor <cursor>', 'Pagination cursor')
    .option('--size <size>', 'Page size', '25')
    .option('--sort <field>', 'Sort field')
    .option('--sort-dir <dir>', 'Sort direction: asc or desc')
    .option('--include-total-count', 'Include total count') as T;
}

export function addExpandOpt<T extends Command<any, any>>(cmd: T): T {
  return cmd.option('--expand <fields...>', 'Expand sub-objects (comma-separated)') as T;
}

export function paginationParams(opts: Record<string, unknown>): Record<string, string | undefined> {
  return {
    cursor: opts.cursor as string | undefined,
    size: opts.size as string | undefined,
    sort: opts.sort as string | undefined,
    sortDir: opts.sortDir as string | undefined,
    includeTotalCount: opts.includeTotalCount ? 'true' : undefined,
  };
}

export function expandParams(opts: Record<string, unknown>): Record<string, string[] | undefined> {
  const expand = opts.expand;
  if (!expand) return {};
  const fields = Array.isArray(expand) ? expand : [expand as string];
  return { 'expand[]': fields };
}

export { outputResult, outputError, createSpinner };
