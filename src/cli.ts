import { Command } from '@commander-js/extra-typings';
import { VERSION, PACKAGE_NAME } from './lib/version.js';

// Auth commands
import { loginCommand } from './commands/auth/login.js';
import { logoutCommand } from './commands/auth/logout.js';
import { whoamiCommand } from './commands/auth/whoami.js';
import { doctorCommand } from './commands/auth/doctor.js';

// Resource commands
import { companyCommand } from './commands/company/index.js';
import { assetsCommand } from './commands/assets/index.js';
import { controlsCommand } from './commands/controls/index.js';
import { controlNotesCommand } from './commands/control-notes/index.js';
import { controlOwnersCommand } from './commands/control-owners/index.js';
import { devicesCommand } from './commands/devices/index.js';
import { deviceDocumentsCommand } from './commands/device-documents/index.js';
import { personnelCommand } from './commands/personnel/index.js';
import { usersCommand } from './commands/users/index.js';
import { rolesCommand } from './commands/roles/index.js';
import { policiesCommand } from './commands/policies/index.js';
import { eventsCommand } from './commands/events/index.js';
import { evidenceLibraryCommand } from './commands/evidence-library/index.js';
import { frameworksCommand } from './commands/frameworks/index.js';
import { monitoringTestsCommand } from './commands/monitoring-tests/index.js';
import { risksCommand } from './commands/risks/index.js';
import { riskRegistersCommand } from './commands/risk-registers/index.js';
import { riskDocumentsCommand } from './commands/risk-documents/index.js';
import { riskLibraryCommand } from './commands/risk-library/index.js';
import { riskNotesCommand } from './commands/risk-notes/index.js';
import { vendorsCommand } from './commands/vendors/index.js';
import { vendorTypesCommand } from './commands/vendor-types/index.js';
import { vendorDocumentsCommand } from './commands/vendor-documents/index.js';
import { vendorSecurityReviewsCommand } from './commands/vendor-security-reviews/index.js';
import { customConnectionsCommand } from './commands/custom-connections/index.js';
import { hrisIdentitiesCommand } from './commands/hris-identities/index.js';
import { backgroundChecksCommand } from './commands/background-checks/index.js';
import { workspacesCommand } from './commands/workspaces/index.js';
import { userDocumentsCommand } from './commands/user-documents/index.js';
import { userPoliciesCommand } from './commands/user-policies/index.js';

const program = new Command()
  .name('drata')
  .description('Drata CLI - Agentic compliance management from the terminal')
  .version(VERSION)
  .option('--api-key <key>', 'Drata API key')
  .option('--region <region>', 'API region: us, eu, apac')
  .option('--profile <name>', 'Credential profile name')
  .option('--json', 'Output as JSON')
  .option('-q, --quiet', 'Suppress non-essential output')
  .hook('preAction', (thisCommand, actionCommand) => {
    if (actionCommand.optsWithGlobals().quiet) {
      thisCommand.setOptionValue('json', true);
    }
  });

// Auth
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(doctorCommand);

// Core resources
program.addCommand(companyCommand);
program.addCommand(workspacesCommand);
program.addCommand(assetsCommand);

// Controls
program.addCommand(controlsCommand);
program.addCommand(controlNotesCommand);
program.addCommand(controlOwnersCommand);

// People
program.addCommand(personnelCommand);
program.addCommand(usersCommand);
program.addCommand(rolesCommand);
program.addCommand(userDocumentsCommand);
program.addCommand(userPoliciesCommand);

// Devices
program.addCommand(devicesCommand);
program.addCommand(deviceDocumentsCommand);

// Policies & Frameworks
program.addCommand(policiesCommand);
program.addCommand(frameworksCommand);
program.addCommand(evidenceLibraryCommand);

// Monitoring
program.addCommand(monitoringTestsCommand);
program.addCommand(eventsCommand);

// Risks
program.addCommand(risksCommand);
program.addCommand(riskRegistersCommand);
program.addCommand(riskDocumentsCommand);
program.addCommand(riskLibraryCommand);
program.addCommand(riskNotesCommand);

// Vendors
program.addCommand(vendorsCommand);
program.addCommand(vendorTypesCommand);
program.addCommand(vendorDocumentsCommand);
program.addCommand(vendorSecurityReviewsCommand);

// Integrations
program.addCommand(customConnectionsCommand);
program.addCommand(hrisIdentitiesCommand);
program.addCommand(backgroundChecksCommand);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
