import { Command } from '@commander-js/extra-typings';
import { withClient, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const create = new Command('create')
  .description('Create a background check')
  .requiredOption('--user-id <id>', 'User ID')
  .requiredOption('--url <url>', 'Background check URL')
  .requiredOption('--filed-at <date>', 'Date filed (ISO 8601)');
create.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Creating background check…');
  const res = await client.post<any>('/background-checks', {
    userId: Number(opts.userId),
    url: opts.url,
    filedAt: opts.filedAt,
  });
  spinner.stop();
  outputResult(res, opts);
}));

export const backgroundChecksCommand = new Command('background-checks')
  .description('Manage background checks')
  .addCommand(create);
