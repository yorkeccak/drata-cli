import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  paginationParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, colorStatus, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const get = new Command('get')
  .description('Get assigned policies for a user')
  .argument('<userId>', 'User ID');

addPaginationOpts(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const userId = args[0];
  spinner.update('Fetching assigned policies...');
  const params = { ...paginationParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/users/${userId}/assigned-policies`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No assigned policies found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Assigned')],
      ...items.map((p: any) => [
        String(p.id),
        truncate(p.name ?? '-', 40),
        colorStatus(p.status ?? '-'),
        formatDate(p.assignedAt ?? p.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const acknowledge = new Command('acknowledge')
  .description('Acknowledge an assigned policy')
  .argument('<userId>', 'User ID')
  .requiredOption('--policy-id <policyId>', 'Policy ID to acknowledge')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const userId = args[0];
    const policyId = opts.policyId as string;
    spinner.update('Acknowledging policy...');
    const data = await client.post(`/users/${userId}/assigned-policies/${policyId}/action-acknowledge`, {});
    spinner.stop('Policy acknowledged.');
    outputResult(data, opts);
  }));

export const userPoliciesCommand = new Command('user-policies')
  .description('Manage user policy assignments')
  .addCommand(get)
  .addCommand(acknowledge);
