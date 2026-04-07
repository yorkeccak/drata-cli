import { Command } from '@commander-js/extra-typings';
import { removeApiKey } from '../../lib/config.js';
import { outputSuccess } from '../../lib/output.js';

export const logoutCommand = new Command('logout')
  .description('Remove stored credentials')
  .option('--profile <name>', 'Profile to remove (default: active profile)')
  .action((opts) => {
    removeApiKey(opts.profile);
    outputSuccess(`Logged out${opts.profile ? ` (profile: ${opts.profile})` : ''}`);
  });
