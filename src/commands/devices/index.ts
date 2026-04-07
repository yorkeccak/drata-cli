import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, addExpandOpt, paginationParams, expandParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List all devices');
addPaginationOpts(list);
list
  .option('--os <os>', 'Filter by operating system')
  .option('--os-version <version>', 'Filter by OS version')
  .option('--model <model>', 'Filter by device model')
  .option('--serial-number <serial>', 'Filter by serial number')
  .option('--encryption-enabled <bool>', 'Filter by encryption status')
  .option('--firewall-enabled <bool>', 'Filter by firewall status')
  .option('--screen-lock-enabled <bool>', 'Filter by screen lock status')
  .option('--antivirus-enabled <bool>', 'Filter by antivirus status')
  .option('--compliance-status <status>', 'Filter by compliance status')
  .option('--personnel-id <id>', 'Filter by personnel ID')
  .option('--connection-id <id>', 'Filter by connection ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    spinner.update('Fetching devices...');
    const params = {
      ...paginationParams(opts),
      os: opts.os as string | undefined,
      osVersion: opts.osVersion as string | undefined,
      model: opts.model as string | undefined,
      serialNumber: opts.serialNumber as string | undefined,
      encryptionEnabled: opts.encryptionEnabled as string | undefined,
      firewallEnabled: opts.firewallEnabled as string | undefined,
      screenLockEnabled: opts.screenLockEnabled as string | undefined,
      antivirusEnabled: opts.antivirusEnabled as string | undefined,
      complianceStatus: opts.complianceStatus as string | undefined,
      personnelId: opts.personnelId as string | undefined,
      connectionId: opts.connectionId as string | undefined,
    };
    const res = await client.get<any>('/devices', params);
    spinner.stop('Devices fetched');

    if (shouldOutputJson(opts)) {
      outputResult(res, opts);
    } else {
      const items = res.data ?? res;
      if (!Array.isArray(items) || items.length === 0) {
        console.log(pc.dim('No devices found.'));
        return;
      }
      const rows = [
        [pc.bold('ID'), pc.bold('Model'), pc.bold('OS'), pc.bold('Serial Number'), pc.bold('Last Checked')],
        ...items.map((d: any) => [
          String(d.id ?? ''),
          truncate(d.model ?? '-', 30),
          truncate(d.os ?? '-', 20),
          truncate(d.serialNumber ?? '-', 24),
          formatDate(d.lastCheckedAt ?? d.lastChecked),
        ]),
      ];
      console.log(padTable(rows));
    }
  }));

const get = new Command('get')
  .description('Get a single device')
  .argument('<deviceId>', 'Device ID');
addExpandOpt(get);
get.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = args[0];
  spinner.update('Fetching device...');
  const params = { ...expandParams(opts) };
  const res = await client.get<any>(`/devices/${deviceId}`, params);
  spinner.stop('Device fetched');
  outputResult(res, opts);
}));

const listForPersonnel = new Command('list-for-personnel')
  .description('List devices for a personnel member')
  .requiredOption('--personnel-id <id>', 'Personnel ID');
addPaginationOpts(listForPersonnel);
listForPersonnel.action(withClient(async ({ client, opts, spinner, args }) => {
  const personnelId = opts.personnelId as string;
  spinner.update('Fetching devices for personnel...');
  const params = paginationParams(opts);
  const res = await client.get<any>(`/personnel/${personnelId}/devices`, params);
  spinner.stop('Devices fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No devices found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Model'), pc.bold('OS'), pc.bold('Serial Number'), pc.bold('Last Checked')],
      ...items.map((d: any) => [
        String(d.id ?? ''),
        truncate(d.model ?? '-', 30),
        truncate(d.os ?? '-', 20),
        truncate(d.serialNumber ?? '-', 24),
        formatDate(d.lastCheckedAt ?? d.lastChecked),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const listForConnection = new Command('list-for-connection')
  .description('List devices for a connection')
  .requiredOption('--connection-id <id>', 'Connection ID');
addPaginationOpts(listForConnection);
listForConnection.action(withClient(async ({ client, opts, spinner, args }) => {
  const connectionId = opts.connectionId as string;
  spinner.update('Fetching devices for connection...');
  const params = paginationParams(opts);
  const res = await client.get<any>(`/connections/${connectionId}/devices`, params);
  spinner.stop('Devices fetched');

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
  } else {
    const items = res.data ?? res;
    if (!Array.isArray(items) || items.length === 0) {
      console.log(pc.dim('No devices found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Model'), pc.bold('OS'), pc.bold('Serial Number'), pc.bold('Last Checked')],
      ...items.map((d: any) => [
        String(d.id ?? ''),
        truncate(d.model ?? '-', 30),
        truncate(d.os ?? '-', 20),
        truncate(d.serialNumber ?? '-', 24),
        formatDate(d.lastCheckedAt ?? d.lastChecked),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const apps = new Command('apps')
  .description('List apps for a device')
  .argument('<deviceId>', 'Device ID');
apps.action(withClient(async ({ client, opts, spinner, args }) => {
  const deviceId = args[0];
  spinner.update('Fetching device apps...');
  const res = await client.get<any>(`/devices/${deviceId}/apps`);
  spinner.stop('Apps fetched');
  outputResult(res, opts);
}));

const create = new Command('create')
  .description('Create a device for a custom connection')
  .requiredOption('--connection-id <id>', 'Custom connection ID')
  .requiredOption('--data <json>', 'Device data as JSON');
create.action(withClient(async ({ client, opts, spinner, args }) => {
  const connectionId = opts.connectionId as string;
  const body = JSON.parse(opts.data as string);
  spinner.update('Creating device...');
  const res = await client.post<any>(`/custom-connections/${connectionId}/devices`, body);
  spinner.stop('Device created');
  outputResult(res, opts);
}));

const remove = new Command('remove')
  .description('Remove a device from a custom connection')
  .requiredOption('--connection-id <id>', 'Custom connection ID')
  .argument('<deviceId>', 'Device ID');
remove.action(withClient(async ({ client, opts, spinner, args }) => {
  const connectionId = opts.connectionId as string;
  const deviceId = args[0];
  spinner.update('Removing device...');
  await client.del(`/custom-connections/${connectionId}/devices/${deviceId}`);
  spinner.stop('Device removed');
  if (shouldOutputJson(opts)) {
    outputResult({ success: true }, opts);
  } else {
    console.log(pc.green('Device removed successfully.'));
  }
}));

export const devicesCommand = new Command('devices')
  .description('Manage devices')
  .addCommand(list)
  .addCommand(get)
  .addCommand(listForPersonnel)
  .addCommand(listForConnection)
  .addCommand(apps)
  .addCommand(create)
  .addCommand(remove);
