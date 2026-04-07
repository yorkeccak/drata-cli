import { Command } from '@commander-js/extra-typings';
import { withClient, addPaginationOpts, paginationParams, outputResult } from '../../lib/command-helpers.js';
import { shouldOutputJson } from '../../lib/output.js';
import { padTable, truncate, formatDate, colorStatus } from '../../lib/format.js';
import pc from 'picocolors';

const list = new Command('list')
  .description('List events');
addPaginationOpts(list);
list.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching events…');
  const res = await client.get<any>('/events', paginationParams(opts));
  spinner.stop();

  if (shouldOutputJson(opts)) {
    outputResult(res, opts);
    return;
  }

  const items = res.data ?? res;
  if (!Array.isArray(items) || items.length === 0) {
    outputResult('No events found.', opts);
    return;
  }

  const rows = [
    [pc.bold('ID'), pc.bold('Action'), pc.bold('Created')],
    ...items.map((e: any) => [
      String(e.id),
      truncate(e.action ?? '-', 50),
      formatDate(e.createdAt),
    ]),
  ];
  outputResult(padTable(rows), opts);
}));

const get = new Command('get')
  .description('Get a single event')
  .requiredOption('--event-id <id>', 'Event ID');
get.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching event…');
  const res = await client.get<any>(`/events/${opts.eventId}`);
  spinner.stop();
  outputResult(res, opts);
}));

const download = new Command('download')
  .description('Create a PDF download job for an event')
  .requiredOption('--event-id <id>', 'Event ID');
download.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Creating download job…');
  const res = await client.post<any>(`/events/${opts.eventId}/download-jobs`);
  spinner.stop();
  outputResult(res, opts);
}));

const downloadStatus = new Command('download-status')
  .description('Get download job status')
  .requiredOption('--event-id <id>', 'Event ID')
  .requiredOption('--job-id <id>', 'Download job ID');
downloadStatus.action(withClient(async ({ client, opts, spinner }) => {
  spinner.update('Fetching download status…');
  const res = await client.get<any>(`/events/${opts.eventId}/download-jobs/${opts.jobId}`);
  spinner.stop();
  outputResult(res, opts);
}));

export const eventsCommand = new Command('events')
  .description('Manage events')
  .addCommand(list)
  .addCommand(get)
  .addCommand(download)
  .addCommand(downloadStatus);
