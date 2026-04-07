import { Command } from '@commander-js/extra-typings';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { type Region, storeApiKey } from '../../lib/config.js';
import { createClient } from '../../lib/client.js';
import { outputError, outputSuccess } from '../../lib/output.js';
import { createSpinner } from '../../lib/spinner.js';

const REGIONS: { value: Region; label: string }[] = [
  { value: 'us', label: 'US (public-api.drata.com)' },
  { value: 'eu', label: 'EU (public-api.eu.drata.com)' },
  { value: 'apac', label: 'APAC (public-api.apac.drata.com)' },
];

export const loginCommand = new Command('login')
  .description('Authenticate with the Drata API')
  .option('--key <key>', 'API key (non-interactive)')
  .action(async function (this: any, opts: any) {
    const globalOpts = this.optsWithGlobals();
    try {
      let apiKey = opts.key;
      let region = globalOpts.region as Region | undefined;
      const profile = globalOpts.profile ?? 'default';

      if (!apiKey) {
        p.intro(pc.bold('Drata CLI Login'));

        const regionResult = await p.select({
          message: 'Select your Drata region:',
          options: REGIONS,
        });
        if (p.isCancel(regionResult)) {
          p.cancel('Login cancelled');
          process.exit(0);
        }
        region = regionResult;

        const keyResult = await p.password({
          message: 'Enter your Drata API key:',
          validate: (v) => (v.length < 10 ? 'API key seems too short' : undefined),
        });
        if (p.isCancel(keyResult)) {
          p.cancel('Login cancelled');
          process.exit(0);
        }
        apiKey = keyResult;
      }

      region = region ?? 'us';

      const spinner = createSpinner('Validating API key...');
      const client = createClient(apiKey, region);
      const valid = await client.validateKey();

      if (!valid) {
        spinner.fail('Invalid API key');
        outputError(new Error('Could not validate API key. Check your key and region.'), globalOpts);
      }

      storeApiKey(apiKey, region, profile);
      spinner.stop(`Logged in successfully (profile: ${profile}, region: ${region})`);
    } catch (err) {
      outputError(err, globalOpts);
    }
  });
