import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, addExpandOpt, paginationParams, expandParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List all users');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching users...');
  const params = paginationParams(opts);
  const res = await client.get<any>('/users', params);
  spinner.stop('Users fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No users found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Email'), pc.bold('First Name'), pc.bold('Last Name'), pc.bold('Role')],
      ...items.map((u: any) => [
        String(u.id ?? ''),
        truncate(u.email ?? '-', 36),
        truncate(u.firstName ?? '-', 20),
        truncate(u.lastName ?? '-', 20),
        u.role ?? u.roleName ?? '-',
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single user')
  .argument('<userId>', 'User ID');
addExpandOpt(get);
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const userId = args[0];
  spinner.update('Fetching user...');
  const params = { ...expandParams(opts) };
  const res = await client.get<any>(`/users/${userId}`, params);
  spinner.stop('User fetched');
  outputResult(res, opts);
}));

export const usersCommand = new Command('users')
  .description('Manage users')
  .addCommand(list)
  .addCommand(get);
