---
name: drata-cli
description: >
  Use the Drata CLI to manage compliance from the terminal. Query controls, monitoring tests,
  assets, risks, vendors, personnel, policies, evidence, and more across all 125 Drata API v2
  endpoints. Built for agentic compliance workflows - AI agents can check compliance posture,
  create risks from findings, verify controls, and automate evidence collection.
  Use when the user wants to interact with Drata, check compliance status, manage controls,
  or automate compliance workflows.
license: MIT
metadata:
  author: Harvey Yorke
  version: "0.1.0"
  source: https://github.com/yorkeccak/drata-cli
inputs:
  - name: DRATA_API_KEY
    description: Drata API key for authenticating CLI commands. See https://help.drata.com/en/articles/6695964
    required: true
  - name: DRATA_REGION
    description: "API region: us, eu, or apac (default: us)"
    required: false
---

# Drata CLI

## Agent Protocol

The CLI auto-detects non-TTY environments and outputs JSON - no `--json` flag needed in pipelines.

**Rules for agents:**
- Supply `DRATA_API_KEY` and `DRATA_REGION` env vars. Never rely on interactive login.
- Pass `-q` / `--quiet` to suppress spinners and get clean JSON.
- Exit `0` = success, `1` = error.
- Error JSON:
  ```json
  {"error":"..."}
  ```
- All commands produce structured JSON output when stdout is not a TTY.
- Most workspace-scoped commands require `--workspace <id>`. Get workspace IDs with `workspaces list`.
- List responses use cursor-based pagination: check `pagination.cursor` for next page.

## Authentication

Auth resolves: `--api-key` flag > `DRATA_API_KEY` env > config file (`drata login`).

## Global Flags

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override API key for this invocation |
| `--region <region>` | API region: `us`, `eu`, or `apac` |
| `--profile <name>` | Select stored credential profile |
| `--json` | Force JSON output |
| `-q, --quiet` | Suppress spinners/status (implies `--json`) |

## Available Commands

### Auth & Diagnostics

| Command | What it does |
|---------|-------------|
| `login` | Save API key (interactive or `--key <key> --region eu`) |
| `logout` | Remove stored credentials |
| `whoami` | Show auth status and company info |
| `doctor` | Check connectivity and diagnostics |

### Core Resources

| Command | What it does |
|---------|-------------|
| `company` | Get company information |
| `workspaces list` | List all workspaces |
| `assets list\|get\|create\|update\|remove` | Manage asset inventory |

### Controls & Compliance

| Command | What it does |
|---------|-------------|
| `controls list\|get\|create\|update` | Manage compliance controls (needs `--workspace`) |
| `controls requirements <id>` | List requirements for a control |
| `controls compare-requirements` | Compare control-requirement mappings |
| `control-notes list\|get\|create\|update\|delete` | Notes on controls |
| `control-owners list\|add\|modify\|remove` | Control ownership |
| `monitoring-tests list\|get` | Compliance test results |
| `monitoring-tests failures <id>` | Failing test details |
| `monitoring-tests exclusions <id>` | Test exclusions |
| `evidence-library list\|get\|create\|update\|delete` | Evidence management |
| `frameworks list\|requirements` | Framework requirements |

### People & Devices

| Command | What it does |
|---------|-------------|
| `personnel list\|get\|update\|reset-sync` | Manage personnel |
| `users list\|get` | Platform users |
| `roles list\|get\|users` | User roles |
| `user-documents list\|get\|upload\|delete` | User compliance docs |
| `user-policies get\|acknowledge` | Policy assignments |
| `devices list\|get\|apps\|create\|remove` | Device management |
| `device-documents list\|get\|upload\|delete` | Device compliance docs |
| `background-checks create` | Background check records |

### Policies & Events

| Command | What it does |
|---------|-------------|
| `policies list\|get\|versions\|version` | Policy management |
| `events list\|get\|download` | Audit events |

### Risk Management

| Command | What it does |
|---------|-------------|
| `risks list\|get\|create\|update` | Manage risks (needs `--register-id`) |
| `risks insights` | Risk analytics |
| `risk-registers list\|get\|create\|update\|delete` | Risk registers |
| `risk-documents list\|get\|upload\|delete` | Risk evidence |
| `risk-library list\|get\|copy` | Risk templates |
| `risk-notes list\|get\|create\|update\|delete` | Notes on risks |

### Vendors

| Command | What it does |
|---------|-------------|
| `vendors list\|get\|create\|update\|remove\|stats` | Vendor management |
| `vendors questionnaires\|send-questionnaire\|get-questionnaire` | Vendor questionnaires |
| `vendor-types list\|create\|update\|delete` | Vendor categories |
| `vendor-documents list\|get\|upload` | Vendor documents |
| `vendor-security-reviews create\|get` | Security reviews |

### Integrations

| Command | What it does |
|---------|-------------|
| `custom-connections list\|get\|create\|update\|delete` | Custom integrations |
| `hris-identities list\|get\|batch-upsert\|update\|delete` | HRIS identity sync |

## Common Patterns

**Get workspace ID first (required for many commands):**
```bash
DRATA_API_KEY=key DRATA_REGION=eu node dist/cli.cjs workspaces list -q
```

**Check compliance posture:**
```bash
node dist/cli.cjs frameworks list --workspace 1 -q
# Returns: {data: [{name, isReady, numReadyInScopeRequirements, numInScopeRequirements}]}
```

**Find failing tests:**
```bash
node dist/cli.cjs monitoring-tests list --workspace 1 -q | jq '.data[] | select(.checkResultStatus == "FAILED")'
```

**List all controls with owners:**
```bash
node dist/cli.cjs controls list --workspace 1 --expand owners -q --size 200
```

**List all assets by provider:**
```bash
node dist/cli.cjs assets list --asset-provider AWS -q
```

**Create a risk from findings:**
```bash
node dist/cli.cjs risks create --register-id 1 --data '{"name": "CVE-2025-1234", "description": "Critical vuln found in dep audit"}'
```

**Paginate through all results:**
```bash
# First page
node dist/cli.cjs assets list -q --size 100
# Returns pagination.cursor - pass it for next page
node dist/cli.cjs assets list -q --size 100 --cursor "aWR8ODEz"
```

**Vendor security posture:**
```bash
node dist/cli.cjs vendors stats -q
node dist/cli.cjs vendors list -q
```

## Pagination

All list endpoints use cursor-based pagination:
- `--size <n>` controls page size (default 25)
- Response includes `pagination.cursor` - pass as `--cursor` for next page
- `cursor: null` means no more pages
- Use `--include-total-count` on first request to get total record count

## Common Mistakes

| # | Mistake | Fix |
|---|---------|-----|
| 1 | Running without API key in CI | Set `DRATA_API_KEY` env var |
| 2 | Forgetting `--workspace` | Controls, evidence, frameworks, monitoring-tests all need it |
| 3 | Not setting region | EU/APAC keys won't work on US endpoint - set `DRATA_REGION` |
| 4 | Expecting all data in one page | Use cursor pagination for complete datasets |
| 5 | Not using `-q` in pipelines | Use `-q` for clean JSON without spinner artifacts |
| 6 | Using `--data` with unescaped JSON | Wrap in single quotes: `--data '{"key": "value"}'` |
