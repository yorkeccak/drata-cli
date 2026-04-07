import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List frameworks')
  .requiredOption('--workspace <id>', 'Workspace ID');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching frameworks…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/frameworks`,
    paginationParams(opts),
  );
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
    return;
  }

  const items = res.data ?? res;
  if (!Array.isArray(items) || items.length === 0) {
    outputResult('No frameworks found.', opts);
    return;
  }

  const rows = [
    [pc.bold('Name'), pc.bold('Tag')],
    ...items.map((f: any) => [
      truncate(f.name ?? '-', 50),
      f.tag ?? '-',
    ]),
  ];
  outputResult(padTable(rows), opts);
}));

const requirements = new Command('requirements')
  .description('List framework requirements')
  .requiredOption('--workspace <id>', 'Workspace ID');
addPaginationOpts(requirements);
requirements.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching requirements…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/framework-requirements`,
    paginationParams(opts),
  );
  spinner.stop();
  outputResult(res, opts);
}));

export const frameworksCommand = new Command('frameworks')
  .description('Manage frameworks')
  .addCommand(list)
  .addCommand(requirements);
