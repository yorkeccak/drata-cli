import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List monitoring tests')
  .requiredOption('--workspace <id>', 'Workspace ID');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching monitoring tests…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/monitoring-tests`,
    paginationParams(opts),
  );
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
    return;
  }

  const items = res.data ?? res;
  if (!Array.isArray(items) || items.length === 0) {
    outputResult('No monitoring tests found.', opts);
    return;
  }

  const rows = [
    [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Last Run')],
    ...items.map((t: any) => [
      String(t.id),
      truncate(t.name ?? '-', 40),
      colorStatus(t.status ?? '-'),
      formatDate(t.lastRun ?? t.lastRunAt),
    ]),
  ];
  outputResult(padTable(rows), opts);
}));

const get = new Command('get')
  .description('Get a monitoring test')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--test-id <id>', 'Monitoring test ID');
get.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching monitoring test…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/monitoring-tests/${opts.testId}`,
  );
  spinner.stop();
  outputResult(res, opts);
}));

const exclusions = new Command('exclusions')
  .description('List exclusions for a monitoring test')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--test-id <id>', 'Monitoring test ID');
addPaginationOpts(exclusions);
exclusions.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching exclusions…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/monitoring-tests/${opts.testId}/exclusions`,
    paginationParams(opts),
  );
  spinner.stop();
  outputResult(res, opts);
}));

const failures = new Command('failures')
  .description('List failures for a monitoring test')
  .requiredOption('--workspace <id>', 'Workspace ID')
  .requiredOption('--test-id <id>', 'Monitoring test ID');
addPaginationOpts(failures);
failures.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching failures…');
  const res = await client.get<any>(
    `/workspaces/${opts.workspace}/monitoring-tests/${opts.testId}/failures`,
    paginationParams(opts),
  );
  spinner.stop();
  outputResult(res, opts);
}));

export const monitoringTestsCommand = new Command('monitoring-tests')
  .description('Manage monitoring tests')
  .addCommand(list)
  .addCommand(get)
  .addCommand(exclusions)
  .addCommand(failures);
