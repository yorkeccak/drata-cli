import { Command } from '@commander-js/extra-typings';
import {
  withClient,
  addPaginationOpts,
  addExpandOpt,
  paginationParams,
  expandParams,
  outputResult,
} from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List risks in a risk register')
  .requiredOption('--register-id <registerId>', 'Risk register ID');

addPaginationOpts(list);
addExpandOpt(list);

list.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  spinner.update('Fetching risks...');
  const params: Record<string, string | string[] | undefined> = {
    ...paginationParams(opts),
    ...expandParams(opts),
  };
  const data = await client.get<Record<string, unknown>>(`/risk-registers/${registerId}/risks`, params);
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(data, opts);
  } else {
    const items = (data as any).data ?? [];
    if (items.length === 0) {
      console.log(pc.dim('No risks found.'));
      return;
    }
    const rows = [
      [pc.bold('ID'), pc.bold('Name'), pc.bold('Status'), pc.bold('Score'), pc.bold('Created')],
      ...items.map((r: any) => [
        String(r.id),
        truncate(r.name ?? '-', 40),
        colorStatus(r.status ?? '-'),
        String(r.score ?? '-'),
        formatDate(r.createdAt),
      ]),
    ];
    console.log(padTable(rows));
  }
}));

const get = new Command('get')
  .description('Get a single risk')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .argument('<riskId>', 'Risk ID');

addExpandOpt(get);

get.action(withClient(async ({ client, opts, spinner, args }) => {
  const registerId = opts.registerId as string;
  const riskId = args[0];
  spinner.update('Fetching risk...');
  const params = { ...expandParams(opts) };
  const data = await client.get<Record<string, unknown>>(`/risk-registers/${registerId}/risks/${riskId}`, params);
  spinner.stop();
  outputResult(data, opts);
}));

const create = new Command('create')
  .description('Create a risk')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .requiredOption('--data <json>', 'Risk data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    spinner.update('Creating risk...');
    const body = JSON.parse(opts.data as string);
    const data = await client.post(`/risk-registers/${registerId}/risks`, body);
    spinner.stop('Risk created.');
    outputResult(data, opts);
  }));

const update = new Command('update')
  .description('Update a risk')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .argument('<riskId>', 'Risk ID')
  .requiredOption('--data <json>', 'Risk data as JSON string')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    const riskId = args[0];
    spinner.update('Updating risk...');
    const body = JSON.parse(opts.data as string);
    const data = await client.put(`/risk-registers/${registerId}/risks/${riskId}`, body);
    spinner.stop('Risk updated.');
    outputResult(data, opts);
  }));

const insights = new Command('insights')
  .description('Get risk register insights')
  .requiredOption('--register-id <registerId>', 'Risk register ID')
  .action(withClient(async ({ client, opts, spinner, args }) => {
    const registerId = opts.registerId as string;
    spinner.update('Fetching insights...');
    const data = await client.get<Record<string, unknown>>(`/risk-registers/${registerId}/insights`);
    spinner.stop();
    outputResult(data, opts);
  }));

export const risksCommand = new Command('risks')
  .description('Manage risks within a risk register')
  .addCommand(list)
  .addCommand(get)
  .addCommand(create)
  .addCommand(update)
  .addCommand(insights);
