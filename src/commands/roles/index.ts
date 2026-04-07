import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List all roles');
list.action(withClient(async ({ client, opts, spinner, args }) => {
  spinner.update('Fetching roles...');
  const res = await client.get<any>('/roles');
  spinner.stop('Roles fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No roles found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Description')],
      ...items.map((r: any) => [
        String(r.id ?? ''),
        truncate(r.name ?? '-', 30),
        truncate(r.description ?? '-', 50),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single role')
  .argument('<roleId>', 'Role ID');
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const roleId = args[0];
  spinner.update('Fetching role...');
  const res = await client.get<any>(`/roles/${roleId}`);
  spinner.stop('Role fetched');
  outputResult(res, opts);
}));

const users = new Command('users')
  .description('List users with a specific role')
  .argument('<roleId>', 'Role ID');
addPaginationOpts(users);
users.action(withClient(async ({ client, opts, spinner, args }) => {
  const roleId = args[0];
  spinner.update('Fetching role users...');
  const params = paginationParams(opts);
  const res = await client.get<any>(`/roles/${roleId}/users`, params);
  spinner.stop('Role users fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No users found for this role.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Email'), pc.bold('First Name'), pc.bold('Last Name')],
      ...items.map((u: any) => [
        String(u.id ?? ''),
        truncate(u.email ?? '-', 36),
        truncate(u.firstName ?? '-', 20),
        truncate(u.lastName ?? '-', 20),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

export const rolesCommand = new Command('roles')
  .description('Manage roles')
  .addCommand(list)
  .addCommand(get)
  .addCommand(users);
