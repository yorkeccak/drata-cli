import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List all policies');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching policies...');
  const params = paginationParams(opts);
  const res = await client.get<any>('/policies', params);
  spinner.stop('Policies fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No policies found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Updated')],
      ...items.map((p: any) => [
        String(p.id ?? ''),
        truncate(p.name ?? p.title ?? '-', 40),
        p.status ?? '-',
        formatDate(p.updatedAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single policy')
  .argument('<policyId>', 'Policy ID');
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const policyId = args[0];
  spinner.update('Fetching policy...');
  const res = await client.get<any>(`/policies/${policyId}`);
  spinner.stop('Policy fetched');
  outputResult(res, opts);
}));

const versions = new Command('versions')
  .description('List versions for a policy')
  .argument('<policyId>', 'Policy ID');
addPaginationOpts(versions);
versions.action(withClient(async ({ client, opts, spinner, args }) => {
  const policyId = args[0];
  spinner.update('Fetching policy versions...');
  const params = paginationParams(opts);
  const res = await client.get<any>(`/policies/${policyId}/policy-versions`, params);
  spinner.stop('Policy versions fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No versions found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Version'), pc.bold('Status'), pc.bold('Created')],
      ...items.map((v: any) => [
        String(v.id ?? ''),
        String(v.version ?? v.versionNumber ?? '-'),
        v.status ?? '-',
        formatDate(v.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const version = new Command('version')
  .description('Get a specific policy version')
  .argument('<policyId>', 'Policy ID')
  .argument('<policyVersionId>', 'Policy version ID');
version.action(withClient(async ({ client, opts, spinner, args }) => {
  const policyId = args[0];
  const policyVersionId = args[1];
  spinner.update('Fetching policy version...');
  const res = await client.get<any>(`/policies/${policyId}/policy-versions/${policyVersionId}`);
  spinner.stop('Policy version fetched');
  outputResult(res, opts);
}));

export const policiesCommand = new Command('policies')
  .description('Manage policies')
  .addCommand(list)
  .addCommand(get)
  .addCommand(versions)
  .addCommand(version);
