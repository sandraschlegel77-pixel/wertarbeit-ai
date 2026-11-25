# PROJEKT-UEBERGABE FUER APEX UI- & ORGANIGRAMM-ABGLEICH

## 1. ORDNERSTRUKTUR
.
./app
./backup
./build
./docs
./extensions
./prisma
./public
./scripts
./AGENTS.md
./build.out
./CHANGELOG.md
./CLAUDE.md
./Dockerfile
./env.d.ts
./FERTIG_LESEN.md
./package-lock.json
./package.json
./pnpm-workspace.yaml
./README.md
./render.yaml
./shopify.app.toml
./shopify.web.toml
./tsconfig.json
./typecheck.out
./vite.config.ts
./app/components
./app/lib
./app/routes
./app/services
./app/db.server.ts
./app/entry.server.tsx
./app/globals.d.ts
./app/root.tsx
./app/routes.ts
./app/shopify.server.ts
./app/components/dashboard
./app/components/gift
./app/components/monitor
./app/components/dashboard/AgentCard.tsx
./app/components/dashboard/AgentList.tsx
./app/components/dashboard/AtelierBot.tsx
./app/components/dashboard/CircuitBoard.tsx
./app/components/dashboard/CircuitParts.tsx
./app/components/dashboard/DomainInfoButton.tsx
./app/components/dashboard/EnterpriseOsOrganigram.css
./app/components/dashboard/EnterpriseOsOrganigram.tsx
./app/components/dashboard/ExecutivePulse.tsx
./app/components/dashboard/GiftForm.tsx
./app/components/dashboard/GlobalQuickJump.tsx
./app/components/dashboard/HeaderBar.tsx
./app/components/dashboard/InfoPop.tsx
./app/components/dashboard/JudicialWorkspace.tsx
./app/components/dashboard/LiveOrganization.tsx
./app/components/dashboard/LiveShow.tsx
./app/components/dashboard/MerchantOnboarding.tsx
./app/components/dashboard/OverviewExtras.tsx
./app/components/dashboard/OwnerDirectiveBar.tsx
./app/components/dashboard/Panels.tsx
./app/components/dashboard/Panels2.tsx
./app/components/dashboard/PlatformConnectorsPanel.tsx
./app/components/dashboard/PreparationDesk.tsx
./app/components/dashboard/PriceConfigurator.tsx
./app/components/dashboard/QrModal.tsx
./app/components/dashboard/RewardVault.tsx
./app/components/dashboard/theme.ts
./app/components/gift/giftText.ts
./app/components/gift/returnsCss.ts
./app/components/monitor/Approvals.tsx
./app/components/monitor/CoinRain.tsx
./app/components/monitor/Overview.tsx
./app/components/monitor/style.ts
./app/components/monitor/VoiceCommand.tsx
./app/lib/ai-memory.server.ts
./app/lib/cron-autopilot.server.ts
./app/lib/sidekick.server.ts
./app/routes/_index
./app/routes/api.cron.ts
./app/routes/api.finance.payment-ledger.ts
./app/routes/api.legal-tax.ts
./app/routes/api.live-traces.ts
./app/routes/api.rewards-export.tsx
./app/routes/api.sidekick.$category.$action.tsx
./app/routes/api.treasury-audit.ts
./app/routes/api.ucp.$op.ts
./app/routes/api.unsubscribe.ts
./app/routes/api.vault.$kind.$id.ts
./app/routes/api.whatsapp.messages.ts
./app/routes/api.workshop.daily-batch.zip.ts
./app/routes/app.additional.tsx
./app/routes/app.tsx
./app/routes/app._index.tsx
./app/routes/auth.$.tsx
./app/routes/feeds.$channel.xml.ts
./app/routes/gift.$token.tsx
./app/routes/mobile-monitor.tsx
./app/routes/privacy.tsx
./app/routes/returns-portal.tsx
./app/routes/shop[.]md.ts
./app/routes/support.tsx
./app/routes/ucp.schemas.$key.ts
./app/routes/webhooks.app.scopes_update.tsx
./app/routes/webhooks.app.uninstalled.tsx
./app/routes/webhooks.products.update.tsx
./app/routes/webhooks.tsx
./app/routes/[.]well-known.ucp.ts
./app/routes/_index/error.server.tsx
./app/routes/_index/route.tsx
./app/routes/_index/styles.module.css
./app/services/access-control-core.ts
./app/services/access-control.server.ts
./app/services/admin-types.ts
./app/services/agent-performance.server.ts
./app/services/agent-performance.ts
./app/services/agent-roster.ts
./app/services/agent-runner.server.ts
./app/services/agent-types.ts
./app/services/ai-agents.server.ts
./app/services/ai-evolution.server.ts
./app/services/ai-provider-router-core.ts
./app/services/ai-provider-router.server.ts
./app/services/approval-exceptions.ts
./app/services/autopilot-control.server.ts
./app/services/billing.server.ts
./app/services/capability-registry-core.ts
./app/services/capability-registry.server.ts
./app/services/dashboard-actions.server.ts
./app/services/dashboard-data.server.ts
./app/services/dashboard-loader.server.ts
./app/services/gift.server.ts
./app/services/gmail-autopilot.server.ts
./app/services/gmail-replies.server.ts
./app/services/heartbeat.server.ts
./app/services/judicial-system.server.ts
./app/services/legal-tax-core.ts
./app/services/legal-tax-engine.server.ts
./app/services/live-connection.server.ts
./app/services/mail-transport.server.ts
./app/services/manufaktur-apex-core.ts
./app/services/manufaktur-apex.server.ts
./app/services/marketplace-catalog.ts
./app/services/marketplace-flywheel.server.ts
./app/services/meta-supervisor.server.ts
./app/services/module-access-core.ts
./app/services/module-access.ts
./app/services/monitor-auth.server.ts
./app/services/monitor-data.server.ts
./app/services/orchestration-harmony.server.ts
./app/services/owner-directive-core.ts
./app/services/owner-directive.server.ts
./app/services/platform-connectors-core.ts
./app/services/platform-connectors.server.ts
./app/services/pricing.ts
./app/services/returns-guide.ts
./app/services/returns.server.ts
./app/services/revenue-booking.server.ts
./app/services/reward-types.ts
./app/services/ring-size.ts
./app/services/roster-apex.ts
./app/services/roster-departments.ts
./app/services/roster-panels.ts
./app/services/roster-team.ts
./app/services/roster-tools.ts
./app/services/shop-profile.server.ts
./app/services/shop-settings.server.ts
./app/services/silent-revenue.server.ts
./app/services/storage-janitor.server.ts
./app/services/triple-audit-gate.server.ts
./app/services/ucp-profile.server.ts
./app/services/unsubscribe.server.ts
./app/services/vault-downloads.server.ts
./app/services/vault-treasury-core.ts
./app/services/vault-treasury.server.ts
./backup/app._index.tsx.bak-old
./build/client
./build/server
./build/client/assets
./build/client/app-icon.png
./build/client/app-icon.svg
./build/client/favicon.ico
./build/client/icon-192.png
./build/client/icon-512.png
./build/client/icon-maskable-512.png
./build/client/manifest.json
./build/client/sw.js
./build/client/assets/api.cron-l0sNRNKZ.js
./build/client/assets/api.finance.payment-ledger-l0sNRNKZ.js
./build/client/assets/api.legal-tax-l0sNRNKZ.js
./build/client/assets/api.live-traces-l0sNRNKZ.js
./build/client/assets/api.rewards-export-l0sNRNKZ.js
./build/client/assets/api.sidekick._category._action-l0sNRNKZ.js
./build/client/assets/api.treasury-audit-l0sNRNKZ.js
./build/client/assets/api.ucp._op-l0sNRNKZ.js
./build/client/assets/api.unsubscribe-l0sNRNKZ.js
./build/client/assets/api.vault._kind._id-l0sNRNKZ.js
./build/client/assets/api.whatsapp.messages-l0sNRNKZ.js
./build/client/assets/api.workshop.daily-batch.zip-l0sNRNKZ.js
./build/client/assets/app-Cs0J4HAX.js
./build/client/assets/app.additional-35WoEkTm.js
./build/client/assets/app._index-CQY2fyrg.js
./build/client/assets/app._index-CY2YZoS7.js
./build/client/assets/auth._-l0sNRNKZ.js
./build/client/assets/CoinRain-STfENeWy.js
./build/client/assets/d3-org-chart-CkpL57_A.js
./build/client/assets/EnterpriseOsOrganigram-BsHEbkPJ.css
./build/client/assets/EnterpriseOsOrganigram-CeJ0nkke.js
./build/client/assets/entry.client-D5-Rut0T.js
./build/client/assets/feeds._channel.xml-l0sNRNKZ.js
./build/client/assets/gift._token-BNsYEOb-.js
./build/client/assets/index-AXhOVeAd.js
./build/client/assets/jsx-runtime-Cot_sQQk.js
./build/client/assets/manifest-c2567e28.js
./build/client/assets/mobile-monitor-DZQ2Xl9W.js
./build/client/assets/privacy-CaCikBqh.js
./build/client/assets/returns-portal-DML7t5a4.js
./build/client/assets/root-BWPQlm-j.js
./build/client/assets/route-2RlJK6ws.js
./build/client/assets/route-CNPfFM0M.css
./build/client/assets/server-build-CNPfFM0M.css
./build/client/assets/shop_._md-l0sNRNKZ.js
./build/client/assets/support-ClIN-AgG.js
./build/client/assets/ucp.schemas._key-l0sNRNKZ.js
./build/client/assets/webhooks-l0sNRNKZ.js
./build/client/assets/webhooks.app.scopes_update-l0sNRNKZ.js
./build/client/assets/webhooks.app.uninstalled-l0sNRNKZ.js
./build/client/assets/webhooks.products.update-l0sNRNKZ.js
./build/client/assets/_._well-known.ucp-l0sNRNKZ.js
./build/server/assets
./build/server/index.js
./build/server/assets/EnterpriseOsOrganigram-CUPhHoj0.js
./build/server/assets/server-build-H8ciwI0j.js
./docs/APP_STORE_LISTING.md
./docs/ATELIERPILOT_MASTER_BLUEPRINT.md
./prisma/migrations
./prisma/dev.sqlite
./prisma/schema.prisma
./prisma/migrations/0_init
./prisma/migrations/0_init/migration.sql
./public/app-icon.png
./public/app-icon.svg
./public/favicon.ico
./public/icon-192.png
./public/icon-512.png
./public/icon-maskable-512.png
./public/manifest.json
./public/sw.js
./scripts/agent-performance.test.mjs
./scripts/agent-roster.test.mjs
./scripts/ai-provider-router.test.mjs
./scripts/approval-exceptions.test.mjs
./scripts/appstore-check.mjs
./scripts/capability-registry.test.mjs
./scripts/ensure-env.mjs
./scripts/legal-tax-core.test.mjs
./scripts/manufaktur-apex-core.test.mjs
./scripts/migrate-agent-numbers.mjs
./scripts/owner-directive-core.test.mjs
./scripts/owner-shop-domain.test.mjs
./scripts/platform-connectors-core.test.mjs
./scripts/vault-treasury.test.mjs

## 2. PACKAGE.JSON
{
  "name": "wertarbeit-ai",
  "private": true,
  "scripts": {
    "build": "react-router build",
    "dev": "shopify app dev",
    "config:link": "shopify app config link",
    "generate": "shopify app generate",
    "deploy": "shopify app deploy",
    "config:use": "shopify app config use",
    "env": "shopify app env",
    "start": "react-router-serve ./build/server/index.js",
    "docker-start": "npm run setup && npm run start",
    "start:prod": "prisma generate && prisma db push --skip-generate && react-router-serve ./build/server/index.js",
    "setup": "prisma generate && prisma db push",
    "migrate:agent-numbers": "node scripts/migrate-agent-numbers.mjs",
    "lint": "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
    "shopify": "shopify",
    "prisma": "prisma",
    "graphql-codegen": "graphql-codegen",
    "vite": "vite",
    "typecheck": "react-router typegen && tsc --noEmit",
    "appstore:check": "node scripts/appstore-check.mjs"
  },
  "type": "module",
  "engines": {
    "node": ">=22.12"
  },
  "dependencies": {
    "@ai-sdk/google": "^4.0.124",
    "@dagrejs/dagre": "^3.1.3",
    "@prisma/client": "^6.19.3",
    "@react-router/dev": "7.18.2",
    "@react-router/fs-routes": "7.18.2",
    "@react-router/node": "7.18.2",
    "@react-router/serve": "7.18.2",
    "@shopify/app-bridge-react": "^4.2.4",
    "@shopify/shopify-app-react-router": "^4.0.0",
    "@shopify/shopify-app-session-storage-prisma": "^11.0.0",
    "@xyflow/react": "^13.0.3",
    "ai": "^7.0.179",
    "archiver": "^8.0.0",
    "d3": "^7.9.2",
    "d3-org-chart": "^3.1.1",
    "ffmpeg-static": "^5.3.0",
    "imapflow": "^2.12.2",
    "isbot": "^5.1.31",
    "lucide-react": "^1.79.0",
    "mailparser": "^3.15.0",
    "minisearch": "^7.2.0",
    "node-cron": "^4.6.0",
    "nodemailer": "^10.6.1",
    "pdf-lib": "^1.17.1",
    "prisma": "^6.19.3",
    "qrcode": "^1.5.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "7.18.2",
    "sharp": "^0.35.5",
    "vite-tsconfig-paths": "^5.1.4",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@shopify/api-codegen-preset": "^1.2.0",
    "@shopify/polaris-types": "^2.0.0",
    "@types/archiver": "^8.0.0",
    "@types/d3": "^7.4.3",
    "@types/eslint": "^9.6.1",
    "@types/mailparser": "^3.9.0",
    "@types/node": "^22.18.8",
    "@types/nodemailer": "^8.0.2",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^18.3.25",
    "@types/react-dom": "^18.3.7",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.57.1",
    "eslint-import-resolver-typescript": "^3.10.1",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^4.6.2",
    "graphql-config": "^5.1.1",
    "prettier": "^3.6.2",
    "typescript": "^5.9.3",
    "vite": "^6.3.6"
  },
  "workspaces": [
    "extensions/*"
  ],
  "trustedDependencies": [
    "@shopify/plugin-cloudflare"
  ],
  "overrides": {
    "p-map": "^4.0.0",
    "qs": "^6.16.0"
  },
  "resolutions": {
    "qs": "^6.16.0"
  },
  "pnpm": {
    "overrides": {
      "qs": "^6.16.0"
    }
  },
  "author": "sandr"
}


## 3. CSS & TAILWIND CONFIG

--- DATEI: app/components/dashboard/EnterpriseOsOrganigram.css ---
@import "@xyflow/react/dist/style.css" layer(xyflow);
@layer xyflow, enterprise-os;

@layer enterprise-os {
  .eos-shell {
    --eos-obsidian: #0f172a;
    --eos-gold: #c5a059;
    --eos-platinum: #f8fafc;
    display: grid;
    gap: 12px;
    color: var(--eos-platinum);
    background: var(--eos-obsidian);
  }

  .eos-header,
  .eos-panel,
  .eos-inspector {
    background: #131c2e;
    border: 1px solid var(--eos-gold);
    border-radius: 12px;
  }

  .eos-header {
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .eos-toolbar,
  .eos-toolbar-group,
  .eos-breadcrumb,
  .eos-legend,
  .eos-inspector-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
  }

  .eos-toolbar {
    justify-content: space-between;
  }

  .eos-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 34px;
    padding: 6px 10px;
    color: #f7e7ce;
    background: #0f172a;
    border: 1px solid #c5a059;
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }

  .eos-button[aria-pressed="true"],
  .eos-button:hover:not(:disabled) {
    color: #f7e7ce;
    background: #c5a059;
  }

  .eos-button:disabled {
    opacity: .48;
    cursor: not-allowed;
  }

  .eos-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(270px, 330px);
    gap: 12px;
    align-items: start;
  }

  .eos-panel {
    min-width: 0;
    overflow: hidden;
    padding: 8px;
  }

  .eos-flow {
    width: 100%;
    height: min(76vh, 880px);
    min-height: 620px;
    overflow: hidden;
    border: 1px solid #334155;
    border-radius: 10px;
    background: #111827;
  }

  .eos-node {
    display: grid;
    gap: 6px;
    min-height: 100%;
    box-sizing: border-box;
    padding: 10px;
    color: #e2e8f0;
    background: linear-gradient(155deg, #f8fafc, #e2e8f0);
    border: 1px solid var(--node-accent, #c5a059);
    border-radius: 10px;
    box-shadow: 0 7px 20px rgb(0 0 0 / 18%);
  }

  .eos-node-dark {
    color: #f8fafc;
    background: linear-gradient(155deg, #1e293b, #111827);
  }

  .eos-new-interface {
    animation: eosGoldPulse 1.4s ease-in-out infinite;
  }

  .eos-node-title {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--node-accent, #9a7b3e);
    font-size: 12px;
    font-weight: 800;
    line-height: 1.25;
  }

  .eos-node-detail {
    color: inherit;
    opacity: .82;
    font-size: 10px;
    line-height: 1.35;
  }

  .eos-node-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: auto;
  }

  .eos-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    color: #f7e7ce;
    background: #111827;
    border: 1px solid rgb(197 160 89 / 70%);
    border-radius: 999px;
    font-size: 9px;
    white-space: nowrap;
  }

  .eos-edge-path {
    stroke-dasharray: 10 6;
    animation: apexDashFlow 1.4s linear infinite;
    filter: drop-shadow(0 0 6px currentColor);
    pointer-events: stroke !important;
  }

  .eos-edge-pulse {
    filter: drop-shadow(0 0 8px #fffbeb);
  }

  .react-flow__edges {
    z-index: 20 !important;
    pointer-events: all !important;
  }

  .react-flow__node-group {
    z-index: 1 !important;
  }

  .react-flow__edge-path {
    pointer-events: stroke !important;
  }

  .eos-edge-packet {
    padding: 4px 7px;
    color: #f8fafc;
    background: #111827;
    border: 1px solid #c5a059;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 35%);
    font-size: 9px;
    white-space: nowrap;
    pointer-events: all;
  }

  .eos-dimmed {
    opacity: .14 !important;
    filter: grayscale(100%);
  }

  .eos-lit {
    opacity: 1 !important;
    filter: none;
  }

  .eos-inspector {
    position: sticky;
    top: 10px;
    display: grid;
    gap: 10px;
    max-height: 82vh;
    overflow: auto;
    padding: 12px;
    border-color: #475569;
    background: linear-gradient(155deg, #1e293b, #111827);
  }

  .eos-inspector-section {
    display: grid;
    gap: 5px;
    padding-top: 8px;
    border-top: 1px solid #334155;
    font-size: 11px;
  }

  .eos-glass-layers {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .eos-glass-layer {
    padding: 10px;
    color: #f8fafc;
    background: #131c2e;
    border: 1px solid #c5a059;
    border-radius: 10px;
    box-shadow: 0 8px 18px rgb(15 23 42 / 12%);
  }

  .eos-search-dialog {
    width: min(620px, calc(100vw - 24px));
    max-height: 82vh;
    overflow: hidden;
    color: #e2e8f0;
    background: #111827;
    border: 1px solid #c5a059;
    border-radius: 12px;
    box-shadow: 0 24px 70px rgb(0 0 0 / 60%);
    padding: 0;
  }

  .eos-search-dialog::backdrop {
    background: rgb(3 7 18 / 76%);
    backdrop-filter: blur(3px);
  }

  .eos-search-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #334155;
  }

  .eos-search-heading h2 {
    margin: 0;
    color: #f7e7ce;
    font-size: 16px;
  }

  .eos-search-heading p {
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 11px;
  }

  .eos-search-input {
    width: 100%;
    padding: 14px;
    box-sizing: border-box;
    color: #f8fafc;
    background: #111827;
    border: 0;
    border-bottom: 1px solid #334155;
    outline: none;
    font: inherit;
  }

  .eos-search-input:focus-visible {
    box-shadow: inset 0 0 0 2px #c5a059;
  }

  .eos-search-results {
    display: grid;
    gap: 4px;
    max-height: 55vh;
    overflow: auto;
    padding: 6px;
    overscroll-behavior: contain;
  }

  .eos-search-option {
    display: grid;
    gap: 4px;
    width: 100%;
    padding: 10px;
    color: #e2e8f0;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font: inherit;
  }

  .eos-search-option small {
    color: #94a3b8;
    font-size: 10px;
  }

  .eos-search-option:hover,
  .eos-search-option[aria-selected="true"] {
    color: #111827;
    background: #c5a059;
  }

  .eos-search-option:hover small,
  .eos-search-option[aria-selected="true"] small {
    color: #1e293b;
  }

  .eos-search-empty {
    margin: 0;
    padding: 18px 10px;
    color: #94a3b8;
    text-align: center;
  }

  .eos-search-footer {
    padding: 9px 14px;
    color: #94a3b8;
    background: #0f172a;
    border-top: 1px solid #334155;
    font-size: 10px;
  }

  .eos-main-grid {
    display: block;
    position: relative;
    min-width: 0;
  }

  .eos-panel {
    position: relative;
    min-width: 0;
    overflow: hidden;
  }

  .eos-flow {
    width: 100%;
    height: min(78vh, 1050px);
    min-height: 860px;
    overflow: hidden;
    border-color: #c5a059;
    background: #0f172a;
  }

  .eos-column-node {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
    color: #f8fafc;
    background: #0f172a;
    border: 1px solid #c5a059;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgb(0 0 0 / 28%);
  }

  .eos-column-selected {
    outline: 2px solid #c5a059;
  }

  .eos-column-heading {
    position: sticky;
    top: 0;
    z-index: 2;
    display: grid;
    gap: 5px;
    padding: 12px;
    color: #f7e7ce;
    background: #131c2e;
    border-bottom: 1px solid #c5a059;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .035em;
  }

  .eos-column-heading small {
    color: #cbd5e1;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0;
  }

  .eos-column-content {
    display: grid;
    align-content: start;
    gap: 9px;
    min-height: 0;
    overflow: auto;
    padding: 9px;
    overscroll-behavior: contain;
  }

  .eos-column-node[data-column-id="column-3"] .eos-column-content {
    gap: 55px;
  }

  .eos-entity[data-entity-id="process-orchestration"] > .eos-entity-children {
    gap: 55px;
  }

  .eos-entity {
    display: grid;
    align-content: start;
    gap: 5px;
    min-width: 0;
    padding: 8px;
    color: #f8fafc;
    background: var(--entity-background, #334155);
    border: 1px solid var(--node-accent, #c5a059);
    border-radius: 8px;
    box-shadow: 0 3px 9px rgb(15 23 42 / 10%);
    transition: opacity .16s ease, filter .16s ease, box-shadow .16s ease;
  }

  .eos-entity-section {
    background: var(--entity-background, #334155);
  }

  .eos-entity-heading {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    padding: 0;
    color: var(--node-accent, #9a7b3e);
    text-align: left;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.3;
  }

  .eos-entity-link {
    width: 100%;
    background: transparent;
    border: 0;
    cursor: pointer;
    font: inherit;
  }

  .eos-entity-link:hover,
  .eos-entity-link:focus-visible {
    color: #f7e7ce;
    text-decoration: underline;
    text-decoration-color: #c5a059;
    outline: none;
  }

  .eos-entity-description {
    margin: 0;
    color: #e2e8f0;
    font-size: 9px;
    line-height: 1.35;
  }

  .eos-entity-children {
    display: grid;
    align-content: start;
    gap: 6px;
    min-width: 0;
  }

  .eos-entity-layout-row {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .eos-entity-layout-grid {
    grid-template-columns: repeat(4, minmax(140px, 1fr)) minmax(180px, 1.2fr);
  }

  .eos-entity-layout-split {
    grid-template-columns: minmax(0, 1fr) minmax(105px, .42fr);
    align-items: start;
  }

  .eos-entity-layout-split > .eos-entity {
    min-width: 0;
  }

  .eos-entity .eos-node-meta {
    margin-top: 2px;
  }

  .eos-entity .eos-chip {
    white-space: normal;
  }

  .eos-canvas-legend {
    position: absolute;
    right: 15px;
    bottom: 15px;
    z-index: 8;
    display: grid;
    gap: 4px;
    width: min(250px, calc(100% - 30px));
    max-height: 42%;
    overflow: auto;
    padding: 9px;
    color: #f8fafc;
    background: rgb(17 24 39 / 94%);
    border: 1px solid #c5a059;
    border-radius: 10px;
    box-shadow: 0 8px 26px rgb(0 0 0 / 45%);
  }

  .eos-hover-tooltip {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 9;
    display: grid;
    gap: 5px;
    width: min(320px, calc(100% - 28px));
    padding: 10px 12px;
    color: #e2e8f0;
    background: rgb(17 24 39 / 94%);
    border: 1px solid #c5a059;
    border-radius: 9px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 42%);
    pointer-events: none;
    font-size: 10px;
    line-height: 1.4;
  }

  .eos-hover-tooltip strong {
    color: #f7e7ce;
  }

  .eos-hover-tooltip small {
    color: #cbd5e1;
    font-size: 9px;
  }

  .eos-canvas-legend > strong {
    color: #f7e7ce;
    font-size: 10px;
    letter-spacing: .08em;
  }

  .eos-canvas-legend button {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px 5px;
    color: #e2e8f0;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    font: inherit;
    font-size: 9px;
  }

  .eos-canvas-legend button:hover,
  .eos-canvas-legend button:focus-visible,
  .eos-canvas-legend button[aria-pressed="false"] {
    border-color: #c5a059;
    outline: none;
  }

  .eos-inspector {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 10;
    display: grid;
    gap: 10px;
    width: min(350px, calc(100% - 28px));
    max-height: calc(100% - 28px);
    overflow: auto;
    padding: 12px;
    border-color: #c5a059;
    background: linear-gradient(155deg, rgb(30 41 59 / 97%), rgb(17 24 39 / 97%));
    box-shadow: 0 16px 42px rgb(0 0 0 / 55%);
  }

  .eos-column-title,
  .eos-entity-topline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
  }

  .eos-column-title > span {
    min-width: 0;
  }

  .eos-info-button {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    color: #f8fafc;
    background: rgb(15 23 42 / 70%);
    border: 1px solid #c5a059;
    border-radius: 50%;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    line-height: 1;
  }

  .eos-info-button:hover,
  .eos-info-button:focus-visible {
    color: #0f172a;
    background: #c5a059;
    outline: 2px solid #f8fafc;
    outline-offset: 1px;
  }

  .eos-entity-link {
    color: #f8fafc;
  }

  .eos-inspector,
  .eos-search-dialog {
    color: #f8fafc;
    background: #131c2e;
  }

  .eos-inspector-section {
    color: #f8fafc;
  }

  .eos-fullscreen:fullscreen {
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    padding: 12px;
    background: #0b1120;
  }

  .eos-fullscreen:fullscreen .eos-flow {
    height: calc(100vh - 260px);
    min-height: 860px;
  }

  .eos-shell {
    color: #1e293b;
    background: #f8fafc;
  }

  .eos-header {
    color: #f8fafc;
    background: #1e293b;
    border-color: #475569;
  }

  .eos-panel {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .eos-flow {
    background: #f8fafc;
    border-color: #64748b;
  }

  .eos-column-node {
    color: #1e293b;
    background: #ffffff;
    border-color: #94a3b8;
    box-shadow: 0 8px 22px rgb(15 23 42 / 12%);
  }

  .eos-column-heading {
    color: #ffffff;
    background: #1e293b;
    border-bottom-color: #94a3b8;
  }

  .eos-column-heading small {
    color: #e2e8f0;
  }

  .eos-column-title > span {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .eos-column-content {
    background: #f8fafc;
  }

  .eos-entity,
  .eos-entity.eos-node-dark {
    color: var(--entity-foreground, #1e293b);
    background: var(--entity-background, #ebf2fa);
    border-color: rgb(30 41 59 / 24%);
    box-shadow: 0 3px 9px rgb(15 23 42 / 10%);
  }

  .eos-entity-heading,
  .eos-entity-link,
  .eos-entity-description {
    color: var(--entity-foreground, #1e293b);
  }

  .eos-entity-link:hover,
  .eos-entity-link:focus-visible {
    color: #0f172a;
    background: rgb(255 255 255 / 28%);
    text-decoration-color: #334e68;
  }

  .eos-entity-icon {
    flex: 0 0 auto;
  }

  .eos-entity .eos-chip {
    color: #1e293b;
    background: rgb(248 250 252 / 84%);
    border-color: rgb(30 41 59 / 30%);
  }

  .eos-entity[data-entity-id="pillar-workflow"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #d6e6f4 !important;
  }

  .eos-entity[data-entity-id="pillar-communication"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5e9ce !important;
  }

  .eos-entity[data-entity-id="pillar-integration"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5d6d8 !important;
  }

  .eos-entity[data-entity-id="pillar-support"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #d5eceb !important;
  }

  .eos-entity[data-entity-id="infrastructure"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #ebf2fa !important;
  }

  .eos-entity[data-entity-id="academic-personnel"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #ebf2fa !important;
  }

  .eos-entity[data-entity-id="certification-gateways"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5f3fa !important;
  }

  .eos-canvas-legend {
    color: #1e293b;
    background: rgb(255 255 255 / 97%);
    border-color: #64748b;
    box-shadow: 0 8px 26px rgb(15 23 42 / 18%);
  }

  .eos-canvas-legend > strong,
  .eos-canvas-legend button {
    color: #1e293b;
  }

  .eos-canvas-legend button:hover,
  .eos-canvas-legend button:focus-visible,
  .eos-canvas-legend button[aria-pressed="false"] {
    border-color: #334e68;
  }

  .eos-hover-tooltip,
  .eos-inspector,
  .eos-glass-layer,
  .eos-search-dialog {
    color: #1e293b;
    background: rgb(255 255 255 / 98%);
    border-color: #64748b;
    box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
  }

  .eos-hover-tooltip strong,
  .eos-inspector-section,
  .eos-search-heading h2 {
    color: #1e293b;
  }

  .eos-info-button {
    color: #1e293b;
    background: rgb(255 255 255 / 88%);
    border-color: #64748b;
  }

  .eos-info-button:hover,
  .eos-info-button:focus-visible {
    color: #ffffff;
    background: #1e3a5f;
    outline-color: #ffffff;
  }

  .eos-search-input {
    color: #1e293b;
    background: #ffffff;
    border-bottom-color: #cbd5e1;
  }

  .eos-search-heading {
    border-bottom-color: #cbd5e1;
  }

  .eos-search-heading p,
  .eos-search-option small,
  .eos-search-empty,
  .eos-search-footer,
  .eos-hover-tooltip small {
    color: #475569;
  }

  .eos-search-option {
    color: #1e293b;
  }

  .eos-search-option:hover,
  .eos-search-option[aria-selected="true"] {
    color: #ffffff;
    background: #1e3a5f;
  }

  .eos-search-option:hover small,
  .eos-search-option[aria-selected="true"] small {
    color: #e2e8f0;
  }

  .eos-search-footer {
    background: #f1f5f9;
    border-top-color: #cbd5e1;
  }

  .eos-inspector-section {
    border-top-color: #cbd5e1;
  }

  .eos-dimmed {
    opacity: .16 !important;
    filter: grayscale(100%);
  }

  @keyframes apexDashFlow {
    to { stroke-dashoffset: -26; }
  }

  @keyframes eosGoldPulse {
    0%, 100% { box-shadow: 0 7px 20px rgb(0 0 0 / 18%), 0 0 0 0 rgb(197 160 89 / 18%); }
    50% { box-shadow: 0 7px 20px rgb(0 0 0 / 18%), 0 0 0 5px rgb(197 160 89 / 45%); }
  }

  @media (max-width: 1000px) {
    .eos-inspector {
      max-height: calc(100% - 20px);
    }

    .eos-flow {
      height: 75vh;
      min-height: 860px;
    }

    .eos-entity-layout-grid {
      grid-template-columns: repeat(2, minmax(145px, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .eos-edge-path {
      animation: none;
    }
    .eos-new-interface {
      animation: none;
    }
  }

  /* ---- Hierarchie-Baum (d3-org-chart) ---- */
  .eos-tree-wrap {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .eos-tree-host {
    width: 100%;
    height: 720px;
    overflow: hidden;
    background: #f8fafc;
    border: 1px solid #c5a059;
    border-radius: 10px;
  }

  .eos-tree-card {
    box-sizing: border-box;
    display: grid;
    align-content: start;
    gap: 3px;
    padding: 8px 10px;
    overflow: hidden;
    color: #ffffff;
    background: var(--lvl, #334e68);
    border: 2px solid rgb(255 255 255 / 55%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgb(15 23 42 / 25%);
    font-family: inherit;
    transition: opacity .2s ease, filter .2s ease;
    cursor: pointer;
  }

  .eos-tree-card:focus-visible {
    outline: 3px solid #c5a059;
    outline-offset: 2px;
  }

  .eos-tree-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
  }

  .eos-tree-top strong {
    font-size: 12px;
    line-height: 1.25;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .eos-tree-card small,
  .eos-tree-card em {
    font-size: 10px;
    font-style: normal;
    opacity: .9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .eos-tree-badge {
    justify-self: start;
    padding: 1px 6px;
    color: #131c2e;
    background: #c5a059;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 700;
  }

  .eos-tree-toggle {
    position: relative;
    z-index: 2;
    padding: 2px 8px;
    color: #131c2e;
    background: #f7e7ce;
    border: 1px solid #c5a059;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  .eos-tree-link-hot {
    filter: drop-shadow(0 0 4px #c5a059);
    stroke-dasharray: 10 6;
    animation: apexDashFlow 1.2s linear infinite;
  }

  .eos-tree-hint {
    color: #475569;
    font-size: 11px;
  }

  .eos-tree-error {
    margin: 0;
    padding: 8px 10px;
    color: #7f1d1d;
    background: #fee2e2;
    border: 1px solid #dc2626;
    border-radius: 8px;
    font-size: 12px;
  }

  /* ---- Glasplatten-Schichtenblick ---- */
  .eos-glass-stack {
    display: grid;
    gap: 10px;
    padding: 6px 6px 6px 0;
  }

  .eos-glass-plate {
    display: grid;
    gap: 8px;
    padding: 10px 12px;
    color: #131c2e;
    background: linear-gradient(135deg, rgb(255 255 255 / 92%), rgb(226 232 240 / 78%));
    border: 1px solid rgb(100 116 139 / 55%);
    border-left: 6px solid var(--lvl, #334e68);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 14%), inset 0 1px 0 rgb(255 255 255 / 80%);
    backdrop-filter: blur(4px);
    transition: opacity .2s ease, filter .2s ease;
  }

  .eos-glass-plate > header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .eos-glass-plate > header > strong {
    flex: 1 1 280px;
    font-size: 13px;
  }

  .eos-glass-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .eos-glass-item {
    padding: 4px 9px;
    color: #ffffff;
    background: var(--lvl, #334e68);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
  }

  .eos-glass-human {
    color: #131c2e;
    background: #c5a059;
    cursor: default;
  }

  /* ---- 16:9-Breitbild fÃ¼r die 4-Spalten-Ansicht ---- */
  .eos-flow {
    aspect-ratio: 16 / 9;
    height: auto;
    min-height: 560px;
    max-height: 960px;
  }

  /* ---- Kompakte 16:9-Verdichtung der 4 Spalten (Ebene 0/1 bleibt niedrig, kein Riesenturm) ---- */
  .eos-column-node[data-column-id="column-3"] .eos-column-content,
  .eos-entity[data-entity-id="process-orchestration"] > .eos-entity-children {
    gap: 8px;
  }

  .eos-column-content {
    gap: 6px;
    padding: 6px;
  }

  .eos-entity {
    padding: 5px 6px;
    gap: 3px;
  }

  /* Buttons erben sonst die 16-px-Browserschrift und sprengen die kompakten Karten. */
  .eos-entity-heading,
  .eos-entity-link,
  .eos-entity-link strong {
    font-size: 11px;
    line-height: 1.25;
    font-weight: 800;
  }

  .eos-column-title {
    font-size: 11px;
  }

  .eos-entity-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .eos-entity[data-entity-id="constitutional"] > .eos-entity-children,
  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children {
    gap: 6px;
  }

  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children > .eos-entity {
    align-content: start;
  }

  /* Spalte 3 kompakt: Platzhalter-Beschreibungen ausblenden (Details Ã¼ber â“˜ und Unterseiten). */
  .eos-entity[data-entity-id^="pillar-"] .eos-entity-description,
  .eos-entity[data-entity-id="planning-phases"] .eos-entity-description,
  .eos-entity[data-entity-id="world-ecosystem"] .eos-entity-description,
  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children .eos-entity-description {
    display: none;
  }

  .eos-entity[data-entity-id="planning-phases"] .eos-entity,
  .eos-entity[data-entity-id^="pillar-"] .eos-entity-card {
    padding: 3px 6px;
  }

  /* Spalte 3: die Ablauf-Phasen als eine schlanke Zeile, damit die 4 SÃ¤ulen Platz behalten. */
  .eos-entity[data-entity-id="planning-phases"] > .eos-entity-children {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
  }

  .eos-entity[data-entity-id="planning-phases"] .eos-entity-card {
    padding: 2px 6px;
    min-height: 0;
  }

  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children > .eos-entity {
    padding: 4px;
    gap: 3px;
  }

  .eos-entity[data-entity-id^="pillar-"] > .eos-entity-children {
    gap: 3px;
  }

  .eos-entity[data-entity-id="four-pillars"] .eos-entity-card {
    padding: 3px 5px;
  }

  .eos-entity[data-entity-id="four-pillars"] .eos-entity-heading,
  .eos-entity[data-entity-id="four-pillars"] .eos-entity-link strong {
    font-size: 10px;
  }

  /* Spalten 1, 2 und 4: Inhalte gleichmÃ¤ÃŸig auf die volle SpaltenhÃ¶he verteilen (kein halbleerer Streifen). */
  .eos-column-node[data-column-id="column-1"] .eos-column-content,
  .eos-column-node[data-column-id="column-2"] .eos-column-content,
  .eos-column-node[data-column-id="column-4"] .eos-column-content {
    align-content: space-between;
  }

  /* Spalte 1 ist nur 310 px breit: Akademie und Gateways untereinander statt gequetscht nebeneinander. */
  .eos-entity[data-entity-id="academic-qualification"] > .eos-entity-children {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Leitungen, die fremde Spalten kreuzen, bleiben sichtbar, verdecken aber keine Texte mehr. */
  .react-flow__edge-path {
    stroke-linecap: round;
  }

  /* MiniMap wÃ¼rde die feste Legende unten rechts Ã¼berdecken. */
  .eos-flow .react-flow__minimap {
    display: none;
  }

  /* Eigene Anker je Leitung: die Handle-Punkte bleiben unsichtbar, aber exakt verteilt. */
  .eos-lane-handle {
    width: 3px;
    height: 3px;
    min-width: 0;
    min-height: 0;
    background: transparent;
    border: 0;
    pointer-events: none;
  }

  /* Legende unten rechts, nie Ã¼ber den Spalten: im Flow-Modus kompakt zweispaltig. */
  .eos-panel[data-mode="flow"] .eos-canvas-legend {
    right: 10px;
    bottom: 10px;
    width: 230px;
    max-height: none;
    grid-template-columns: 1fr 1fr;
    gap: 2px 6px;
    padding: 6px 8px;
  }

  .eos-panel[data-mode="flow"] .eos-canvas-legend > strong {
    grid-column: 1 / -1;
  }

  /* Baum/Glasplatten: Legende nicht Ã¼ber den Karten schweben lassen, sondern darunter als Leiste. */
  .eos-panel[data-mode="tree"] .eos-canvas-legend,
  .eos-panel[data-mode="glass"] .eos-canvas-legend,
  .eos-panel[data-mode="touch"] .eos-canvas-legend {
    position: static;
    width: auto;
    max-height: none;
    margin-top: 8px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .eos-panel[data-mode="tree"] .eos-canvas-legend > strong,
  .eos-panel[data-mode="glass"] .eos-canvas-legend > strong,
  .eos-panel[data-mode="touch"] .eos-canvas-legend > strong {
    grid-column: 1 / -1;
  }

  @media (prefers-reduced-motion: reduce) {
    .eos-tree-link-hot {
      animation: none;
    }
  }
}


--- DATEI: app/routes/_index/styles.module.css ---
.index {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
  padding: 1rem;
}

.heading,
.text {
  padding: 0;
  margin: 0;
}

.text {
  font-size: 1.2rem;
  padding-bottom: 2rem;
}

.content {
  display: grid;
  gap: 2rem;
}

.form {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0 auto;
  gap: 1rem;
}

.label {
  display: grid;
  gap: 0.2rem;
  max-width: 20rem;
  text-align: left;
  font-size: 1rem;
}

.input {
  padding: 0.4rem;
}

.button {
  padding: 0.4rem;
}

.list {
  list-style: none;
  padding: 0;
  padding-top: 3rem;
  margin: 0;
  display: flex;
  gap: 2rem;
}

.list > li {
  max-width: 20rem;
  text-align: left;
}

@media only screen and (max-width: 50rem) {
  .list {
    display: block;
  }

  .list > li {
    padding-bottom: 1rem;
  }
}


## 4. BESTEHENDE ORGANIGRAMM- & HAUPTSEITEN-DATEIEN

--- DATEI: app/components/dashboard/EnterpriseOsOrganigram.css ---
@import "@xyflow/react/dist/style.css" layer(xyflow);
@layer xyflow, enterprise-os;

@layer enterprise-os {
  .eos-shell {
    --eos-obsidian: #0f172a;
    --eos-gold: #c5a059;
    --eos-platinum: #f8fafc;
    display: grid;
    gap: 12px;
    color: var(--eos-platinum);
    background: var(--eos-obsidian);
  }

  .eos-header,
  .eos-panel,
  .eos-inspector {
    background: #131c2e;
    border: 1px solid var(--eos-gold);
    border-radius: 12px;
  }

  .eos-header {
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .eos-toolbar,
  .eos-toolbar-group,
  .eos-breadcrumb,
  .eos-legend,
  .eos-inspector-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
  }

  .eos-toolbar {
    justify-content: space-between;
  }

  .eos-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 34px;
    padding: 6px 10px;
    color: #f7e7ce;
    background: #0f172a;
    border: 1px solid #c5a059;
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
  }

  .eos-button[aria-pressed="true"],
  .eos-button:hover:not(:disabled) {
    color: #f7e7ce;
    background: #c5a059;
  }

  .eos-button:disabled {
    opacity: .48;
    cursor: not-allowed;
  }

  .eos-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(270px, 330px);
    gap: 12px;
    align-items: start;
  }

  .eos-panel {
    min-width: 0;
    overflow: hidden;
    padding: 8px;
  }

  .eos-flow {
    width: 100%;
    height: min(76vh, 880px);
    min-height: 620px;
    overflow: hidden;
    border: 1px solid #334155;
    border-radius: 10px;
    background: #111827;
  }

  .eos-node {
    display: grid;
    gap: 6px;
    min-height: 100%;
    box-sizing: border-box;
    padding: 10px;
    color: #e2e8f0;
    background: linear-gradient(155deg, #f8fafc, #e2e8f0);
    border: 1px solid var(--node-accent, #c5a059);
    border-radius: 10px;
    box-shadow: 0 7px 20px rgb(0 0 0 / 18%);
  }

  .eos-node-dark {
    color: #f8fafc;
    background: linear-gradient(155deg, #1e293b, #111827);
  }

  .eos-new-interface {
    animation: eosGoldPulse 1.4s ease-in-out infinite;
  }

  .eos-node-title {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--node-accent, #9a7b3e);
    font-size: 12px;
    font-weight: 800;
    line-height: 1.25;
  }

  .eos-node-detail {
    color: inherit;
    opacity: .82;
    font-size: 10px;
    line-height: 1.35;
  }

  .eos-node-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: auto;
  }

  .eos-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    color: #f7e7ce;
    background: #111827;
    border: 1px solid rgb(197 160 89 / 70%);
    border-radius: 999px;
    font-size: 9px;
    white-space: nowrap;
  }

  .eos-edge-path {
    stroke-dasharray: 10 6;
    animation: apexDashFlow 1.4s linear infinite;
    filter: drop-shadow(0 0 6px currentColor);
    pointer-events: stroke !important;
  }

  .eos-edge-pulse {
    filter: drop-shadow(0 0 8px #fffbeb);
  }

  .react-flow__edges {
    z-index: 20 !important;
    pointer-events: all !important;
  }

  .react-flow__node-group {
    z-index: 1 !important;
  }

  .react-flow__edge-path {
    pointer-events: stroke !important;
  }

  .eos-edge-packet {
    padding: 4px 7px;
    color: #f8fafc;
    background: #111827;
    border: 1px solid #c5a059;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 35%);
    font-size: 9px;
    white-space: nowrap;
    pointer-events: all;
  }

  .eos-dimmed {
    opacity: .14 !important;
    filter: grayscale(100%);
  }

  .eos-lit {
    opacity: 1 !important;
    filter: none;
  }

  .eos-inspector {
    position: sticky;
    top: 10px;
    display: grid;
    gap: 10px;
    max-height: 82vh;
    overflow: auto;
    padding: 12px;
    border-color: #475569;
    background: linear-gradient(155deg, #1e293b, #111827);
  }

  .eos-inspector-section {
    display: grid;
    gap: 5px;
    padding-top: 8px;
    border-top: 1px solid #334155;
    font-size: 11px;
  }

  .eos-glass-layers {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .eos-glass-layer {
    padding: 10px;
    color: #f8fafc;
    background: #131c2e;
    border: 1px solid #c5a059;
    border-radius: 10px;
    box-shadow: 0 8px 18px rgb(15 23 42 / 12%);
  }

  .eos-search-dialog {
    width: min(620px, calc(100vw - 24px));
    max-height: 82vh;
    overflow: hidden;
    color: #e2e8f0;
    background: #111827;
    border: 1px solid #c5a059;
    border-radius: 12px;
    box-shadow: 0 24px 70px rgb(0 0 0 / 60%);
    padding: 0;
  }

  .eos-search-dialog::backdrop {
    background: rgb(3 7 18 / 76%);
    backdrop-filter: blur(3px);
  }

  .eos-search-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    border-bottom: 1px solid #334155;
  }

  .eos-search-heading h2 {
    margin: 0;
    color: #f7e7ce;
    font-size: 16px;
  }

  .eos-search-heading p {
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 11px;
  }

  .eos-search-input {
    width: 100%;
    padding: 14px;
    box-sizing: border-box;
    color: #f8fafc;
    background: #111827;
    border: 0;
    border-bottom: 1px solid #334155;
    outline: none;
    font: inherit;
  }

  .eos-search-input:focus-visible {
    box-shadow: inset 0 0 0 2px #c5a059;
  }

  .eos-search-results {
    display: grid;
    gap: 4px;
    max-height: 55vh;
    overflow: auto;
    padding: 6px;
    overscroll-behavior: contain;
  }

  .eos-search-option {
    display: grid;
    gap: 4px;
    width: 100%;
    padding: 10px;
    color: #e2e8f0;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font: inherit;
  }

  .eos-search-option small {
    color: #94a3b8;
    font-size: 10px;
  }

  .eos-search-option:hover,
  .eos-search-option[aria-selected="true"] {
    color: #111827;
    background: #c5a059;
  }

  .eos-search-option:hover small,
  .eos-search-option[aria-selected="true"] small {
    color: #1e293b;
  }

  .eos-search-empty {
    margin: 0;
    padding: 18px 10px;
    color: #94a3b8;
    text-align: center;
  }

  .eos-search-footer {
    padding: 9px 14px;
    color: #94a3b8;
    background: #0f172a;
    border-top: 1px solid #334155;
    font-size: 10px;
  }

  .eos-main-grid {
    display: block;
    position: relative;
    min-width: 0;
  }

  .eos-panel {
    position: relative;
    min-width: 0;
    overflow: hidden;
  }

  .eos-flow {
    width: 100%;
    height: min(78vh, 1050px);
    min-height: 860px;
    overflow: hidden;
    border-color: #c5a059;
    background: #0f172a;
  }

  .eos-column-node {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
    color: #f8fafc;
    background: #0f172a;
    border: 1px solid #c5a059;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgb(0 0 0 / 28%);
  }

  .eos-column-selected {
    outline: 2px solid #c5a059;
  }

  .eos-column-heading {
    position: sticky;
    top: 0;
    z-index: 2;
    display: grid;
    gap: 5px;
    padding: 12px;
    color: #f7e7ce;
    background: #131c2e;
    border-bottom: 1px solid #c5a059;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .035em;
  }

  .eos-column-heading small {
    color: #cbd5e1;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0;
  }

  .eos-column-content {
    display: grid;
    align-content: start;
    gap: 9px;
    min-height: 0;
    overflow: auto;
    padding: 9px;
    overscroll-behavior: contain;
  }

  .eos-column-node[data-column-id="column-3"] .eos-column-content {
    gap: 55px;
  }

  .eos-entity[data-entity-id="process-orchestration"] > .eos-entity-children {
    gap: 55px;
  }

  .eos-entity {
    display: grid;
    align-content: start;
    gap: 5px;
    min-width: 0;
    padding: 8px;
    color: #f8fafc;
    background: var(--entity-background, #334155);
    border: 1px solid var(--node-accent, #c5a059);
    border-radius: 8px;
    box-shadow: 0 3px 9px rgb(15 23 42 / 10%);
    transition: opacity .16s ease, filter .16s ease, box-shadow .16s ease;
  }

  .eos-entity-section {
    background: var(--entity-background, #334155);
  }

  .eos-entity-heading {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    padding: 0;
    color: var(--node-accent, #9a7b3e);
    text-align: left;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.3;
  }

  .eos-entity-link {
    width: 100%;
    background: transparent;
    border: 0;
    cursor: pointer;
    font: inherit;
  }

  .eos-entity-link:hover,
  .eos-entity-link:focus-visible {
    color: #f7e7ce;
    text-decoration: underline;
    text-decoration-color: #c5a059;
    outline: none;
  }

  .eos-entity-description {
    margin: 0;
    color: #e2e8f0;
    font-size: 9px;
    line-height: 1.35;
  }

  .eos-entity-children {
    display: grid;
    align-content: start;
    gap: 6px;
    min-width: 0;
  }

  .eos-entity-layout-row {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .eos-entity-layout-grid {
    grid-template-columns: repeat(4, minmax(140px, 1fr)) minmax(180px, 1.2fr);
  }

  .eos-entity-layout-split {
    grid-template-columns: minmax(0, 1fr) minmax(105px, .42fr);
    align-items: start;
  }

  .eos-entity-layout-split > .eos-entity {
    min-width: 0;
  }

  .eos-entity .eos-node-meta {
    margin-top: 2px;
  }

  .eos-entity .eos-chip {
    white-space: normal;
  }

  .eos-canvas-legend {
    position: absolute;
    right: 15px;
    bottom: 15px;
    z-index: 8;
    display: grid;
    gap: 4px;
    width: min(250px, calc(100% - 30px));
    max-height: 42%;
    overflow: auto;
    padding: 9px;
    color: #f8fafc;
    background: rgb(17 24 39 / 94%);
    border: 1px solid #c5a059;
    border-radius: 10px;
    box-shadow: 0 8px 26px rgb(0 0 0 / 45%);
  }

  .eos-hover-tooltip {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 9;
    display: grid;
    gap: 5px;
    width: min(320px, calc(100% - 28px));
    padding: 10px 12px;
    color: #e2e8f0;
    background: rgb(17 24 39 / 94%);
    border: 1px solid #c5a059;
    border-radius: 9px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 42%);
    pointer-events: none;
    font-size: 10px;
    line-height: 1.4;
  }

  .eos-hover-tooltip strong {
    color: #f7e7ce;
  }

  .eos-hover-tooltip small {
    color: #cbd5e1;
    font-size: 9px;
  }

  .eos-canvas-legend > strong {
    color: #f7e7ce;
    font-size: 10px;
    letter-spacing: .08em;
  }

  .eos-canvas-legend button {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px 5px;
    color: #e2e8f0;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    font: inherit;
    font-size: 9px;
  }

  .eos-canvas-legend button:hover,
  .eos-canvas-legend button:focus-visible,
  .eos-canvas-legend button[aria-pressed="false"] {
    border-color: #c5a059;
    outline: none;
  }

  .eos-inspector {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 10;
    display: grid;
    gap: 10px;
    width: min(350px, calc(100% - 28px));
    max-height: calc(100% - 28px);
    overflow: auto;
    padding: 12px;
    border-color: #c5a059;
    background: linear-gradient(155deg, rgb(30 41 59 / 97%), rgb(17 24 39 / 97%));
    box-shadow: 0 16px 42px rgb(0 0 0 / 55%);
  }

  .eos-column-title,
  .eos-entity-topline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
  }

  .eos-column-title > span {
    min-width: 0;
  }

  .eos-info-button {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    color: #f8fafc;
    background: rgb(15 23 42 / 70%);
    border: 1px solid #c5a059;
    border-radius: 50%;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    line-height: 1;
  }

  .eos-info-button:hover,
  .eos-info-button:focus-visible {
    color: #0f172a;
    background: #c5a059;
    outline: 2px solid #f8fafc;
    outline-offset: 1px;
  }

  .eos-entity-link {
    color: #f8fafc;
  }

  .eos-inspector,
  .eos-search-dialog {
    color: #f8fafc;
    background: #131c2e;
  }

  .eos-inspector-section {
    color: #f8fafc;
  }

  .eos-fullscreen:fullscreen {
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    padding: 12px;
    background: #0b1120;
  }

  .eos-fullscreen:fullscreen .eos-flow {
    height: calc(100vh - 260px);
    min-height: 860px;
  }

  .eos-shell {
    color: #1e293b;
    background: #f8fafc;
  }

  .eos-header {
    color: #f8fafc;
    background: #1e293b;
    border-color: #475569;
  }

  .eos-panel {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .eos-flow {
    background: #f8fafc;
    border-color: #64748b;
  }

  .eos-column-node {
    color: #1e293b;
    background: #ffffff;
    border-color: #94a3b8;
    box-shadow: 0 8px 22px rgb(15 23 42 / 12%);
  }

  .eos-column-heading {
    color: #ffffff;
    background: #1e293b;
    border-bottom-color: #94a3b8;
  }

  .eos-column-heading small {
    color: #e2e8f0;
  }

  .eos-column-title > span {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .eos-column-content {
    background: #f8fafc;
  }

  .eos-entity,
  .eos-entity.eos-node-dark {
    color: var(--entity-foreground, #1e293b);
    background: var(--entity-background, #ebf2fa);
    border-color: rgb(30 41 59 / 24%);
    box-shadow: 0 3px 9px rgb(15 23 42 / 10%);
  }

  .eos-entity-heading,
  .eos-entity-link,
  .eos-entity-description {
    color: var(--entity-foreground, #1e293b);
  }

  .eos-entity-link:hover,
  .eos-entity-link:focus-visible {
    color: #0f172a;
    background: rgb(255 255 255 / 28%);
    text-decoration-color: #334e68;
  }

  .eos-entity-icon {
    flex: 0 0 auto;
  }

  .eos-entity .eos-chip {
    color: #1e293b;
    background: rgb(248 250 252 / 84%);
    border-color: rgb(30 41 59 / 30%);
  }

  .eos-entity[data-entity-id="pillar-workflow"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #d6e6f4 !important;
  }

  .eos-entity[data-entity-id="pillar-communication"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5e9ce !important;
  }

  .eos-entity[data-entity-id="pillar-integration"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5d6d8 !important;
  }

  .eos-entity[data-entity-id="pillar-support"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #d5eceb !important;
  }

  .eos-entity[data-entity-id="infrastructure"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #ebf2fa !important;
  }

  .eos-entity[data-entity-id="academic-personnel"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #ebf2fa !important;
  }

  .eos-entity[data-entity-id="certification-gateways"] > .eos-entity-children > .eos-entity {
    --entity-foreground: #1e293b !important;
    background: #f5f3fa !important;
  }

  .eos-canvas-legend {
    color: #1e293b;
    background: rgb(255 255 255 / 97%);
    border-color: #64748b;
    box-shadow: 0 8px 26px rgb(15 23 42 / 18%);
  }

  .eos-canvas-legend > strong,
  .eos-canvas-legend button {
    color: #1e293b;
  }

  .eos-canvas-legend button:hover,
  .eos-canvas-legend button:focus-visible,
  .eos-canvas-legend button[aria-pressed="false"] {
    border-color: #334e68;
  }

  .eos-hover-tooltip,
  .eos-inspector,
  .eos-glass-layer,
  .eos-search-dialog {
    color: #1e293b;
    background: rgb(255 255 255 / 98%);
    border-color: #64748b;
    box-shadow: 0 12px 30px rgb(15 23 42 / 18%);
  }

  .eos-hover-tooltip strong,
  .eos-inspector-section,
  .eos-search-heading h2 {
    color: #1e293b;
  }

  .eos-info-button {
    color: #1e293b;
    background: rgb(255 255 255 / 88%);
    border-color: #64748b;
  }

  .eos-info-button:hover,
  .eos-info-button:focus-visible {
    color: #ffffff;
    background: #1e3a5f;
    outline-color: #ffffff;
  }

  .eos-search-input {
    color: #1e293b;
    background: #ffffff;
    border-bottom-color: #cbd5e1;
  }

  .eos-search-heading {
    border-bottom-color: #cbd5e1;
  }

  .eos-search-heading p,
  .eos-search-option small,
  .eos-search-empty,
  .eos-search-footer,
  .eos-hover-tooltip small {
    color: #475569;
  }

  .eos-search-option {
    color: #1e293b;
  }

  .eos-search-option:hover,
  .eos-search-option[aria-selected="true"] {
    color: #ffffff;
    background: #1e3a5f;
  }

  .eos-search-option:hover small,
  .eos-search-option[aria-selected="true"] small {
    color: #e2e8f0;
  }

  .eos-search-footer {
    background: #f1f5f9;
    border-top-color: #cbd5e1;
  }

  .eos-inspector-section {
    border-top-color: #cbd5e1;
  }

  .eos-dimmed {
    opacity: .16 !important;
    filter: grayscale(100%);
  }

  @keyframes apexDashFlow {
    to { stroke-dashoffset: -26; }
  }

  @keyframes eosGoldPulse {
    0%, 100% { box-shadow: 0 7px 20px rgb(0 0 0 / 18%), 0 0 0 0 rgb(197 160 89 / 18%); }
    50% { box-shadow: 0 7px 20px rgb(0 0 0 / 18%), 0 0 0 5px rgb(197 160 89 / 45%); }
  }

  @media (max-width: 1000px) {
    .eos-inspector {
      max-height: calc(100% - 20px);
    }

    .eos-flow {
      height: 75vh;
      min-height: 860px;
    }

    .eos-entity-layout-grid {
      grid-template-columns: repeat(2, minmax(145px, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .eos-edge-path {
      animation: none;
    }
    .eos-new-interface {
      animation: none;
    }
  }

  /* ---- Hierarchie-Baum (d3-org-chart) ---- */
  .eos-tree-wrap {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .eos-tree-host {
    width: 100%;
    height: 720px;
    overflow: hidden;
    background: #f8fafc;
    border: 1px solid #c5a059;
    border-radius: 10px;
  }

  .eos-tree-card {
    box-sizing: border-box;
    display: grid;
    align-content: start;
    gap: 3px;
    padding: 8px 10px;
    overflow: hidden;
    color: #ffffff;
    background: var(--lvl, #334e68);
    border: 2px solid rgb(255 255 255 / 55%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgb(15 23 42 / 25%);
    font-family: inherit;
    transition: opacity .2s ease, filter .2s ease;
    cursor: pointer;
  }

  .eos-tree-card:focus-visible {
    outline: 3px solid #c5a059;
    outline-offset: 2px;
  }

  .eos-tree-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
  }

  .eos-tree-top strong {
    font-size: 12px;
    line-height: 1.25;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .eos-tree-card small,
  .eos-tree-card em {
    font-size: 10px;
    font-style: normal;
    opacity: .9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .eos-tree-badge {
    justify-self: start;
    padding: 1px 6px;
    color: #131c2e;
    background: #c5a059;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 700;
  }

  .eos-tree-toggle {
    position: relative;
    z-index: 2;
    padding: 2px 8px;
    color: #131c2e;
    background: #f7e7ce;
    border: 1px solid #c5a059;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  .eos-tree-link-hot {
    filter: drop-shadow(0 0 4px #c5a059);
    stroke-dasharray: 10 6;
    animation: apexDashFlow 1.2s linear infinite;
  }

  .eos-tree-hint {
    color: #475569;
    font-size: 11px;
  }

  .eos-tree-error {
    margin: 0;
    padding: 8px 10px;
    color: #7f1d1d;
    background: #fee2e2;
    border: 1px solid #dc2626;
    border-radius: 8px;
    font-size: 12px;
  }

  /* ---- Glasplatten-Schichtenblick ---- */
  .eos-glass-stack {
    display: grid;
    gap: 10px;
    padding: 6px 6px 6px 0;
  }

  .eos-glass-plate {
    display: grid;
    gap: 8px;
    padding: 10px 12px;
    color: #131c2e;
    background: linear-gradient(135deg, rgb(255 255 255 / 92%), rgb(226 232 240 / 78%));
    border: 1px solid rgb(100 116 139 / 55%);
    border-left: 6px solid var(--lvl, #334e68);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 14%), inset 0 1px 0 rgb(255 255 255 / 80%);
    backdrop-filter: blur(4px);
    transition: opacity .2s ease, filter .2s ease;
  }

  .eos-glass-plate > header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .eos-glass-plate > header > strong {
    flex: 1 1 280px;
    font-size: 13px;
  }

  .eos-glass-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .eos-glass-item {
    padding: 4px 9px;
    color: #ffffff;
    background: var(--lvl, #334e68);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
  }

  .eos-glass-human {
    color: #131c2e;
    background: #c5a059;
    cursor: default;
  }

  /* ---- 16:9-Breitbild fÃ¼r die 4-Spalten-Ansicht ---- */
  .eos-flow {
    aspect-ratio: 16 / 9;
    height: auto;
    min-height: 560px;
    max-height: 960px;
  }

  /* ---- Kompakte 16:9-Verdichtung der 4 Spalten (Ebene 0/1 bleibt niedrig, kein Riesenturm) ---- */
  .eos-column-node[data-column-id="column-3"] .eos-column-content,
  .eos-entity[data-entity-id="process-orchestration"] > .eos-entity-children {
    gap: 8px;
  }

  .eos-column-content {
    gap: 6px;
    padding: 6px;
  }

  .eos-entity {
    padding: 5px 6px;
    gap: 3px;
  }

  /* Buttons erben sonst die 16-px-Browserschrift und sprengen die kompakten Karten. */
  .eos-entity-heading,
  .eos-entity-link,
  .eos-entity-link strong {
    font-size: 11px;
    line-height: 1.25;
    font-weight: 800;
  }

  .eos-column-title {
    font-size: 11px;
  }

  .eos-entity-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .eos-entity[data-entity-id="constitutional"] > .eos-entity-children,
  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children {
    gap: 6px;
  }

  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children > .eos-entity {
    align-content: start;
  }

  /* Spalte 3 kompakt: Platzhalter-Beschreibungen ausblenden (Details Ã¼ber â“˜ und Unterseiten). */
  .eos-entity[data-entity-id^="pillar-"] .eos-entity-description,
  .eos-entity[data-entity-id="planning-phases"] .eos-entity-description,
  .eos-entity[data-entity-id="world-ecosystem"] .eos-entity-description,
  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children .eos-entity-description {
    display: none;
  }

  .eos-entity[data-entity-id="planning-phases"] .eos-entity,
  .eos-entity[data-entity-id^="pillar-"] .eos-entity-card {
    padding: 3px 6px;
  }

  /* Spalte 3: die Ablauf-Phasen als eine schlanke Zeile, damit die 4 SÃ¤ulen Platz behalten. */
  .eos-entity[data-entity-id="planning-phases"] > .eos-entity-children {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
  }

  .eos-entity[data-entity-id="planning-phases"] .eos-entity-card {
    padding: 2px 6px;
    min-height: 0;
  }

  .eos-entity[data-entity-id="four-pillars"] > .eos-entity-children > .eos-entity {
    padding: 4px;
    gap: 3px;
  }

  .eos-entity[data-entity-id^="pillar-"] > .eos-entity-children {
    gap: 3px;
  }

  .eos-entity[data-entity-id="four-pillars"] .eos-entity-card {
    padding: 3px 5px;
  }

  .eos-entity[data-entity-id="four-pillars"] .eos-entity-heading,
  .eos-entity[data-entity-id="four-pillars"] .eos-entity-link strong {
    font-size: 10px;
  }

  /* Spalten 1, 2 und 4: Inhalte gleichmÃ¤ÃŸig auf die volle SpaltenhÃ¶he verteilen (kein halbleerer Streifen). */
  .eos-column-node[data-column-id="column-1"] .eos-column-content,
  .eos-column-node[data-column-id="column-2"] .eos-column-content,
  .eos-column-node[data-column-id="column-4"] .eos-column-content {
    align-content: space-between;
  }

  /* Spalte 1 ist nur 310 px breit: Akademie und Gateways untereinander statt gequetscht nebeneinander. */
  .eos-entity[data-entity-id="academic-qualification"] > .eos-entity-children {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Leitungen, die fremde Spalten kreuzen, bleiben sichtbar, verdecken aber keine Texte mehr. */
  .react-flow__edge-path {
    stroke-linecap: round;
  }

  /* MiniMap wÃ¼rde die feste Legende unten rechts Ã¼berdecken. */
  .eos-flow .react-flow__minimap {
    display: none;
  }

  /* Eigene Anker je Leitung: die Handle-Punkte bleiben unsichtbar, aber exakt verteilt. */
  .eos-lane-handle {
    width: 3px;
    height: 3px;
    min-width: 0;
    min-height: 0;
    background: transparent;
    border: 0;
    pointer-events: none;
  }

  /* Legende unten rechts, nie Ã¼ber den Spalten: im Flow-Modus kompakt zweispaltig. */
  .eos-panel[data-mode="flow"] .eos-canvas-legend {
    right: 10px;
    bottom: 10px;
    width: 230px;
    max-height: none;
    grid-template-columns: 1fr 1fr;
    gap: 2px 6px;
    padding: 6px 8px;
  }

  .eos-panel[data-mode="flow"] .eos-canvas-legend > strong {
    grid-column: 1 / -1;
  }

  /* Baum/Glasplatten: Legende nicht Ã¼ber den Karten schweben lassen, sondern darunter als Leiste. */
  .eos-panel[data-mode="tree"] .eos-canvas-legend,
  .eos-panel[data-mode="glass"] .eos-canvas-legend,
  .eos-panel[data-mode="touch"] .eos-canvas-legend {
    position: static;
    width: auto;
    max-height: none;
    margin-top: 8px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .eos-panel[data-mode="tree"] .eos-canvas-legend > strong,
  .eos-panel[data-mode="glass"] .eos-canvas-legend > strong,
  .eos-panel[data-mode="touch"] .eos-canvas-legend > strong {
    grid-column: 1 / -1;
  }

  @media (prefers-reduced-motion: reduce) {
    .eos-tree-link-hot {
      animation: none;
    }
  }
}


--- DATEI: app/components/dashboard/EnterpriseOsOrganigram.tsx ---
import {
  Background,
  Controls,
  EdgeLabelRenderer,
  EdgeToolbar,
  getSmoothStepPath,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useEdgesStore,
  useEqualSelector,
  useNode,
  type Edge,
  type EdgesStore,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Bot,
  Brain,
  Bug,
  BookOpen,
  Code2,
  Crown,
  Cpu,
  Database,
  Factory,
  Filter,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Headset,
  History,
  Landmark,
  LockKeyhole,
  Network,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  UserRound,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { DEPARTMENTS } from "../../services/agent-roster";
import type {
  AgentDef,
  AgentPerformanceSnapshot,
  EarningsSummary,
} from "../../services/agent-types";
import type { LiveConnectionTraceDto } from "../../services/live-connection.server";
import { DomainInfoButton } from "./DomainInfoButton";
import "./EnterpriseOsOrganigram.css";

type Capability = {
  id: string;
  domainKey: string;
  displayName: string;
  feasibility: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  evidenceSummary: string;
  verifiedAt: string | null;
  expiresAt: string | null;
  estimatedCostEur: number | null;
  riskLevel: string;
  isVerified: boolean;
};

type Binding = {
  id: string;
  agentKey: string;
  interfaceKey: string;
  status: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  isNewlySpawnedInterface: boolean;
};

type LegalRule = {
  id: string;
  ruleKey: string;
  jurisdiction: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceHash: string;
  verifiedAt: string;
  reviewStatus: string;
};

type LegendId =
  | "command"
  | "expertise"
  | "control"
  | "process"
  | "infrastructure"
  | "feedback"
  | "consensus"
  | "data";

type EntityTone =
  | "obsidian"
  | "sapphire"
  | "violet"
  | "petrol"
  | "antiqueGold"
  | "platinumSlate"
  | "bronze"
  | "burgundy"
  | "emerald"
  | "sandBronze"
  | "champagne"
  | "steelSlate"
  | "sageEmerald"
  | "deepBordeaux"
  | "royalBlue"
  | "processLayer"
  | "whiteCard"
  | "softSlate"
  | "workflowCard"
  | "communicationCard"
  | "integrationCard"
  | "supportCard"
  | "turquoise"
  | "iceBlue"
  | "workflowBlue";

type Entity = {
  id: string;
  title: string;
  description: string;
  group: string;
  legendId: LegendId;
  column?: 1 | 2 | 3 | 4;
  width?: number;
  isColumn?: boolean;
  layout?: "stack" | "row" | "grid" | "split";
  children?: Entity[];
  clickable?: boolean;
  route?: string;
  departmentId?: number;
  depth?: number;
  dark?: boolean;
  tone?: EntityTone;
  metrics?: string[];
  sourceType?: "agent" | "trace" | "law" | "capability" | "binding" | "department";
  sourceId?: string;
  relationKey?: string;
  relationKeys?: string[];
  reportsTo?: number | null;
  agentNumber?: number;
  newlySpawned?: boolean;
};

type FlowNodeData = {
  entity: Entity;
  onActivate: (entity: Entity) => void;
  onHover: (entity: Entity | null) => void;
  visibleLegend: Set<LegendId>;
  focusedId: string | null;
  focusedLegend: LegendId | null;
  relatedIds: Set<string>;
  activeColumns: Set<string>;
  onInspect: (entity: Entity) => void;
};
type FlowNode = Node<FlowNodeData, "apex">;
type FlowEdgeData = {
  packet: string;
  legendId: LegendId;
  traceId?: string;
  trace?: LiveConnectionTraceDto;
  traceIds?: string[];
  bindingIds?: string[];
  laneOffset: number;
  dimmed?: boolean;
  showLabel?: boolean;
  fast?: boolean;
  relatedIds: string[];
  route: string;
};
type FlowEdge = Edge<FlowEdgeData, "apex">;

interface Props {
  dynamicCount: number;
  ownerShop: boolean;
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  allowedDepartmentIds: number[];
  legalRules: LegalRule[];
  capabilities: Capability[];
  bindings: Binding[];
  initialTraces: LiveConnectionTraceDto[];
  onPickDept: (id: number) => void;
  onSelectModule: (moduleId: string) => void;
  executivePulse: string[];
}

const LEGEND: { id: LegendId; label: string; color: string }[] = [
  { id: "command", label: "Command", color: "#B7791F" },
  { id: "expertise", label: "Expertise-Input", color: "#2563EB" },
  { id: "control", label: "Control / Audit", color: "#DC2626" },
  { id: "process", label: "Process-Flow", color: "#B45309" },
  { id: "infrastructure", label: "Infrastructure", color: "#475569" },
  { id: "feedback", label: "Meta Feedback Loop", color: "#A16207" },
  { id: "consensus", label: "Decision Consensus", color: "#047857" },
  { id: "data", label: "Data-Flow", color: "#0F766E" },
];

const EDGE_COLORS: Record<LegendId, string> = {
  command: "#B7791F",
  expertise: "#2563EB",
  control: "#DC2626",
  process: "#B45309",
  infrastructure: "#475569",
  feedback: "#A16207",
  consensus: "#047857",
  data: "#0F766E",
};

const TONE_COLORS: Record<EntityTone, string> = {
  obsidian: "#1E3A5F",
  sapphire: "#2B4C7E",
  violet: "#D8D0E8",
  petrol: "#135D66",
  antiqueGold: "#B5944B",
  platinumSlate: "#B8C4D0",
  bronze: "#B58938",
  burgundy: "#A84248",
  emerald: "#2B7A78",
  sandBronze: "#D4BA7A",
  champagne: "#C9A34E",
  steelSlate: "#334E68",
  sageEmerald: "#88B39E",
  deepBordeaux: "#8B2635",
  royalBlue: "#234E8E",
  processLayer: "#DCE8F5",
  whiteCard: "#EBF2FA",
  softSlate: "#CBD5E1",
  workflowCard: "#D6E6F4",
  communicationCard: "#F5E9CE",
  integrationCard: "#F5D6D8",
  supportCard: "#D5ECEB",
  turquoise: "#7FB3B0",
  iceBlue: "#A8C6DF",
  workflowBlue: "#2E6699",
};

const TONE_FOREGROUNDS: Record<EntityTone, string> = {
  obsidian: "#F8FAFC",
  sapphire: "#FFFFFF",
  violet: "#1E293B",
  petrol: "#FFFFFF",
  antiqueGold: "#FFFFFF",
  platinumSlate: "#1E293B",
  bronze: "#1E293B",
  burgundy: "#FFFFFF",
  emerald: "#FFFFFF",
  sandBronze: "#1E293B",
  champagne: "#1E293B",
  steelSlate: "#FFFFFF",
  sageEmerald: "#1E293B",
  deepBordeaux: "#FFFFFF",
  royalBlue: "#FFFFFF",
  processLayer: "#1E293B",
  whiteCard: "#1E293B",
  softSlate: "#1E293B",
  workflowCard: "#1E293B",
  communicationCard: "#1E293B",
  integrationCard: "#1E293B",
  supportCard: "#1E293B",
  turquoise: "#1E293B",
  iceBlue: "#1E293B",
  workflowBlue: "#FFFFFF",
};

const ENTITY_ICONS: Record<string, LucideIcon> = {
  "column-1": GraduationCap,
  "column-2": Crown,
  "column-3": Activity,
  "column-4": ShieldCheck,
  "academic-qualification": GraduationCap,
  "academic-personnel": BookOpen,
  "professor-agents": GraduationCap,
  "lecturer-agents": BookOpen,
  "prompt-alchemist": Brain,
  "distillation-agent": Filter,
  "certification-gateways": ShieldCheck,
  "training-connection": BookOpen,
  "live-testing": Search,
  recertification: History,
  "expert-registration": UserRound,
  "knowledge-management": Brain,
  "vector-database": Database,
  "knowledge-curator": Brain,
  "episodic-memory": History,
  "knowledge-graph": Network,
  "owner-architect": Crown,
  "core-ai": Cpu,
  "llm-kernel": Cpu,
  "rl-optimization": Network,
  "neuro-symbolic": Brain,
  "ethical-ai": Scale,
  "synthetic-data": Database,
  constitutional: Landmark,
  "agent-factory-constitutional": Factory,
  "governance-board": Landmark,
  "consensus-jury": UserRound,
  "devils-advocate": ShieldAlert,
  "meta-hypervisor": Network,
  "process-orchestration": Activity,
  "planning-phases": Workflow,
  "pillar-workflow": Workflow,
  "pillar-communication": BookOpen,
  "pillar-integration": Code2,
  "pillar-support": Headset,
  "world-ecosystem": Boxes,
  "purchasing-agent": ShoppingBasket,
  "logistics-optimizer": Truck,
  "inventory-manager": Boxes,
  "customer-market": UserRound,
  "crm-agent": UserRound,
  "market-trend-watcher": Search,
  "marketing-automation": Activity,
  "event-bus": Activity,
  "data-telemetry": Gauge,
  "integrated-ecosystem": Database,
  "system-performance": Gauge,
  infrastructure: Wrench,
  "tool-registry": Wrench,
  "safety-controls": AlertTriangle,
  "version-control": GitBranch,
  "zero-trust": ShieldCheck,
  "self-healing": Search,
  "quality-verifier": Search,
  "red-team": Bug,
  "code-surgeon": Wrench,
  "finops-watchdog": Gauge,
  "external-ecosystem": Globe,
  ledger: LockKeyhole,
  "transaction-log": LockKeyhole,
};

const COLUMN_LAYOUTS = [
  { id: "column-1", title: "Wissen & Qualifikation", x: 20, width: 310 },
  { id: "column-2", title: "Inhaber & Core AI", x: 370, width: 250 },
  { id: "column-3", title: "Haupt-Matrix", x: 680, width: 920 },
  { id: "column-4", title: "Ãœberwachung & Ledger", x: 1680, width: 310 },
] as const;

const PILLAR_DEPARTMENT_IDS: Record<string, number[]> = {
  "pillar-workflow": [1, 2, 3, 4, 8, 10, 13, 24, 26],
  "pillar-communication": [5, 6, 7, 11, 15, 16, 17, 18, 20],
  "pillar-integration": [9, 12, 19, 21, 22, 25],
  "pillar-support": [14, 23],
};

const TITLE_MAP: Record<string, string> = {
  workflow: "Workflow & Automatisierung",
  "event-bus": "Real-Time Event-Bus",
  "integrated-ecosystem": "Integrated Ecosystem",
  "system-performance": "System Performance & Telemetry",
  interfaces: "Schnittstellen-Detail",
  departments: "Fachabteilungen & Module",
  specialists: "Fachcluster #301â€“#400",
  staff: "KI-Belegschaft",
  laws: "Recht & Steuern",
  traces: "Beobachtete Verbindungen",
  "agent-factory": "KI-Fabrik #401 â†’ âˆž",
  "owner-architect": "App-Inhaber / System-Architekt",
  "core-ai": "Core AI R&D & Omni-Sense Layer",
  academy: "Akademische Qualifikation",
  knowledge: "Wissens- & GedÃ¤chtnis-Management",
  constitutional: "Constitutional Core",
  "meta-hypervisor": "Meta-KI #000",
  "process-orchestration": "Process Orchestration Layer",
  infrastructure: "Core Technical Infrastructure Backbone",
  "self-healing": "KI-Ãœberwachung & Self-Healing",
  ledger: "Entscheidungs-Ledger",
};

/** Klartext-ErklÃ¤rung je Strom-Art fÃ¼r den Hover-Tooltip (Legende und Leitung). */
const LEGEND_EXPLANATION: Record<LegendId, string> = {
  command: "Anweisungen vom Inhaber und der Meta-KI nach unten. Die OwnerRule hat immer Vorrang.",
  expertise: "Fachwissen und Qualifikation flieÃŸen von der Akademie zu den ausfÃ¼hrenden Teams.",
  control: "PrÃ¼f- und Audit-Meldungen: hier greifen 3Ã—-PrÃ¼fung, Veto und Freigabe-Warteschlange.",
  process: "Arbeitsablauf von Planung Ã¼ber AusfÃ¼hrung bis Bericht.",
  infrastructure: "Technische Grundlage: Schnittstellen, Werkzeuge und Quellen, auf die alle Teams zugreifen.",
  feedback: "RÃ¼ckmeldungen und Lernergebnisse, mit denen sich Mitarbeiter und Regeln verbessern.",
  consensus: "Gemeinsame Entscheidung von Jury, Governance und FachprÃ¼fern.",
  data: "Ereignis- und Datenstrom, zum Beispiel gespeicherte Live-Traces.",
};

const noop = () => undefined;
/** 8 Leitungsgruppen Ã— 5 Parallelschienen. */
const LANE_HANDLES = 40;
const COLUMN_HEIGHT = 1180;
/** Ankerpunkte nur unterhalb der SpaltenkÃ¶pfe verteilen, damit keine Leitung die Ãœberschriften verdeckt. */
const laneTop = (index: number): number => 84 + ((index + 0.5) / LANE_HANDLES) * (COLUMN_HEIGHT - 124);

const nodeTypes = { apex: ApexNode };
const edgeTypes = { apex: AnimatedDataEdge };

function entityHasVisibleContent(entity: Entity, visibleLegend: Set<LegendId>): boolean {
  return visibleLegend.has(entity.legendId) ||
    Boolean(entity.children?.some((child) => entityHasVisibleContent(child, visibleLegend)));
}

function entityContains(entity: Entity, id: string | null): boolean {
  return Boolean(id && (entity.id === id || entity.children?.some((child) => entityContains(child, id))));
}

function entityContainsLegend(entity: Entity, legendId: LegendId | null): boolean {
  return Boolean(legendId && (entity.legendId === legendId || entity.children?.some((child) => entityContainsLegend(child, legendId))));
}

function flattenEntities(entities: Entity[], result: Entity[] = []): Entity[] {
  for (const entity of entities) {
    result.push(entity);
    if (entity.children?.length) flattenEntities(entity.children, result);
  }
  return result;
}

function getEntityFamily(roots: Entity[], focusedId: string | null): Set<string> {
  const all = flattenEntities(roots);
  const target = all.find((entity) => entity.id === focusedId);
  const result = new Set<string>();
  if (!target || !focusedId) return result;

  if (target.agentNumber === 0 || target.id === "meta-hypervisor") {
    for (const entity of all) {
      if (entity.id !== "owner-architect" && entity.id !== "owner-hidden") result.add(entity.id);
    }
    return result;
  }

  const findPath = (entity: Entity, parents: Entity[]): boolean => {
    if (entity.id === focusedId) {
      for (const parent of parents) result.add(parent.id);
      const addDescendants = (descendant: Entity) => {
        result.add(descendant.id);
        descendant.children?.forEach(addDescendants);
      };
      addDescendants(entity);
      return true;
    }
    return entity.children?.some((child) => findPath(child, [...parents, entity])) ?? false;
  };
  roots.forEach((root) => { findPath(root, []); });

  if (target.agentNumber != null) {
    const agents = new Map(
      all.filter((entity) => entity.agentNumber != null).map((entity) => [entity.agentNumber!, entity])
    );
    const agentNumbers = new Set<number>([target.agentNumber]);
    let parentNumber = target.reportsTo;
    while (parentNumber != null && agents.has(parentNumber) && !agentNumbers.has(parentNumber)) {
      agentNumbers.add(parentNumber);
      parentNumber = agents.get(parentNumber)?.reportsTo ?? null;
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const [number, agent] of agents) {
        if (agent.reportsTo != null && agentNumbers.has(agent.reportsTo) && !agentNumbers.has(number)) {
          agentNumbers.add(number);
          changed = true;
        }
      }
    }
    for (const number of agentNumbers) {
      const agent = agents.get(number);
      if (agent) result.add(agent.id);
    }
  }

  const relatedKeys = new Set(target.relationKeys ?? (target.relationKey ? [target.relationKey] : []));
  let relationsChanged = true;
  while (relationsChanged && relatedKeys.size) {
    relationsChanged = false;
    for (const entity of all) {
      const keys = entity.relationKeys ?? (entity.relationKey ? [entity.relationKey] : []);
      if (keys.some((key) => relatedKeys.has(key))) {
        result.add(entity.id);
        for (const key of keys) {
          if (!relatedKeys.has(key)) {
            relatedKeys.add(key);
            relationsChanged = true;
          }
        }
      }
    }
  }
  return result;
}

function ArchitectureContent({
  entity,
  data,
}: {
  entity: Entity;
  data: FlowNodeData;
}) {
  if (!entityHasVisibleContent(entity, data.visibleLegend)) return null;
  const relevant = (!data.focusedId ||
    data.relatedIds.has(entity.id) ||
    entityContains(entity, data.focusedId)) &&
    (!data.focusedLegend || entityContainsLegend(entity, data.focusedLegend));
  const accent = LEGEND.find((item) => item.id === entity.legendId)?.color ?? "#C5A059";
  const tone = entity.tone ?? "whiteCard";
  const Icon = ENTITY_ICONS[entity.id] ?? (entity.sourceType === "agent" ? Bot : undefined);
  const layoutClass = `eos-entity-layout-${entity.layout ?? "stack"}`;
  const classes = [
    "eos-entity",
    entity.children?.length ? "eos-entity-section" : "eos-entity-card",
    entity.dark ? "eos-node-dark" : "",
    entity.newlySpawned ? "eos-new-interface" : "",
    relevant ? "eos-lit" : "eos-dimmed",
  ].filter(Boolean).join(" ");

  return (
    <section
      className={classes}
      data-entity-id={entity.id}
      data-tone={tone}
      style={{
        "--node-accent": accent,
        "--entity-background": TONE_COLORS[tone],
        "--entity-foreground": TONE_FOREGROUNDS[tone],
      } as CSSProperties}
      onMouseEnter={() => data.onHover(entity)}
      onMouseLeave={() => data.onHover(null)}
      onFocus={() => data.onHover(entity)}
      onBlur={() => data.onHover(null)}
      aria-label={`${entity.title}. ${entity.description}`}
    >
      <div className="eos-entity-topline">
        {entity.clickable === false ? (
          <div className="eos-entity-heading">
            {entity.newlySpawned && <span aria-label="Neue Schnittstelle">âœ¦</span>}
            {Icon && <Icon className="eos-entity-icon" aria-hidden="true" size={15} strokeWidth={2} />}
            <strong>{entity.title}</strong>
          </div>
        ) : (
          <button
            type="button"
            className="eos-entity-heading eos-entity-link"
            title={entity.description}
            onClick={(event) => {
              event.stopPropagation();
              data.onActivate(entity);
            }}
          >
            {entity.newlySpawned && <span aria-label="Neue Schnittstelle">âœ¦</span>}
            {Icon && <Icon className="eos-entity-icon" aria-hidden="true" size={15} strokeWidth={2} />}
            <strong>{entity.title}</strong>
          </button>
        )}
        <button
          type="button"
          className="eos-info-button"
          aria-label={`Informationen zu ${entity.title}`}
          title={`Informationen zu ${entity.title}`}
          onMouseEnter={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            data.onInspect(entity);
          }}
        >â“˜</button>
      </div>
      {entity.description && <p className="eos-entity-description">{entity.description}</p>}
      {!!entity.metrics?.length && (
        <div className="eos-node-meta">
          {entity.metrics.map((metric) => <span className="eos-chip" key={metric}>{metric}</span>)}
        </div>
      )}
      {!!entity.children?.length && (
        <div className={`eos-entity-children ${layoutClass}`}>
          {entity.children.map((child) => (
            <ArchitectureContent key={child.id} entity={child} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}

function ApexNode({ id, data, selected }: NodeProps<FlowNode>) {
  const liveNode = useNode<FlowNode>(id);
  const nodeData = liveNode?.data ?? data;
  const entity = nodeData.entity;
  const width = entity.width ?? 920;
  const accent = LEGEND.find((item) => item.id === entity.legendId)?.color ?? "#C5A059";
  const Icon = ENTITY_ICONS[entity.id];

  return (
    <article
      className={[
        "eos-column-node",
        selected ? "eos-column-selected" : "",
        nodeData.focusedId && !nodeData.activeColumns.has(entity.id) ? "eos-dimmed" : "",
        nodeData.focusedLegend && !entityContainsLegend(entity, nodeData.focusedLegend) ? "eos-dimmed" : "",
      ].filter(Boolean).join(" ")}
      style={{ width, "--node-accent": accent } as CSSProperties}
      data-column-id={entity.id}
      aria-label={entity.title}
    >
      {/* Verteilte Ankerpunkte: jede der 40 Leitungen hat ihren eigenen Handle -> parallele Schienen statt Klumpen. */}
      {Array.from({ length: LANE_HANDLES }, (_, index) => (
        <Handle
          key={`t${index}`}
          id={`t${index}`}
          type="target"
          position={Position.Left}
          className="eos-lane-handle"
          style={{ top: laneTop(index) }}
        />
      ))}
      <header className="eos-column-heading">
        <div className="eos-column-title">
          <span>{Icon && <Icon aria-hidden="true" size={15} strokeWidth={2} />} {entity.title}</span>
          <button
            type="button"
            className="eos-info-button"
            aria-label={`Informationen zu ${entity.title}`}
            onClick={(event) => {
              event.stopPropagation();
              nodeData.onInspect(entity);
            }}
          >â“˜</button>
        </div>
        {entity.description && <small>{entity.description}</small>}
      </header>
      <div className="eos-column-content">
        {entity.children?.map((child) => (
          <ArchitectureContent key={child.id} entity={child} data={nodeData} />
        ))}
      </div>
      {Array.from({ length: LANE_HANDLES }, (_, index) => (
        <Handle
          key={`s${index}`}
          id={`s${index}`}
          type="source"
          position={Position.Right}
          className="eos-lane-handle"
          style={{ top: laneTop(index) }}
        />
      ))}
    </article>
  );
}

function AnimatedDataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
  source,
  target,
}: EdgeProps<FlowEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    centerY: (sourceY + targetY) / 2 + (data?.laneOffset ?? 0),
  });
  const color = (style?.stroke as string) || "#234E8E";
  const dimmed = Boolean(data?.dimmed);
  // Leitungen, die eine mittlere Spalte Ã¼berqueren, werden leicht transparent, damit der Text darunter lesbar bleibt.
  const crossing = (source === "column-1" && target !== "column-2") || (source === "column-2" && target === "column-4");
  const capsuleText = (data?.packet ?? "Prozessfluss").replace(/ Â· \d$/, "");
  return (
    <>
      <g style={{
        opacity: dimmed ? 0.14 : crossing ? 0.4 : 1,
        filter: dimmed ? "grayscale(100%)" : "none",
        transition: "opacity 0.2s ease",
      }}>
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray="8 5"
          markerEnd={markerEnd}
          style={{ animation: "apexDashFlow 1.2s linear infinite" }}
        />
        {/* Unsichtbare, breite TrefferflÃ¤che: Leitungen lassen sich per Maus/Touch zuverlÃ¤ssig treffen. */}
        <path
          className="react-flow__edge-interaction"
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
        />
        <circle r={4.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5}>
          <animateMotion
            dur={data?.fast ? "1.6s" : "2.8s"}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      </g>
      {/* Schwebende Datenpaket-Kapsel: wandert entlang der Schiene (nur Schiene 1 je Leitungsgruppe, keine Ãœberlagerung). */}
      {(data?.packet ?? "").endsWith("Â· 1") && !dimmed && (
        <g aria-hidden="true">
          <animateMotion dur={data?.fast ? "5s" : "8s"} repeatCount="indefinite" path={edgePath} />
          <rect
            x={-((capsuleText.length * 4.1 + 12) / 2)}
            y={-6.5}
            width={capsuleText.length * 4.1 + 12}
            height={13}
            rx={6.5}
            fill="#131C2E"
            stroke={color}
            strokeWidth={1.2}
          />
          <text textAnchor="middle" y={3} fontSize={7.5} fontWeight={700} fill="#F7E7CE">{capsuleText}</text>
        </g>
      )}
      {/* Das feste Etikett erscheint nur bei Hover/Auswahl (sonst wird es am Spaltenrand abgeschnitten). */}
      {(data?.showLabel || selected) && <EdgeLabelRenderer>
        <span
          className="eos-edge-packet nodrag nopan"
          style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          aria-label={`Datenpaket: ${data?.packet ?? "Prozessfluss"}`}
        >
          {(data?.packet ?? "Prozessfluss").replace(/ Â· 1$/, "")}
        </span>
      </EdgeLabelRenderer>}
      <EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={selected}>
        <span className="eos-chip">Leitung Â· Details im RÃ¶ntgen-Inspektor</span>
      </EdgeToolbar>
    </>
  );
}

function routeSegmentTitle(
  segment: string,
  roster: AgentDef[],
  legalRules: LegalRule[],
  capabilities: Capability[],
  bindings: Binding[],
  traces: LiveConnectionTraceDto[]
) {
  const agentNumber = /^agent-(\d+)$/.exec(segment)?.[1];
  if (agentNumber) {
    const agent = roster.find((item) => item.number === Number(agentNumber));
    return agent ? `#${agent.number} Â· ${agent.name}` : `#${agentNumber}`;
  }
  const departmentId = /^department-(\d+)$/.exec(segment)?.[1];
  if (departmentId) return DEPARTMENTS.find((item) => item.id === Number(departmentId))?.name ?? `Abteilung ${departmentId}`;
  const traceId = /^trace-(.+)$/.exec(segment)?.[1];
  if (traceId) {
    const trace = traces.find((item) => item.id === traceId);
    return trace ? `${trace.agentKey ?? "System"} â†’ ${trace.channelKey}` : "Trace";
  }
  const ruleId = /^rule-(.+)$/.exec(segment)?.[1];
  if (ruleId) {
    const rule = legalRules.find((item) => item.id === ruleId);
    return rule ? `${rule.ruleKey} Â· ${rule.jurisdiction}` : "Rechtsregel";
  }
  const capabilityId = /^capability-(.+)$/.exec(segment)?.[1];
  if (capabilityId) return capabilities.find((item) => item.id === capabilityId)?.displayName ?? "Capability";
  const bindingId = /^binding-(.+)$/.exec(segment)?.[1];
  if (bindingId) return bindings.find((item) => item.id === bindingId)?.interfaceKey ?? "Schnittstelle";
  const cluster = roster.find((agent) => agent.specialistCluster === segment);
  if (cluster) return cluster.specialistCluster === "apex-system-coordinator" ? "#400 Â· System-Koordinator" : cluster.role;
  return TITLE_MAP[segment] ?? segment;
}

function makeAgentEntity(
  agent: AgentDef,
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary
): Entity {
  const result = performance.byAgent[agent.key];
  const revenue = earnings.perAgent[agent.key];
  const legendId: LegendId = agent.number === 221 ? "control" : agent.auditDomain ? "control" : agent.departmentId === 5 || agent.departmentId === 23 ? "expertise" : "process";
  const trend = result?.trend === "UP" ? "â–²" : result?.trend === "DOWN" ? "â–¼" : result?.trend === "STABLE" ? "â–º" : "â€”";
  return {
    id: `agent-${agent.number}`,
    title: `#${agent.number} Â· ${agent.name}`,
    description: agent.mission,
    group: "staff",
    legendId,
    sourceType: "agent",
    sourceId: agent.key,
    reportsTo: agent.reportsTo,
    agentNumber: agent.number,
    relationKey: agent.key,
    relationKeys: [agent.key],
    metrics: [
      agent.role,
      `Note ${result?.grade == null ? "n.v." : result.grade.toFixed(1).replace(".", ",")}`,
      `${trend} Â· ${result?.xp ?? 0} XP`,
      `Echt ${eur(revenue?.monthReal ?? 0)}`,
      `Potenzial ${eur(revenue?.monthPotential ?? 0)}`,
    ],
  };
}

function eur(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function entityForTrace(trace: LiveConnectionTraceDto, roster: AgentDef[]): Entity {
  const agent = roster.find((item) => item.key === trace.agentKey);
  const legendId: LegendId = trace.outcome !== "SUCCESS" || agent?.number === 221
    ? "control"
    : agent?.departmentId === 21 || agent?.departmentId === 22
      ? "consensus"
      : "data";
  return {
    id: `trace-${trace.id}`,
    title: `${trace.agentKey ?? "System"} â†’ ${trace.channelKey}`,
    description: `${trace.eventType} Â· ${trace.outcome} Â· ${new Date(trace.occurredAt).toLocaleString("de-DE")}`,
    group: "trace",
    legendId,
    sourceType: "trace",
    sourceId: trace.id,
    relationKey: trace.agentKey ?? undefined,
    relationKeys: [trace.agentKey, trace.channelKey].filter((value): value is string => Boolean(value)),
    metrics: [trace.detail ?? "Kein Detail protokolliert", ...(trace.requestHash ? [`Request ${trace.requestHash.slice(0, 12)}â€¦`] : [])],
  };
}

function getAgentScope(
  roster: AgentDef[],
  startNumbers: number[],
  includeDescendants = true
): AgentDef[] {
  const agentsByNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const included = new Set(startNumbers.filter((number) => agentsByNumber.has(number)));
  const pending = [...included];
  while (pending.length) {
    const agent = agentsByNumber.get(pending.pop()!);
    if (agent?.reportsTo != null && agentsByNumber.has(agent.reportsTo) && !included.has(agent.reportsTo)) {
      included.add(agent.reportsTo);
      pending.push(agent.reportsTo);
    }
  }
  if (includeDescendants) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const agent of roster) {
        if (agent.reportsTo != null && included.has(agent.reportsTo) && !included.has(agent.number)) {
          included.add(agent.number);
          changed = true;
        }
      }
    }
  }
  return roster.filter((agent) => included.has(agent.number));
}

function makeAgentForest(
  roster: AgentDef[],
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary
): Entity[] {
  const agentsByNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const childrenByNumber = new Map<number, AgentDef[]>();
  const roots: AgentDef[] = [];
  for (const agent of roster) {
    if (agent.reportsTo != null && agentsByNumber.has(agent.reportsTo) && agent.reportsTo !== agent.number) {
      const children = childrenByNumber.get(agent.reportsTo) ?? [];
      children.push(agent);
      childrenByNumber.set(agent.reportsTo, children);
    } else {
      roots.push(agent);
    }
  }

  const visited = new Set<number>();
  const buildTree = (agent: AgentDef, depth: number): Entity => {
    visited.add(agent.number);
    const children = (childrenByNumber.get(agent.number) ?? [])
      .filter((child) => !visited.has(child.number))
      .sort((left, right) => left.number - right.number)
      .map((child) => buildTree(child, depth + 1));
    const entity = makeAgentEntity(agent, performance, earnings);
    return { ...entity, depth, ...(children.length ? { children, layout: "stack" as const } : {}) };
  };
  const result = roots
    .sort((left, right) => left.number - right.number)
    .map((agent) => buildTree(agent, 0));
  for (const agent of roster) {
    if (!visited.has(agent.number)) result.push(buildTree(agent, 0));
  }
  return result;
}

function makeEntity(
  id: string,
  title: string,
  description: string,
  legendId: LegendId,
  options: Partial<Entity> = {}
): Entity {
  const toneByLegend: Record<LegendId, EntityTone> = {
    command: "obsidian",
    expertise: "sapphire",
    control: "burgundy",
    process: "bronze",
    infrastructure: "steelSlate",
    feedback: "sageEmerald",
    consensus: "emerald",
    data: "petrol",
  };
  return {
    id,
    title,
    description,
    legendId,
    group: options.group ?? "detail",
    route: options.route ?? id,
    tone: options.tone ?? toneByLegend[legendId],
    ...options,
  };
}

function makeSection(
  id: string,
  title: string,
  children: Entity[],
  options: Partial<Entity> = {}
): Entity {
  const defaultRoutes: Record<string, string> = {
    "academic-qualification": "academy",
    "knowledge-management": "knowledge",
    "synthetic-data": "core-ai",
    "pillar-workflow": "departments",
    "pillar-communication": "departments",
    "pillar-integration": "interfaces",
    "pillar-support": "departments",
    "world-ecosystem": "interfaces",
    "data-telemetry": "traces",
    "org-directory": "staff",
  };
  return makeEntity(id, title, options.description ?? "", options.legendId ?? "infrastructure", {
    ...options,
    route: options.route ?? defaultRoutes[id] ?? id,
    children,
    layout: options.layout ?? "stack",
  });
}

function makeDepartmentEntity(
  department: (typeof DEPARTMENTS)[number],
  roster: AgentDef[],
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary,
  tone: EntityTone
): Entity {
  const head = roster.find((agent) => agent.number === department.headNumber);
  const count = roster.filter((agent) => agent.departmentId === department.id).length;
  return makeSection(
    `department-${department.id}`,
    `Abt. ${department.id} Â· ${department.name}`,
    [
      head
        ? makeAgentEntity(head, performance, earnings)
        : makeEntity(`department-head-${department.id}`, "Abteilungsleitung", "Profil nicht in den sichtbaren Roster-Daten.", "expertise", { clickable: false }),
      makeEntity(`department-roster-${department.id}`, "Hierarchischen Bereich Ã¶ffnen", `${count} Profile Â· Leitung #${department.headNumber ?? "â€”"}`, "expertise", {
        route: `department-${department.id}`,
        metrics: ["Team-Drilldown"],
      }),
    ],
    {
      description: department.mechanism,
      legendId: "expertise",
      route: `department-${department.id}`,
      tone,
      sourceType: "department",
      sourceId: String(department.id),
    }
  );
}


function makeColumn(
  id: string,
  title: string,
  width: number,
  children: Entity[],
  description: string
): Entity {
  return makeEntity(id, title, description, "infrastructure", {
    column: Number(id.slice(-1)) as 1 | 2 | 3 | 4,
    width,
    isColumn: true,
    children,
    clickable: false,
    layout: "stack",
  });
}

function buildRootEntities(props: Props, traces: LiveConnectionTraceDto[]): Entity[] {
  const allowedDepartments = DEPARTMENTS.filter((department) => props.allowedDepartmentIds.includes(department.id));
  const visibleRoster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
  const curator = visibleRoster.find((agent) => agent.number === 399);
  const meta = props.ownerShop ? visibleRoster.find((agent) => agent.number === 0) : undefined;
  const pillarTones: Record<string, EntityTone> = {
    "pillar-workflow": "workflowBlue",
    "pillar-communication": "bronze",
    "pillar-integration": "burgundy",
    "pillar-support": "emerald",
  };
  const pillarDirectory = (pillarId: string) => {
    const tone = pillarTones[pillarId];
    const departments = DEPARTMENTS.filter((department) =>
      props.allowedDepartmentIds.includes(department.id) &&
      PILLAR_DEPARTMENT_IDS[pillarId]?.includes(department.id)
    );
    const directorNumbers = [...new Set(departments.map((department) => department.directorNumber).filter((number): number is number => number != null))];
    const directors = directorNumbers
      .map((number) => visibleRoster.find((agent) => agent.number === number))
      .filter((agent): agent is AgentDef => Boolean(agent))
      // Kompakte Zeile statt voller Karte (Details: Klick = Unterseite, â“˜ = RÃ¶ntgen-Inspektor, Baum = Hierarchie).
      .map((agent) => ({
        ...makeAgentEntity(agent, props.performance, props.earnings),
        description: agent.role,
        metrics: undefined,
        tone: "whiteCard" as const,
      }));
    // Kompakte Startansicht (16:9): eine Zeile mit echten Zahlen je SÃ¤ule. Direktoren, Fachbereiche und alle
    // Profile bleiben per Klick (Unterseite), im Hierarchie-Baum und im Glasplatten-Schichtenblick erreichbar.
    const deptIds = new Set(departments.map((department) => department.id));
    const inPillar = visibleRoster.filter((agent) => deptIds.has(agent.departmentId));
    const teamLeads = inPillar.filter((agent) => agent.level === 4).length;
    const coAgents = inPillar.filter((agent) => agent.level === 5).length;
    return [
      makeEntity(
        `${pillarId}-summary`,
        `${directors.length} Direktoren Â· ${departments.length} Fachbereiche`,
        `Team Leads ${teamLeads} Â· Team Members ${inPillar.length} Â· Operative Bots ${coAgents}`,
        "expertise",
        { route: pillarId, tone: "whiteCard", clickable: true }
      ),
    ];
  };
  const columnOne = [
    makeSection("academic-qualification", "AKADEMISCHE QUALIFIKATION", [
      makeSection("academic-personnel", "Fach- & Forschungsrollen", [
        makeEntity("professor-agents", "Professoren-Agenten", "Lehrplan-Design & Forschung Â· Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
        makeEntity("lecturer-agents", "Dozenten-Agenten", "Fachdidaktik & Mentoring Â· Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
        makeEntity("prompt-alchemist", "Prompt-Alchemist-Agent", "Feinabstimmung & Metrik-Analyse Â· Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
        makeEntity("distillation-agent", "Distillation-Agent", "Modellkomprimierung & Wissenstransfer Â· Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
      ], { layout: "stack", legendId: "expertise", tone: "sapphire" }),
      makeSection("certification-gateways", "CERTIFICATION GATEWAYS", [
        makeEntity("training-connection", "Schulungs-Anschluss", "Kurs- und Lernpfad", "expertise", { clickable: false, tone: "whiteCard" }),
        makeEntity("live-testing", "Live-Testing", "Zertifizierungsstatus aus vorhandenen Profilwerten", "consensus", { clickable: false, tone: "whiteCard" }),
        makeEntity("recertification", "Re-Zertifizierung", "PrÃ¼fintervall nicht separat im Roster gespeichert", "control", { clickable: false, tone: "whiteCard" }),
        makeEntity("expert-registration", "Experten-Anmeldung & Dialog-Portal", "Keine separate Anmeldeintegration in dieser Ansicht", "expertise", { clickable: false, tone: "whiteCard" }),
      ], { layout: "stack", legendId: "consensus", tone: "violet" }),
    ], { layout: "split", legendId: "expertise", tone: "sapphire" }),
    makeSection("knowledge-management", "WISSENS- & GEDÃ„CHTNIS-MANAGEMENT", [
      makeEntity("vector-database", "Zentrale Vektordatenbank / RAG", "Quellkonzept; keine Vektorsuche aus dieser Platine ausgelÃ¶st.", "infrastructure", { clickable: false, tone: "turquoise" }),
      curator
        ? {         ...makeAgentEntity(curator, props.performance, props.earnings), id: "agent-399", title: "Wissens-Kurator-Agent #399", tone: "turquoise" }
        : makeEntity("knowledge-curator", "Wissens-Kurator-Agent #399", "Profil #399 ist in diesem Shop-Roster nicht verfÃ¼gbar.", "expertise", { clickable: false, tone: "turquoise" }),
        makeEntity("episodic-memory", "Episodisches Kurzzeit-Memory", "Wissensbereich", "data", { clickable: false, tone: "turquoise" }),
        makeEntity("knowledge-graph", "Knowledge-Graph", `${props.legalRules.length} Rechtsquellen Â· ${props.capabilities.length} Capabilities`, "infrastructure", { clickable: false, tone: "turquoise" }),
    ], { layout: "stack", legendId: "infrastructure", tone: "petrol" }),
  ];

  const columnTwo = [
    props.ownerShop
      ? makeEntity("owner-architect", "APP-INHABER / SYSTEM-ARCHITEKT (MENSCH)", "Antik-Gold Â· Command & Alignment Control â”€â”€â–¶ Meta-KI #000", "command", {
        dark: true,
        tone: "antiqueGold",
        metrics: ["OWNER VETO", "DRY_RUN_MODE"],
      })
      : makeEntity("owner-hidden", "Inhabersteuerung", "Owner-only; fÃ¼r Subscriber ausgeblendet.", "command", { clickable: false }),
    makeSection("core-ai", "CORE AI R&D & OMNI-SENSE LAYER", [
      makeEntity("llm-kernel", "Large Language Model (LLM) Kernel", "Core-AI-Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
      makeEntity("rl-optimization", "Reinforcement Learning (RL) Optimization", "Core-AI-Funktionsbereich", "feedback", { clickable: false, tone: "whiteCard" }),
      makeEntity("neuro-symbolic", "Neuro-Symbolic AI Integration", "Core-AI-Funktionsbereich", "expertise", { clickable: false, tone: "whiteCard" }),
      makeEntity("ethical-ai", "Ethical AI Design Labs", "Core-AI-Funktionsbereich", "control", { clickable: false, tone: "whiteCard" }),
    ], { layout: "stack", legendId: "expertise", tone: "platinumSlate" }),
    makeSection("synthetic-data", "SYNTHETIC DATA GENERATOR", [
      makeEntity("synthetic-scenarios", "Trainingsszenarien", "Funktionsbereich", "data", { clickable: false, tone: "whiteCard" }),
      makeEntity("edge-case-coverage", "Edge-Case-Abdeckung", "Funktionsbereich", "control", { clickable: false, tone: "whiteCard" }),
      makeEntity("validation-data", "Validierungsdaten", "Keine kÃ¼nstlichen Events werden erzeugt.", "data", { clickable: false, tone: "whiteCard" }),
    ], { layout: "stack", legendId: "data", tone: "softSlate" }),
  ];

  const constitutional = makeSection("constitutional", "CONSTITUTIONAL CORE Â· UNANTASTBARE VERFASSUNG & ETHIK-KERN", [
    makeEntity("agent-factory-constitutional", "Agenten-Fabrik & HR", `#401 â†’ âˆž Â· ${props.dynamicCount} dynamische Profile geladen`, "feedback", { route: "agent-factory", metrics: ["OWNER ONLY"], tone: "whiteCard" }),
    makeEntity("governance-board", "Autonomes Governance Board", "Governance-Ansicht; keine AusfÃ¼hrung durch diese Karte.", "control", { clickable: false, tone: "whiteCard" }),
    makeEntity("consensus-jury", "Consensus-Engine & Jury", "PrÃ¼fprofile #222â€“#225", "consensus", { route: "staff", metrics: ["#222â€“#225"], tone: "whiteCard" }),
    makeEntity("devils-advocate", "Devil's Advocate Â· Kritiker-Agent #221", "Profil-Drilldown zum vorhandenen Roster-Eintrag.", "control", { route: "agent-221", metrics: ["#221"], tone: "whiteCard" }),
  ], { layout: "row", legendId: "control", dark: true, tone: "obsidian" });

  const process = makeSection("process-orchestration", "PROCESS ORCHESTRATION LAYER", [
    makeSection("planning-phases", "Planning â”€â”€â–¶ Execution â”€â”€â–¶ Execution â”€â”€â–¶ Reporting â”€â”€â–¶ Reporting", [
      makeEntity("planning-phase", "Planning", "Ablaufphase", "process", { clickable: false }),
      makeEntity("execution-phase-a", "Execution", "Ablaufphase", "process", { clickable: false }),
      makeEntity("execution-phase-b", "Execution", "Ablaufphase", "process", { clickable: false }),
      makeEntity("reporting-phase-a", "Reporting", "Ablaufphase", "process", { clickable: false }),
      makeEntity("reporting-phase-b", "Reporting", "Ablaufphase", "process", { clickable: false }),
    ], { layout: "row", legendId: "process", tone: "iceBlue" }),
    makeSection("four-pillars", "FACHBEREICHE & ECOSYSTEM", [
      makeSection("pillar-workflow", "WORKFLOW & AUTOMATISIERUNG", [
        makeEntity("workflow-vp", "Bereichsleitung VP/Direktor", "Reale Leitung wird im Abteilungs-Drilldown angezeigt.", "expertise", { clickable: false }),
        makeEntity("workflow-team-lead", "Team Lead", "Reale Rollenprofile nach Abteilung.", "expertise", { clickable: false }),
        makeEntity("workflow-team-members", "Team Members", `${allowedDepartments.length} shop-sichtbare Fachabteilungen`, "expertise", { clickable: false }),
        makeEntity("workflow-workers", "Operative Bots & Worker", "Dynamische Profile bleiben separat gelistet.", "data", { clickable: false }),
        ...pillarDirectory("pillar-workflow"),
      ], { layout: "stack", legendId: "expertise", tone: "workflowBlue", route: "pillar-workflow" }),
      makeSection("pillar-communication", "KOMMUNIKATION & CONTENT", [
        makeEntity("communication-vp", "Bereichsleitung VP/Direktor", "BereichsÃ¼bersicht", "expertise", { clickable: false }),
        makeEntity("sales-marketing", "Sales & Marketing Teams", "BereichsÃ¼bersicht", "process", { clickable: false }),
        makeEntity("content-dialog", "Content- & Dialog-Teams", "BereichsÃ¼bersicht", "process", { clickable: false }),
        makeEntity("dialog-workers", "Operative Dialog-Worker", "BereichsÃ¼bersicht", "data", { clickable: false }),
        ...pillarDirectory("pillar-communication"),
      ], { layout: "stack", legendId: "process", tone: "bronze", route: "pillar-communication" }),
      makeSection("pillar-integration", "CODE & SYSTEM-INTEGRATION", [
        makeEntity("integration-vp", "Bereichsleitung VP/Direktor", "BereichsÃ¼bersicht", "expertise", { clickable: false }),
        makeEntity("integration-team-lead", "Team Lead", "BereichsÃ¼bersicht", "expertise", { clickable: false }),
        makeEntity("api-specialists", "API-, Datenbank- & Core-Spezialisten", `${props.bindings.length} tatsÃ¤chliche Interface-Bindings`, "infrastructure", { route: "interfaces" }),
        makeEntity("code-workers", "Operative Code-Worker", "BereichsÃ¼bersicht", "data", { clickable: false }),
        ...pillarDirectory("pillar-integration"),
      ], { layout: "stack", legendId: "control", tone: "burgundy", route: "pillar-integration" }),
      makeSection("pillar-support", "SUPPORT & NUTZER-INTERAKTION", [
        makeEntity("support-vp", "Bereichsleitung VP/Direktor", "BereichsÃ¼bersicht", "expertise", { clickable: false }),
        makeEntity("support-feedback", "Support & Feedback Teams", "BereichsÃ¼bersicht", "process", { clickable: false }),
        makeEntity("anomaly-support", "Anomaly- & Support-Bots", "BereichsÃ¼bersicht", "control", { clickable: false }),
        makeEntity("support-workers", "Operative Bots & Worker", "BereichsÃ¼bersicht", "data", { clickable: false }),
        ...pillarDirectory("pillar-support"),
      ], { layout: "stack", legendId: "consensus", tone: "emerald", route: "pillar-support" }),
      makeSection("world-ecosystem", "EXTENDED REAL-WORLD ECOSYSTEM & SUPPLY CHAIN", [
        makeEntity("purchasing-agent", "Einkaufs-Agent", "Funktionsbereich", "process", { clickable: false }),
        makeEntity("logistics-optimizer", "Logistik-Optimierer", "Funktionsbereich", "infrastructure", { clickable: false }),
        makeEntity("inventory-manager", "Bestands-Manager", "Funktionsbereich", "data", { clickable: false }),
        makeEntity("customer-market", "KUNDEN-BEZIEHUNG & MARKT-INTEGRATION", "CRM, Markt-Trends und Marketing-Automation", "process", { route: "interfaces" }),
        makeEntity("crm-agent", "CRM-Agent", "Funktionsbereich", "process", { clickable: false }),
        makeEntity("market-trend-watcher", "Markt-Trend-Watcher", "Funktionsbereich", "feedback", { clickable: false }),
        makeEntity("marketing-automation", "Marketing-Automation", "Funktionsbereich", "process", { clickable: false }),
      ], { layout: "stack", legendId: "process", tone: "sandBronze", route: "interfaces" }),
    ], { layout: "grid", legendId: "process", tone: "obsidian" }),
    makeEntity("event-bus", "REAL-TIME EVENT-BUS & MESSAGE BROKER", `${traces.length} tatsÃ¤chliche Live-Traces Â· asynchrone Kommunikation / Event-Sourcing`, "data", {
      tone: "champagne",
      metrics: ["Latenz aus Trace-Detail, falls vorhanden"],
    }),
    makeSection("data-telemetry", "DATA FLOW & PERFORMANCE", [
      makeSection("integrated-ecosystem", "INTEGRATED ECOSYSTEM & DATA FLOW", [
        makeEntity("micropipelines", "Enterprise Micropipelines", "Architekturkarte", "data", { clickable: false }),
        makeEntity("etl-mesh", "ETL Service Mesh", `${props.capabilities.length} Capability-Quellen`, "infrastructure", { route: "interfaces" }),
      ], { legendId: "data", tone: "turquoise" }),
      makeSection("system-performance", "SYSTEM PERFORMANCE & TELEMETRY (A/B TESTING)", [
        makeEntity("kpi-dashboard", "KPI Dashboard", "Nutzungs- und Performance-Daten", "feedback", { clickable: false }),
        makeEntity("usage-logging", "Usage Statistics & Logging", `${traces.length} Live-Traces verfÃ¼gbar`, "data", { route: "traces" }),
      ], { legendId: "feedback", tone: "iceBlue" }),
    ], { layout: "row", legendId: "data", tone: "whiteCard" }),
    makeSection("infrastructure", "CORE TECHNICAL INFRASTRUCTURE BACKBONE", [
      makeEntity("tool-registry", "Tool-Registry & Sandbox", "Architekturkarte", "infrastructure", { clickable: false, tone: "whiteCard" }),
      makeEntity("safety-controls", "Notfall- & Fallback-Systeme", "Eskalations-Router Â· Human-in-the-Loop #220 Â· Kill-Switch", "control", { clickable: false, tone: "whiteCard" }),
      makeEntity("version-control", "Versionskontrolle & Rollback", "Prompt-Registry Â· 1-Klick-Rollback Â· Modell-Routing", "feedback", { clickable: false, tone: "whiteCard" }),
      makeEntity("zero-trust", "Zero-Trust Security & Multi-Cloud-Edge-Compute Router", "Architekturkarte", "infrastructure", { clickable: false, tone: "whiteCard" }),
    ], { layout: "row", legendId: "infrastructure", dark: true, tone: "steelSlate" }),
    makeSection("org-directory", "KI-BELEGschaft & ABTEILUNGEN", [
      makeEntity("departments", "Shop-sichtbare Fachabteilungen", `${allowedDepartments.length} Abteilungen`, "expertise"),
      makeEntity("staff", "Alle realen Mitarbeiterprofile", `${visibleRoster.length} feste/dynamische Profile Â· 50 pro Seite`, "expertise"),
      makeEntity("specialists", "Fachcluster #301â€“#400", "Profile nach Cluster", "expertise"),
      ...(props.ownerShop ? [makeEntity("agent-factory-directory", "Dynamische KI-Fabrik #401 â†’ âˆž", `${props.dynamicCount} geladene dynamische Profile`, "feedback", { route: "agent-factory" })] : []),
    ], { layout: "row", legendId: "expertise" }),
  ], { layout: "stack", legendId: "process", tone: "processLayer" });
  const metaSection = meta
    ? {
      ...makeAgentEntity(meta, props.performance, props.earnings),
      id: "meta-hypervisor",
      title: "ÃœBERGEORDNETE META-KI HYPERVISOR-INSTANZ Â· #000 SYSTEM-GUARDIAN",
      route: "meta-hypervisor",
      dark: true,
      tone: "royalBlue" as const,
      legendId: "command" as const,
    }
    : makeEntity(
      "meta-hypervisor",
      "ÃœBERGEORDNETE META-KI HYPERVISOR-INSTANZ Â· #000 SYSTEM-GUARDIAN",
      "Owner-only System-Guardian",
      "command",
      { dark: true, tone: "royalBlue", metrics: ["#000"] }
    );
  const columnThree = [
    ...(props.ownerShop ? [constitutional, metaSection] : []),
    process,
  ];

  const ownerColumnFour = [
    makeSection("self-healing", "KI-ÃœBERWACHUNG & SELF-HEALING", [
      makeEntity("quality-verifier", "KI-QM & Quellen-Verifikator", `${props.legalRules.length} Rechtsregeln Â· ${props.capabilities.length} Capabilities`, "control", { route: "laws" }),
      makeEntity("red-team", "Red-Teaming & Chaos-Monkey-Agent", "PrÃ¼fbereich; kein Chaos-Test wird hier gestartet.", "control", { clickable: false }),
      makeEntity("code-surgeon", "Live-Code-Chirurg / Auto-Patch", "Nicht Ã¼ber die Platinenkarte ausfÃ¼hrbar.", "feedback", { clickable: false }),
      makeEntity("finops-watchdog", "FinOps, Watchdog & DSB", "Ãœberwachungsbereich", "feedback", { clickable: false }),
      makeSection("external-ecosystem", "Externes Ã–kosystem & A2A/UCP-Marktplatz", props.bindings.map((binding) =>
        makeEntity(
          `binding-${binding.id}`,
          binding.interfaceKey,
          `${binding.agentKey} Â· ${binding.status}`,
          binding.isNewlySpawnedInterface ? "command" : "infrastructure",
          { sourceType: "binding", sourceId: binding.id, relationKeys: [binding.agentKey, binding.interfaceKey], newlySpawned: binding.isNewlySpawnedInterface }
        )
      ), { legendId: "infrastructure", tone: "sandBronze", route: "interfaces" }),
    ], { legendId: "feedback", tone: "sageEmerald" }),
    makeSection("ledger", "UNVERÃ„NDERLICHES ENTSCHEIDUNGS-LEDGER", [
      makeEntity("transaction-log", "Transaktions-Protokollierung", `${traces.length} Live-Traces`, "data", { route: "traces" }),
      makeEntity("audit-trail", "Audit-Trail-Sicherung", `${props.legalRules.length} Rechtsquellen`, "control", { route: "laws" }),
      makeEntity("crypto-validation", "Krypto-Validierung Â· GoBD SHA-256", "Quell- und Trace-Hashes, sofern gespeichert; kein zusÃ¤tzliches GoBD-Siegel.", "control", { route: "laws" }),
      ...traces.map((trace) => entityForTrace(trace, visibleRoster)),
    ], { legendId: "control", dark: true, tone: "deepBordeaux" }),
  ];
  const subscriberColumnFour = [
    makeSection("subscriber-sources", "QUELLEN & SYSTEMSTATUS", [
      makeEntity("laws", "Rechts- & Steuerquellen", `${props.legalRules.length} shop-sichtbare Quellen`, "control", { clickable: false }),
      makeEntity("interfaces", "Capabilities & Bindings", `${props.capabilities.length} Capabilities Â· ${props.bindings.length} Bindings`, "infrastructure", { clickable: false }),
      makeEntity("traces", "Gespeicherte Live-Traces", `${traces.length} shop-sichtbare Ereignisse`, "data", { clickable: false }),
    ], { legendId: "infrastructure" }),
  ];
  const columnFour = props.ownerShop ? ownerColumnFour : subscriberColumnFour;

  return [
    makeColumn("column-1", "SPALTE 1 Â· WISSEN & QUALIFIKATION", 310, columnOne, "Akademie Â· Zertifizierung Â· GedÃ¤chtnis"),
    makeColumn("column-2", "SPALTE 2 Â· INHABER & CORE AI", 250, columnTwo, "Command Â· R&D Â· synthetische Validierung"),
    makeColumn("column-3", "SPALTE 3 Â· HAUPT-MATRIX", 920, columnThree, "Governance Â· Orchestrierung Â· Event-Bus Â· Backbone"),
    makeColumn("column-4", "SPALTE 4 Â· ÃœBERWACHUNG & LEDGER", 310, columnFour, "QualitÃ¤t Â· Audit Â· Quellen"),
  ];
}

function buildChildren(
  path: string[],
  props: Props,
  traces: LiveConnectionTraceDto[]
): Entity[] {
  const leaf = path[path.length - 1];
  const departments = DEPARTMENTS.filter((department) => props.allowedDepartmentIds.includes(department.id));
  const roster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
  const toAgent = (agent: AgentDef) => makeAgentEntity(agent, props.performance, props.earnings);

  if (!leaf) return buildRootEntities(props, traces);
  if (!props.ownerShop && ["owner-architect", "constitutional", "meta-hypervisor", "agent-factory"].includes(leaf)) return [];
  const pillarId = Object.prototype.hasOwnProperty.call(PILLAR_DEPARTMENT_IDS, leaf) ? leaf : undefined;
  if (pillarId) {
    const toneByPillar: Record<string, EntityTone> = {
      "pillar-workflow": "workflowBlue",
      "pillar-communication": "bronze",
      "pillar-integration": "burgundy",
      "pillar-support": "emerald",
    };
    return DEPARTMENTS
      .filter((department) =>
        props.allowedDepartmentIds.includes(department.id) &&
        PILLAR_DEPARTMENT_IDS[pillarId].includes(department.id)
      )
      .map((department) => makeDepartmentEntity(
        department,
        roster,
        props.performance,
        props.earnings,
        toneByPillar[pillarId]
      ));
  }
  if (["workflow", "process-orchestration"].includes(leaf)) {
    return [
      { id: "event-bus", title: "Real-Time Event-Bus", description: `${traces.length} gespeicherte Traces`, group: "center", legendId: "data", metrics: ["Live-Ereignisse"] },
      { id: "traces", title: "Beobachtete Verbindungen", description: "Nur protokollierte Ereignisse", group: "center", legendId: "data" },
      { id: "departments", title: "Fachabteilungen", description: `${departments.length} sichtbare Abteilungen`, group: "center", legendId: "expertise" },
    ];
  }
  if (leaf === "event-bus") {
    return [
      { id: "integrated-ecosystem", title: "Integrated Ecosystem", description: "Capabilities, Schnittstellen und DatenflÃ¼sse.", group: "center", legendId: "data" },
      { id: "traces", title: "Beobachtete Verbindungen", description: `${traces.length} tatsÃ¤chlich gespeicherte Ereignisse`, group: "center", legendId: "data" },
    ];
  }
  if (leaf === "integrated-ecosystem") {
    return [
      { id: "interfaces", title: "Schnittstellen-Detail", description: `${props.capabilities.length} Capabilities Â· ${props.bindings.length} Bindings`, group: "center", legendId: "infrastructure" },
      { id: "system-performance", title: "System Performance & Telemetry", description: "Vorhandene Pulse-/Trace-Daten; kein erfundener A/B-Teststatus.", group: "center", legendId: "feedback" },
    ];
  }
  if (leaf === "owner-architect") {
    return [
      { id: "constitutional", title: "Owner-Veto & Constitutional Core", description: "Owner-Regeln und bestehende Schutzebenen.", group: "center", legendId: "command", metrics: ["Owner-only"] },
      { id: "agent-0", title: "#000 Â· System-Guardian", description: "Personalakte aus den vorhandenen Roster-Daten.", group: "center", legendId: "command" },
    ];
  }
  if (leaf === "core-ai") {
    return [
      { id: "specialists", title: "Fachcluster", description: "Vorhandene Mitarbeitercluster.", group: "center", legendId: "expertise" },
      { id: "interfaces", title: "Capabilities & Schnittstellen", description: "Gespeicherte Quellen und Bindings.", group: "center", legendId: "infrastructure" },
    ];
  }
  if (leaf === "academy") return makeAgentForest(roster, props.performance, props.earnings);
  if (leaf === "constitutional") {
    const constitutionalAgents = roster.filter((agent) => [0, 221, 222, 223, 224, 225, 400].includes(agent.number));
    return makeAgentForest(
      getAgentScope(roster, constitutionalAgents.map((agent) => agent.number)),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "meta-hypervisor") {
    const metaAgent = roster.find((agent) => agent.number === 0);
    if (!metaAgent) return [];
    const systemGuardian = {
      ...toAgent(metaAgent),
      id: "agent-0",
      title: "#000 Â· System-Guardian",
      route: "agent-0",
      tone: "obsidian" as const,
      children: makeAgentForest(
        roster.filter((agent) => agent.number !== 0),
        props.performance,
        props.earnings
      ),
    };
    return [systemGuardian];
  }
  if (leaf === "infrastructure" || leaf === "self-healing") {
    return [
      { id: "interfaces", title: "Capability-Quellen & Bindings", description: `${props.capabilities.length} Capabilities Â· ${props.bindings.length} Schnittstellen`, group: "center", legendId: "infrastructure" },
      { id: "traces", title: "Live-Traces", description: `${traces.length} tatsÃ¤chlich gespeicherte Ereignisse`, group: "center", legendId: "data" },
      { id: "laws", title: "Rechts- & Steuerquellen", description: `${props.legalRules.length} Ledger-EintrÃ¤ge`, group: "center", legendId: "control" },
    ];
  }
  if (leaf === "traces") return traces.map((trace) => entityForTrace(trace, roster));
  if (leaf === "system-performance") return traces.map((trace) => entityForTrace(trace, roster));
  if (leaf === "interfaces" || leaf === "knowledge") {
    return [
      ...props.capabilities.map((item) => ({
        id: `capability-${item.id}`,
        title: item.displayName,
        description: `${item.feasibility} Â· ${item.isVerified ? "Quelle geprÃ¼ft" : "nicht verifiziert"}${item.verifiedAt ? ` Â· ${new Date(item.verifiedAt).toLocaleDateString("de-DE")}` : ""}`,
        group: "interface",
        legendId: "infrastructure" as LegendId,
        sourceType: "capability" as const,
        sourceId: item.id,
        relationKey: item.domainKey,
        relationKeys: [item.domainKey],
        metrics: [item.riskLevel, item.estimatedCostEur == null ? "Kosten nicht angegeben" : eur(item.estimatedCostEur)],
      })),
      ...props.bindings.map((item) => ({
        id: `binding-${item.id}`,
        title: item.interfaceKey,
        description: `${item.agentKey} Â· ${item.status}${item.isNewlySpawnedInterface ? " Â· neu erzeugt" : ""}`,
        group: "interface",
        legendId: item.isNewlySpawnedInterface ? "command" as LegendId : "data" as LegendId,
        sourceType: "binding" as const,
        sourceId: item.id,
        relationKey: props.capabilities.find((capability) =>
          item.interfaceKey === capability.domainKey || item.interfaceKey.startsWith(`${capability.domainKey}:`)
        )?.domainKey,
        relationKeys: [item.agentKey, item.interfaceKey],
        newlySpawned: item.isNewlySpawnedInterface,
        metrics: [item.lastVerifiedAt ? `GeprÃ¼ft ${new Date(item.lastVerifiedAt).toLocaleDateString("de-DE")}` : "Noch nicht geprÃ¼ft"],
      })),
    ];
  }
  if (leaf === "departments") {
    return departments.map((department) => makeDepartmentEntity(
      department,
      roster,
      props.performance,
      props.earnings,
      department.kind === "panel" ? "deepBordeaux" : department.kind === "harmony" ? "sageEmerald" : "steelSlate"
    ));
  }
  const departmentMatch = /^department-(\d+)$/.exec(leaf);
  if (departmentMatch) {
    const departmentId = Number(departmentMatch[1]);
    const departmentAgents = roster.filter((agent) => agent.departmentId === departmentId);
    return makeAgentForest(
      getAgentScope(roster, departmentAgents.map((agent) => agent.number)),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "staff") return makeAgentForest(roster, props.performance, props.earnings);
  if (leaf === "specialists") {
    const clusters = new Map<string, AgentDef[]>();
    for (const agent of roster) {
      if (!agent.specialistCluster) continue;
      const current = clusters.get(agent.specialistCluster) ?? [];
      current.push(agent);
      clusters.set(agent.specialistCluster, current);
    }
    return [...clusters.entries()].map(([cluster, agents]) => ({
      id: cluster,
      title: cluster === "apex-system-coordinator" ? "#400 Â· System-Koordinator" : agents[0]?.role ?? cluster,
      description: `${agents.length} Profile im Cluster`,
      group: "specialists",
      legendId: "expertise",
      metrics: [`#${Math.min(...agents.map((agent) => agent.number))}â€“#${Math.max(...agents.map((agent) => agent.number))}`],
    }));
  }
  if (leaf === "agent-factory") {
    const dynamicAgents = roster.filter((agent) => agent.dynamic);
    return makeAgentForest(
      getAgentScope(roster, dynamicAgents.map((agent) => agent.number), false),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "laws" || leaf === "ledger") {
    return props.legalRules.map((rule) => ({
      id: `rule-${rule.id}`,
      title: `${rule.ruleKey} Â· ${rule.jurisdiction}`,
      description: `${rule.reviewStatus} Â· ${rule.sourceTitle}`,
      group: "law",
      legendId: "control",
      sourceType: "law",
      sourceId: rule.id,
      metrics: [`GeprÃ¼ft ${new Date(rule.verifiedAt).toLocaleDateString("de-DE")}`, `SHA-256 ${rule.sourceHash.slice(0, 12)}â€¦`],
    }));
  }
  const agentMatch = /^agent-(\d+)$/.exec(leaf);
  if (agentMatch) {
    const agent = roster.find((item) => item.number === Number(agentMatch[1]));
    if (!agent) return [];
    const hierarchy = makeAgentForest(
      getAgentScope(roster, [agent.number]),
      props.performance,
      props.earnings
    );
    return [
      ...hierarchy,
      ...traces.filter((trace) => trace.agentKey === agent.key).map((trace) => entityForTrace(trace, roster)),
    ];
  }
  const capabilityMatch = /^capability-(.+)$/.exec(leaf);
  if (capabilityMatch) {
    const capability = props.capabilities.find((item) => item.id === capabilityMatch[1]);
    return capability ? props.bindings.filter((binding) =>
      binding.interfaceKey === capability.domainKey || binding.interfaceKey.startsWith(`${capability.domainKey}:`)
    ).map((binding) => ({
      id: `binding-${binding.id}`,
      title: binding.interfaceKey,
      description: `${binding.agentKey} Â· ${binding.status}`,
      group: "interface",
      legendId: "data",
      sourceType: "binding",
      sourceId: binding.id,
      relationKeys: [binding.agentKey, binding.interfaceKey],
    })) : [];
  }
  if (leaf.startsWith("trace-")) return [];
  if (leaf.startsWith("rule-") || leaf.startsWith("binding-")) return [];
  const clusterAgents = roster.filter((agent) => agent.specialistCluster === leaf);
  if (clusterAgents.length) return makeAgentForest(clusterAgents, props.performance, props.earnings);
  return [];
}

function buildSubpageColumns(
  path: string[],
  props: Props,
  pageEntities: Entity[],
  traces: LiveConnectionTraceDto[]
): Entity[] {
  const visibleRoster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
  const departmentSegment = [...path].reverse().find((segment) => /^department-\d+$/.test(segment));
  const departmentId = departmentSegment ? Number(departmentSegment.slice("department-".length)) : undefined;
  const department = DEPARTMENTS.find((item) => item.id === departmentId);
  const agents = pageEntities.filter((entity) => entity.sourceType === "agent");
  const records = pageEntities.filter((entity) => entity.sourceType !== "agent");
  const director = department?.directorNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === department.directorNumber);
  const leader = department?.headNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === department.headNumber);
  const rules = props.legalRules.map((rule) => makeEntity(
    `rule-${rule.id}`,
    `${rule.ruleKey} Â· ${rule.jurisdiction}`,
    `${rule.reviewStatus} Â· ${rule.sourceTitle}`,
    "control",
    { sourceType: "law", sourceId: rule.id, metrics: [`SHA-256 ${rule.sourceHash.slice(0, 12)}â€¦`] }
  ));
  const capabilities = props.capabilities.map((item) => makeEntity(
    `capability-${item.id}`,
    item.displayName,
    `${item.feasibility} Â· ${item.isVerified ? "Quelle geprÃ¼ft" : "nicht verifiziert"}`,
    "infrastructure",
    { sourceType: "capability", sourceId: item.id, relationKey: item.domainKey, relationKeys: [item.domainKey] }
  ));
  const visibleTraces = traces.map((trace) => entityForTrace(trace, visibleRoster));

  const columnOne = [
    makeSection("subpage-knowledge-rules", "SCHULUNGS-ZERTIFIKATE & WISSENS-REGELN", [
      ...rules,
      ...capabilities,
      makeEntity("subpage-path-record", "Aktueller Breadcrumb-Pfad", path.join(" â€º "), "command", { clickable: false }),
    ], { legendId: "control" }),
  ];
  const columnTwo = [
    makeSection("subpage-leadership", "BEREICHSLEITUNG VP / DIREKTOR", [
      ...(director ? [makeAgentEntity(director, props.performance, props.earnings)] : []),
      ...(leader && leader.number !== director?.number ? [makeAgentEntity(leader, props.performance, props.earnings)] : []),
      ...(!director && !leader
        ? [makeEntity("subpage-no-leadership", department ? `Leitung Â· Abt. ${department.id}` : "ZustÃ¤ndige Bereichsleitung", "Kein sichtbares Leitungsprofil im Roster.", "expertise", { clickable: false })]
        : []),
    ], { layout: "stack", legendId: "expertise", tone: "platinumSlate" }),
    makeSection("subpage-core-models", "KI-KERNMODELLE & ZUSTÃ„NDIGKEIT", [
      makeEntity("subpage-model-policy", "Modell-Routing", "Im bestehenden Roster-/Dashboard-Datensatz nicht je Bereich ausgewiesen.", "infrastructure", { clickable: false }),
      makeEntity("subpage-reversible", "Reversible Aufgaben", "AusfÃ¼hrung bleibt den vorhandenen Autopilot-/Owner-Regeln unterstellt.", "control", { clickable: false }),
      makeEntity("subpage-irreversible", "Irreversible Aufgaben", "Die Karte lÃ¶st keine Freigabe und keine Aktion aus.", "control", { route: "approval-queue" }),
    ], { legendId: "expertise" }),
  ];
  const columnThree = [
    makeSection("subpage-governance", "ABTEILUNGS-GOVERNANCE", [
      ...(department ? [makeEntity(
        `department-${department.id}`,
        `Abt. ${department.id} Â· ${department.name}`,
        department.mechanism,
        "control",
        { sourceType: "department", sourceId: String(department.id) }
      )] : []),
      ...(leader ? [makeAgentEntity(leader, props.performance, props.earnings)] : []),
      ...(records.length ? records : [makeEntity("subpage-no-records", "Keine DetaildatensÃ¤tze", "FÃ¼r diesen Unterpfad liegen keine weiteren DatensÃ¤tze vor.", "infrastructure", { clickable: false })]),
    ], { legendId: "control" }),
    makeSection("subpage-specialists", `TEAM & MITARBEITER Â· ${agents.length} PROFILE`, [
      ...agents,
      ...(props.ownerShop && props.dynamicCount > 0
        ? [makeEntity("subpage-dynamic-cluster", "Dynamische KI-Hilfs-Bots #401 â†’ âˆž", `${props.dynamicCount} dynamische Profile insgesamt; geladene Profile erscheinen hier einzeln.`, "feedback", { route: "agent-factory" })]
        : []),
    ], { legendId: "expertise" }),
    makeEntity("event-bus", "BEREICHS-EVENT-BUS", `${traces.length} tatsÃ¤chlich gespeicherte Ereignisse; keine Trace-Endpunkte angenommen.`, "data", { metrics: ["Event-Sourcing"] }),
    makeSection("subpage-bindings", "AKTIVE SCHNITTSTELLEN & BINDINGS", [
      ...capabilities,
      ...props.bindings.map((binding) => makeEntity(
        `binding-${binding.id}`,
        binding.interfaceKey,
        `${binding.agentKey} Â· ${binding.status}`,
        binding.isNewlySpawnedInterface ? "command" : "data",
        { sourceType: "binding", sourceId: binding.id, relationKeys: [binding.agentKey, binding.interfaceKey], newlySpawned: binding.isNewlySpawnedInterface }
      )),
    ], { legendId: "infrastructure" }),
    makeSection("infrastructure", "CORE TECHNICAL BACKBONE", [
      makeEntity("subpage-sandbox", "Tool-Registry & Sandbox", "Backbone-Architektur", "infrastructure", { clickable: false }),
      makeEntity("subpage-rollback", "Versionierung & 1-Klick-Rollback", "Backbone-Architektur", "feedback", { clickable: false }),
      makeEntity("subpage-zero-trust", "Zero-Trust & Security", "Backbone-Architektur", "control", { clickable: false }),
    ], { legendId: "infrastructure", dark: true, tone: "steelSlate" }),
  ];
  const columnFour = [
    makeSection("subpage-quality", "BEREICHS-QM & PRÃœFUNG", [
      makeEntity("subpage-quality-rules", "Quellen- & RechtsprÃ¼fung", `${props.legalRules.length} Regeln verfÃ¼gbar`, "control", { route: "laws" }),
      makeEntity("subpage-quality-capabilities", "Capability-PrÃ¼fung", `${props.capabilities.length} Quellen Â· ${props.bindings.length} Bindings`, "infrastructure", { route: "interfaces" }),
      makeEntity("subpage-quality-owner", "Owner-Regeln / Dry-Run", "Vorhandene Schutzregeln bleiben maÃŸgeblich; kein Override hier.", "command", { clickable: false }),
    ], { legendId: "control" }),
    makeSection("ledger", `LEDGER-BELEGE Â· ${visibleTraces.length} TRACES`, [
      ...visibleTraces,
      ...rules,
    ], { legendId: "data", dark: true, tone: "deepBordeaux" }),
  ];

  return [
    makeColumn("column-1", "SPALTE 1 Â· ZERTIFIKATE & WISSEN", 310, columnOne, "Regeln Â· FÃ¤higkeiten Â· Pfad"),
    makeColumn("column-2", "SPALTE 2 Â· LEITUNG & MODELLE", 250, columnTwo, "Verantwortung Â· Kern"),
    makeColumn("column-3", "SPALTE 3 Â· BEREICHS-MATRIX", 920, columnThree, "Governance Â· Team Â· Events Â· Bindings"),
    makeColumn("column-4", "SPALTE 4 Â· QM & LEDGER", 310, columnFour, "PrÃ¼fung Â· Traces Â· Nachweise"),
  ];
}

function layoutGraph(
  entities: Entity[],
  focusedId: string | null,
  focusedLegend: LegendId | null,
  visibleLegend: Set<LegendId>,
  onActivate: (entity: Entity) => void,
  onHover: (entity: Entity | null) => void,
  onInspect: (entity: Entity) => void
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const positions = new Map([
    ["column-1", { x: 20, width: 310 }],
    ["column-2", { x: 370, width: 250 }],
    ["column-3", { x: 680, width: 920 }],
    ["column-4", { x: 1680, width: 310 }],
  ]);
  const ownerAccess = entities.some((entity) => entityContains(entity, "owner-architect"));
  const baseLanes: Array<[string, string, LegendId, string]> = [
    ["column-1", "column-3", "expertise", "Akademie / Wissen"],
    ["column-1", "column-3", "data", "Wissensfluss"],
    ["column-2", "column-3", "command", "Command & Alignment"],
    ["column-2", "column-3", "feedback", "Meta Feedback Loop"],
    ["column-3", "column-4", "control", "Control / Audit"],
    ["column-3", "column-4", "data", "Event- & Datenfluss"],
    ["column-1", "column-4", "infrastructure", "Quellen / PrÃ¼fung"],
    ["column-2", "column-4", "consensus", "Governance / Konsens"],
  ];
  const laneSpecs = baseLanes.flatMap(([source, target, legendId, packet], laneIndex) => {
    const siblings = baseLanes.filter((lane) => lane[0] === source && lane[1] === target);
    const siblingIndex = siblings.findIndex((lane) => lane[2] === legendId && lane[3] === packet);
    return Array.from({ length: 5 }, (_, replica) => ({
      source,
      target,
      legendId,
      packet: `${packet} Â· ${replica + 1}`,
      replica,
      id: `lane-${source}-${target}-${legendId}-${laneIndex}-${replica}`,
      laneOffset: (siblingIndex * 5 + replica - (siblings.length * 5 - 1) / 2) * 8,
    }));
  });
  const countEntities = (entity: Entity): number =>
    1 + (entity.children?.reduce((count, child) => count + countEntities(child), 0) ?? 0);
  const columns = entities.filter((entity) => entity.isColumn);
  const relatedIds = getEntityFamily(entities, focusedId);
  const focusedLane = laneSpecs.find((lane) => focusedId === `edge-${lane.id}`);
  if (focusedLane) {
    for (const columnId of [focusedLane.source, focusedLane.target]) {
      const column = columns.find((entity) => entity.id === columnId);
      if (column) flattenEntities([column]).forEach((entity) => relatedIds.add(entity.id));
    }
  }
  const directColumns = new Set<string>();
  for (const column of columns) {
    if (relatedIds.has(column.id) || flattenEntities(column.children ?? []).some((entity) => relatedIds.has(entity.id))) {
      directColumns.add(column.id);
    }
  }
  const activeColumns = focusedLane
    ? new Set([focusedLane.source, focusedLane.target])
    : new Set(directColumns);
  if (!focusedLane) {
    for (const lane of baseLanes) {
      if (directColumns.has(lane[0]) || directColumns.has(lane[1])) {
        activeColumns.add(lane[0]);
        activeColumns.add(lane[1]);
      }
    }
  }
  const allRecords = flattenEntities(entities);
  const traceIds = allRecords
    .filter((entity) => entity.sourceType === "trace" && entity.sourceId)
    .map((entity) => entity.sourceId!);
  const bindingIds = allRecords
    .filter((entity) => entity.sourceType === "binding" && entity.sourceId)
    .map((entity) => entity.sourceId!);
  const nodes: FlowNode[] = columns.map((entity) => {
    const position = positions.get(entity.id) ?? { x: 0, width: entity.width ?? 310 };
    // Gleiche HÃ¶he fÃ¼r alle 4 Spalten -> sauberes 16:9-Breitbild statt unterschiedlich hoher TÃ¼rme.
    const height = COLUMN_HEIGHT;
    return {
      id: entity.id,
      type: "apex",
      position: { x: position.x, y: 0 },
      width: position.width,
      height,
      data: { entity, onActivate, onHover, onInspect, visibleLegend, focusedId, focusedLegend, relatedIds, activeColumns },
      className: (focusedId && !activeColumns.has(entity.id)) ||
        (focusedLegend && !entityContainsLegend(entity, focusedLegend)) ? "eos-dimmed" : "eos-lit",
      ariaLabel: entity.title,
      draggable: false,
    };
  });
  const edges: FlowEdge[] = laneSpecs.map(({ source, target, legendId, packet, id, laneOffset }, laneIndex) => {
    const related = activeColumns.has(source) && activeColumns.has(target);
    const dimmed = Boolean(
      (focusedId && !(focusedLane ? focusedLane.id === id : related)) ||
      (focusedLegend && focusedLegend !== legendId)
    );
    return {
      id,
      source,
      target,
      sourceHandle: `s${laneIndex}`,
      targetHandle: `t${laneIndex}`,
      type: "apex",
      selectable: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS[legendId] },
      style: { stroke: EDGE_COLORS[legendId] },
      data: {
        legendId,
        packet,
        laneOffset,
        dimmed,
        showLabel: focusedLane ? focusedLane.id === id : focusedLegend === legendId && packet.endsWith("Â· 1"),
        fast: legendId === "command" || legendId === "data",
        relatedIds: [source, target],
        traceIds: legendId === "data" || legendId === "control" ? traceIds : [],
        bindingIds: legendId === "infrastructure" || legendId === "expertise" ? bindingIds : [],
        route: legendId === "command"
          ? ownerAccess ? "owner-architect" : "departments"
          : legendId === "expertise"
            ? "academy"
            : legendId === "control"
              ? "laws"
              : legendId === "data"
                ? "traces"
                : legendId === "infrastructure"
                  ? "interfaces"
                  : legendId === "feedback" && entities.some((entity) =>
                    entity.children?.some((child) => child.id === "self-healing")
                  )
                    ? "self-healing"
                    : "departments",
      },
    };
  });
  return { nodes, edges };
}

function FlowCanvas({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  onHoverNode,
  onHoverEdge,
  onRegisterFitView,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodeClick: (entity: Entity) => void;
  onEdgeClick: (edge: FlowEdge) => void;
  onHoverNode: (entity: Entity | null) => void;
  onHoverEdge: (id: string | null) => void;
  onRegisterFitView: (fitView: () => void) => void;
}) {
  useEffect(() => () => onRegisterFitView(() => {}), [onRegisterFitView]);
  return (
    <div className="eos-flow">
      <ReactFlow<FlowNode, FlowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.04 }}
          onlyRenderVisibleElements
          autoPanOnSelection
          elevateEdgesOnSelect
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.22}
          maxZoom={2.5}
          onNodeClick={(_event, node) => {
            if (node.data.entity.clickable !== false) onNodeClick(node.data.entity);
          }}
          onNodeMouseEnter={(_event, node) => onHoverNode(node.data.entity)}
          onNodeMouseLeave={() => onHoverNode(null)}
          onEdgeClick={(_event, edge) => onEdgeClick(edge)}
          onEdgeMouseEnter={(event, edge) => {
            if (event.currentTarget) onHoverEdge(edge.id);
          }}
          onEdgeMouseLeave={(event) => {
            if (event.currentTarget) onHoverEdge(null);
          }}
          onInit={(instance) => {
            const fitView = () => instance.fitView({ padding: 0.04, duration: 250 });
            onRegisterFitView(fitView);
            fitView();
          }}
          aria-label="Interaktive Organigramm-Platine"
        >
          <Background color="#334155" gap={24} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => LEGEND.find((entry) => entry.id === (node.data as { entity?: Entity }).entity?.legendId)?.color ?? "#C5A059"}
          />
          <FlowEdgeCount />
      </ReactFlow>
    </div>
  );
}

function FlowEdgeCount() {
  const edgeCount = useEdgesStore(useEqualSelector(
    (state: EdgesStore) => state.edges.length,
    (left, right) => left === right
  ));
  return <Panel position="bottom-left" style={{ marginBottom: 118 }}><span className="eos-chip">Leitungen: {edgeCount}</span></Panel>;
}

/* ===================================================================================================
 * 3-in-1-ErgÃ¤nzung: Lebender Hierarchie-Baum (d3-org-chart, nur im Browser) + Glasplatten-Schichtenblick
 * Datenquelle ist ausschlieÃŸlich das Ã¼bergebene Roster (#0, #1â€“#232, #301â€“#400, dynamisch #401 â†’ âˆž).
 * ================================================================================================= */

type TreeRow = {
  id: string;
  parentId: string | null;
  label: string;
  sub: string;
  level: number;
  agent?: AgentDef;
  dynamic?: boolean;
};

const LEVEL_COLORS = ["#B5944B", "#234E8E", "#2B4C7E", "#135D66", "#2E6699", "#334E68"];
const LEVEL_TITLES = [
  "Ebene 0 Â· Inhaber & Meta-KI #000",
  "Ebene 1 Â· KI-Vorstand",
  "Ebene 2 Â· Bereichs-Direktoren",
  "Ebene 3 Â· Abteilungsleiter",
  "Ebene 4 Â· Teamleiter & FachprÃ¼fer",
  "Ebene 5 Â· Co-Agenten, Fachcluster & Hilfs-Bots (#401 â†’ âˆž)",
];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

/** Baut die flache Eltern-Kind-Liste. Schutz gegen Zyklen: ein Zyklus hÃ¤ngt den Knoten unter die Wurzel. */
function buildTreeRows(roster: AgentDef[], ownerShop: boolean, dynamicCount: number): TreeRow[] {
  const byNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const hasMeta = ownerShop && byNumber.has(0);
  const rootParent = hasMeta ? "agent-0" : "owner";
  const rows: TreeRow[] = [
    { id: "owner", parentId: null, label: "App-Inhaber (Mensch)", sub: "Ebene 0 Â· OwnerRule & DRY_RUN_MODE", level: 0 },
  ];
  const parentOf = (agent: AgentDef): string => {
    if (agent.number === 0) return "owner";
    const next = agent.reportsTo;
    if (next == null || next === agent.number || !byNumber.has(next)) return rootParent;
    const seen = new Set<number>([agent.number]);
    let cursor: number | null | undefined = next;
    while (cursor != null && byNumber.has(cursor)) {
      if (seen.has(cursor)) return rootParent;
      seen.add(cursor);
      cursor = byNumber.get(cursor)?.reportsTo;
    }
    return `agent-${next}`;
  };
  for (const agent of roster) {
    rows.push({
      id: `agent-${agent.number}`,
      parentId: parentOf(agent),
      label: `#${agent.number} Â· ${agent.name}`,
      sub: agent.role,
      level: agent.number === 0 ? 0 : agent.level,
      agent,
      dynamic: Boolean(agent.dynamic),
    });
  }
  if (ownerShop) {
    rows.push({
      id: "auto-expansion",
      parentId: byNumber.has(161) ? "agent-161" : rootParent,
      label: "âœ¨ KI-Auto-Ausbau #401 â†’ âˆž",
      sub: `${dynamicCount} dynamische Hilfs-Bots Â· wÃ¤chst automatisch`,
      level: 5,
      dynamic: true,
    });
  }
  return rows;
}

/** Alle Vorgesetzten und Untergebenen eines Knotens. */
function treeFamily(rows: TreeRow[], id: string): Set<string> {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const kids = new Map<string, string[]>();
  for (const row of rows) {
    if (row.parentId) kids.set(row.parentId, [...(kids.get(row.parentId) ?? []), row.id]);
  }
  const family = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    for (const child of kids.get(stack.pop()!) ?? []) {
      if (!family.has(child)) {
        family.add(child);
        stack.push(child);
      }
    }
  }
  let cursor = byId.get(id)?.parentId ?? null;
  while (cursor && !family.has(cursor)) {
    family.add(cursor);
    cursor = byId.get(cursor)?.parentId ?? null;
  }
  return family;
}

function treeCardHtml(row: TreeRow, width: number, height: number, direct: number): string {
  const color = LEVEL_COLORS[Math.min(Math.max(row.level, 0), 5)];
  const label = escapeHtml(row.label);
  const badge = row.dynamic ? '<span class="eos-tree-badge">âœ¨ KI-Auto-Ausbau</span>' : "";
  return `<div class="eos-tree-card" data-nid="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="${label}" style="--lvl:${color};width:${width}px;height:${height}px">` +
    `<div class="eos-tree-top"><strong>${label}</strong>` +
    `<button type="button" class="eos-info-button" data-info="${escapeHtml(row.id)}" aria-label="Informationen zu ${label}" title="Informationen">â“˜</button></div>` +
    `<small>${escapeHtml(row.sub)}</small>${badge}<em>${direct ? `${direct} direkt unterstellt` : "operativ"}</em></div>`;
}

type OrgChartLike = {
  container: (selector: HTMLElement) => OrgChartLike;
  data: (rows: unknown[]) => OrgChartLike;
  nodeWidth: (fn: () => number) => OrgChartLike;
  nodeHeight: (fn: () => number) => OrgChartLike;
  childrenMargin: (fn: () => number) => OrgChartLike;
  compactMarginBetween: (fn: () => number) => OrgChartLike;
  nodeContent: (fn: (node: { data: TreeRow }) => string) => OrgChartLike;
  buttonContent: (fn: (node: { node: { children?: unknown[]; _children?: unknown[] } }) => string) => OrgChartLike;
  linkUpdate: (fn: (this: SVGPathElement, node: { data: { _upToTheRootHighlighted?: boolean } }) => void) => OrgChartLike;
  svgHeight: (height: number) => OrgChartLike;
  initialExpandLevel: (level: number) => OrgChartLike;
  setUpToTheRootHighlighted: (id: string) => OrgChartLike;
  clearHighlighting: () => OrgChartLike;
  setExpanded: (id: string, flag?: boolean) => OrgChartLike;
  fit: () => OrgChartLike;
  render: () => OrgChartLike;
  exportImg: (options?: { full?: boolean; scale?: number; save?: boolean }) => void;
  clear: () => void;
};

type TreeProps = {
  rows: TreeRow[];
  startId: string | null;
  onInspect: (row: TreeRow) => void;
  onBack: () => void;
  exportRef: { current: (() => void) | null };
  sound: () => void;
};

/** Konfiguriert den d3-org-chart-Baum (Ebene 0 â†’ Hilfs-Bots). */
function configureChart(chart: OrgChartLike, host: HTMLElement, rows: TreeRow[], startId: string | null, counts: Map<string, number>) {
  chart
    .container(host)
    .svgHeight(720)
    .nodeWidth(() => 232)
    .nodeHeight(() => 92)
    .childrenMargin(() => 46)
    .compactMarginBetween(() => 18)
    .initialExpandLevel(startId ? 2 : 3)
    .buttonContent(({ node }) => {
      const count = node.children?.length ?? node._children?.length ?? 0;
      return `<div class="eos-tree-toggle" aria-hidden="true">${node.children?.length ? "â–¾" : "â–¸"} ${count}</div>`;
    })
    .nodeContent((node) => treeCardHtml(node.data, 232, 92, counts.get(node.data.id) ?? 0))
    .linkUpdate(function (node) {
      const hot = Boolean(node.data._upToTheRootHighlighted);
      this.setAttribute("stroke", hot ? "#C5A059" : "#64748B");
      this.setAttribute("stroke-width", hot ? "4" : "1.5");
      this.classList.toggle("eos-tree-link-hot", hot);
    })
    .data(rows);
  if (startId && rows.some((row) => row.id === startId)) chart.setUpToTheRootHighlighted(startId);
  chart.render().fit();
}

/** Lebender Hierarchie-Baum. d3-org-chart wird erst im Browser geladen (SSR-sicher). */
function HierarchyTree({ rows, startId, onInspect, onBack, exportRef, sound }: TreeProps) {
  const host = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChartLike | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) if (row.parentId) map.set(row.parentId, (map.get(row.parentId) ?? 0) + 1);
    return map;
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    // d3-org-chart liefert keine Typdeklaration (Schutzregel: keine zusÃ¤tzliche .d.ts-Datei). Der Import
    // bleibt ein statisch analysierbares import(), damit Vite das Paket korrekt bÃ¼ndelt.
    // @ts-expect-error TS7016: Modul ohne Typen
    void (import("d3-org-chart") as Promise<{ OrgChart: unknown }>)
      .then(({ OrgChart }) => {
        if (cancelled || !host.current) return;
        const chart = new (OrgChart as new () => OrgChartLike)();
        chartRef.current = chart;
        configureChart(chart, host.current, rows, startId, counts);
        setError(null);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Hierarchie-Baum konnte nicht geladen werden."));
    return () => {
      cancelled = true;
      try { chartRef.current?.clear(); } catch { /* bereits entfernt */ }
      chartRef.current = null;
    };
  }, [rows, startId, counts]);

  useEffect(() => {
    exportRef.current = () => chartRef.current?.exportImg({ full: true, scale: 2, save: true });
    return () => { exportRef.current = null; };
  }, [exportRef]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const idOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest<HTMLElement>("[data-nid]")?.dataset.nid ?? null;
    const apply = (id: string | null) => {
      setFocus(id);
      const family = id ? treeFamily(rowsRef.current, id) : null;
      element.querySelectorAll<HTMLElement>("[data-nid]").forEach((card) => {
        card.classList.toggle("eos-dimmed", Boolean(family && !family.has(card.dataset.nid ?? "")));
      });
    };
    const over = (event: Event) => { const id = idOf(event.target); if (id) apply(id); };
    const out = (event: MouseEvent) => { if (!(event.relatedTarget instanceof globalThis.Node && element.contains(event.relatedTarget))) apply(null); };
    const click = (event: Event) => {
      const info = (event.target as HTMLElement).closest<HTMLElement>("[data-info]");
      if (!info?.dataset.info) return;
      event.stopPropagation();
      const row = rowsRef.current.find((item) => item.id === info.dataset.info);
      if (row) { sound(); onInspect(row); }
    };
    const key = (event: KeyboardEvent) => {
      const id = idOf(event.target);
      if (event.key === "Enter" && id) {
        const row = rowsRef.current.find((item) => item.id === id);
        chartRef.current?.setExpanded(id, true).render();
        if (row) onInspect(row);
      }
      if (event.key === "Escape") onBack();
    };
    element.addEventListener("mouseover", over);
    element.addEventListener("mouseout", out);
    element.addEventListener("click", click, true);
    element.addEventListener("keydown", key);
    return () => {
      element.removeEventListener("mouseover", over);
      element.removeEventListener("mouseout", out);
      element.removeEventListener("click", click, true);
      element.removeEventListener("keydown", key);
    };
  }, [onInspect, onBack, sound]);

  return (
    <div className="eos-tree-wrap">
      {error && <p role="alert" className="eos-tree-error">Hierarchie-Baum: {error}</p>}
      <div ref={host} className="eos-tree-host" aria-label="Lebender Hierarchie-Baum" />
      <small className="eos-tree-hint">
        {focus ? `Fokus: ${rows.find((row) => row.id === focus)?.label ?? focus}` : "Maus Ã¼ber eine Karte: Vorgesetzte und Untergebene leuchten, der Rest wird ausgegraut."}
        {" "}Â· Enter = tiefer Â· Esc = zurÃ¼ck
      </small>
    </div>
  );
}

/** Glasplatten-Schichtenblick Ebene 0â€“5: jede Ebene eine Glasplatte, Hover blendet die anderen aus. */
function GlassLayers({ roster, ownerShop, dynamicCount, onInspect }: {
  roster: AgentDef[];
  ownerShop: boolean;
  dynamicCount: number;
  onInspect: (agent: AgentDef) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const layers = useMemo(() => {
    const result: AgentDef[][] = [[], [], [], [], [], []];
    for (const agent of roster) result[agent.number === 0 ? 0 : Math.min(Math.max(agent.level, 0), 5)].push(agent);
    return result;
  }, [roster]);
  return (
    <div className="eos-glass-stack" aria-label="Glasplatten-Schichtenblick Ebene 0â€“5">
      {layers.map((agents, level) => {
        const expanded = open === level;
        const shown = expanded ? agents : agents.slice(0, 8);
        return (
          <section
            key={level}
            className={`eos-glass-plate${hover != null && hover !== level ? " eos-dimmed" : ""}`}
            style={{ "--lvl": LEVEL_COLORS[level], marginLeft: level * 14 } as CSSProperties}
            onMouseEnter={() => setHover(level)}
            onMouseLeave={() => setHover(null)}
          >
            <header>
              <strong>{LEVEL_TITLES[level]}</strong>
              <span className="eos-chip">{agents.length + (level === 0 ? 1 : 0)} Profile</span>
              {level === 5 && ownerShop && <span className="eos-chip">âœ¨ {dynamicCount} dynamisch</span>}
              <button type="button" className="eos-button" onClick={() => setOpen(expanded ? null : level)}>
                {expanded ? "Einklappen" : "Alle zeigen"}
              </button>
            </header>
            <div className="eos-glass-items">
              {level === 0 && <span className="eos-glass-item eos-glass-human">ðŸ‘‘ App-Inhaber (Mensch)</span>}
              {shown.map((agent) => (
                <button type="button" key={agent.key} className="eos-glass-item" onClick={() => onInspect(agent)} title={agent.mission}>
                  #{agent.number} {agent.name}
                </button>
              ))}
              {!expanded && agents.length > shown.length && <span className="eos-glass-item">+ {agents.length - shown.length} weitere</span>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function EnterpriseOsOrganigram(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<{ traces: LiveConnectionTraceDto[]; snapshotAt: string }>();
  const loadFetcher = fetcher.load;
  const [browserReady, setBrowserReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchDialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fitViewRef = useRef<(() => void) | null>(null);
  const fullscreenRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<"flow" | "tree" | "glass" | "touch">("flow");
  const treeExportRef = useRef<(() => void) | null>(null);
  const [treeStart, setTreeStart] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusedLegend, setFocusedLegend] = useState<LegendId | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<FlowEdge | null>(null);
  const [hoveredLegend, setHoveredLegend] = useState<LegendId | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [visibleLegend, setVisibleLegend] = useState<Set<LegendId>>(() => new Set(LEGEND.map((item) => item.id)));
  const [moneyView, setMoneyView] = useState(false);
  const [cameraFollow, setCameraFollow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [speakerError, setSpeakerError] = useState<string | null>(null);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const path = (searchParams.get("orgPath") ?? "").split("/").filter(Boolean);
  const pathKey = path.join("/");
  const traces = fetcher.data?.traces ?? props.initialTraces;
  const visibleRoster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));

  useEffect(() => {
    setBrowserReady(true);
  }, []);

  useEffect(() => {
    if (!browserReady) return;
    const loadTraces = () => {
      if (document.visibilityState === "visible") loadFetcher("/api/live-traces");
    };
    loadTraces();
    const interval = window.setInterval(loadTraces, 5_000);
    document.addEventListener("visibilitychange", loadTraces);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", loadTraces);
    };
  }, [browserReady, loadFetcher]);

  useEffect(() => {
    if (!browserReady) return;
    try {
      const stored = window.localStorage.getItem("atelierpilot-organigram-bookmarks");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) setBookmarks(parsed);
      }
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : "Lesezeichen konnten nicht geladen werden.");
    }
  }, [browserReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "0" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target;
        if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
        event.preventDefault();
        fitViewRef.current?.();
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    const dialog = searchDialogRef.current;
    if (!dialog) return;
    if (searchOpen) {
      if (!dialog.open) dialog.showModal();
      searchInputRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [searchOpen]);

  const navigate = useCallback((nextPath: string[]) => {
    const update = () => {
      const next = new URLSearchParams(searchParams);
      next.set("view", "board");
      if (nextPath.length) next.set("orgPath", nextPath.join("/"));
      else next.delete("orgPath");
      setSearchParams(next, { preventScrollReset: true });
    };
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(update);
    } else {
      update();
    }
    setSelectedEdge(null);
    setSelectedEntity(null);
  }, [searchParams, setSearchParams]);

  const activateEntity = useCallback((entity: Entity) => {
    // Klick auf #000 Meta-KI oder einen einzelnen Mitarbeiter Ã¶ffnet den Hierarchie-Baum an dieser Stelle.
    if (entity.id === "meta-hypervisor" || entity.agentNumber === 0) {
      setMode("tree");
      setTreeStart("agent-0");
      setSelectedEntity(entity);
      return;
    }
    const activePath = pathKey ? pathKey.split("/") : [];
    navigate([...activePath, entity.route ?? entity.id]);
    setSelectedEntity(entity);
    setSelectedEdge(null);
  }, [navigate, pathKey]);
  const hoverEntity = useCallback((entity: Entity | null) => {
    setHoveredEntity(entity);
    setHoveredEdge(null);
    setHoveredLegend(null);
    setFocusedId(entity?.id ?? null);
    setFocusedLegend(null);
  }, []);
  const inspectEntity = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setSelectedEdge(null);
    setHoveredEntity(null);
    setHoveredEdge(null);
  }, []);
  const registerFitView = useCallback((fitView: () => void) => {
    fitViewRef.current = fitView;
  }, []);

  const treeRows = useMemo(
    () => buildTreeRows(visibleRoster, props.ownerShop, props.dynamicCount),
    [visibleRoster, props.ownerShop, props.dynamicCount]
  );
  const inspectTreeRow = useCallback((row: TreeRow) => {
    if (row.agent) {
      setSelectedEntity(makeAgentEntity(row.agent, props.performance, props.earnings));
    } else {
      setSelectedEntity({ id: row.id, title: row.label, description: row.sub, group: "tree", legendId: "command" });
    }
    setSelectedEdge(null);
  }, [props.performance, props.earnings]);
  const treeBack = useCallback(() => {
    if (treeStart) setTreeStart(null);
    else setMode("flow");
  }, [treeStart]);
  const switchMode = useCallback((next: "flow" | "tree" | "glass" | "touch", startId: string | null = null) => {
    const apply = () => {
      setMode(next);
      setTreeStart(startId);
    };
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  }, []);

  const pageEntities = useMemo(() => buildChildren(path, props, traces), [
    pathKey, props, traces,
  ]);
  const entities = useMemo(
    () => path.length ? buildSubpageColumns(path, props, pageEntities, traces) : pageEntities,
    [pathKey, props, pageEntities, traces]
  );
  const visibleEntities = entities;
  const graph = useMemo(() => layoutGraph(
    visibleEntities,
    focusedId,
    focusedLegend,
    visibleLegend,
    activateEntity,
    hoverEntity,
    inspectEntity
  ), [visibleEntities, focusedId, focusedLegend, visibleLegend, activateEntity, hoverEntity, inspectEntity]);

  const searchItems = useMemo(() => {
    const items: { id: string; title: string; subtitle: string; path: string[]; entity?: Entity }[] = [];
    const searchableRoster = props.ownerShop
      ? props.roster
      : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
    const rootItems = buildRootEntities(props, traces);
    const collectRootSearchItems = (entities: Entity[]) => {
      for (const entity of entities) {
        if (entity.isColumn) {
          collectRootSearchItems(entity.children ?? []);
          continue;
        }
        if (entity.clickable !== false) {
          items.push({
            id: entity.id,
            title: entity.title,
            subtitle: entity.description,
            path: [entity.route ?? entity.id],
            entity,
          });
        }
        if (entity.children?.length) collectRootSearchItems(entity.children);
      }
    };
    collectRootSearchItems(rootItems);
    for (const department of DEPARTMENTS.filter((item) => props.allowedDepartmentIds.includes(item.id))) {
      const entity: Entity = {
        id: `department-${department.id}`,
        title: `Abt. ${department.id} Â· ${department.name}`,
        description: department.mechanism,
        group: "department",
        legendId: department.kind === "panel" ? "control" : department.kind === "harmony" ? "feedback" : "expertise",
        sourceType: "department",
        sourceId: String(department.id),
      };
      items.push({ id: entity.id, title: entity.title, subtitle: entity.description, path: ["departments", entity.id], entity });
    }
    const clusters = new Map<string, AgentDef>();
    for (const agent of searchableRoster) if (agent.specialistCluster) clusters.set(agent.specialistCluster, agent);
    for (const [cluster, agent] of clusters) {
      items.push({
        id: cluster,
        title: agent.specialistCluster === "apex-system-coordinator" ? "#400 Â· System-Koordinator" : agent.role,
        subtitle: `Fachcluster Â· ${agent.specialistCluster}`,
        path: ["specialists", cluster],
      });
    }
    for (const agent of searchableRoster) items.push({
      id: `agent-${agent.number}`,
      title: `#${agent.number} Â· ${agent.name}`,
      subtitle: `${agent.role} Â· ${agent.mission}`,
      path: [agent.dynamic ? "agent-factory" : "staff", `agent-${agent.number}`],
      entity: makeAgentEntity(agent, props.performance, props.earnings),
    });
    for (const rule of props.legalRules) items.push({
      id: `rule-${rule.id}`,
      title: `${rule.ruleKey} Â· ${rule.jurisdiction}`,
      subtitle: rule.sourceTitle,
      path: ["laws", `rule-${rule.id}`],
    });
    for (const capability of props.capabilities) items.push({
      id: `capability-${capability.id}`,
      title: capability.displayName,
      subtitle: `${capability.feasibility} Â· ${capability.evidenceSummary}`,
      path: ["interfaces", `capability-${capability.id}`],
    });
    for (const binding of props.bindings) items.push({
      id: `binding-${binding.id}`,
      title: binding.interfaceKey,
      subtitle: `${binding.agentKey} Â· ${binding.status}`,
      path: ["interfaces", `binding-${binding.id}`],
    });
    for (const trace of traces) items.push({
      id: `trace-${trace.id}`,
      title: `${trace.agentKey ?? "System"} â†’ ${trace.channelKey}`,
      subtitle: `${trace.eventType} Â· ${trace.outcome}`,
      path: ["traces", `trace-${trace.id}`],
    });
    for (const bookmark of bookmarks) {
      const segments = bookmark.split("/").filter(Boolean);
      items.push({
        id: `bookmark-${bookmark || "home"}`,
        title: `â˜… ${segments.map((segment) => routeSegmentTitle(segment, visibleRoster, props.legalRules, props.capabilities, props.bindings, traces)).join(" â€º ") || "Kommandozentrale"}`,
        subtitle: "Gespeicherter Lesezeichen-Pfad",
        path: segments,
      });
    }
    // Eindeutige EintrÃ¤ge: derselbe Datensatz kann Ã¼ber Wurzel- und Detail-Durchlauf doppelt auftauchen.
    const unique = new Map<string, (typeof items)[number]>();
    for (const item of items) if (!unique.has(item.id)) unique.set(item.id, item);
    return [...unique.values()];
  }, [props, traces, bookmarks, visibleRoster]);
  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("de-DE");
    if (!query) return searchItems;
    return searchItems.filter((item) =>
      `${item.title} ${item.subtitle} ${item.entity?.metrics?.join(" ") ?? ""}`.toLocaleLowerCase("de-DE").includes(query)
    );
  }, [searchItems, searchQuery]);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchQuery, searchOpen, filteredSearchItems.length]);

  const currentTitle = path.length
    ? routeSegmentTitle(path[path.length - 1], visibleRoster, props.legalRules, props.capabilities, props.bindings, traces)
    : "Lebendes Firmen-Organigramm & Event-Bus";
  const currentPath = path.join("/");
  const isBookmarked = bookmarks.includes(currentPath);
  const selectedTrace = selectedEntity?.sourceType === "trace"
    ? traces.find((trace) => trace.id === selectedEntity.sourceId)
    : selectedEdge?.data?.trace;
  const selectedAgent = selectedEntity?.sourceType === "agent"
    ? visibleRoster.find((agent) => agent.key === selectedEntity.sourceId)
    : selectedTrace?.agentKey
      ? visibleRoster.find((agent) => agent.key === selectedTrace.agentKey)
      : undefined;
  const hierarchyAgent = selectedAgent ?? (selectedEntity?.agentNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === selectedEntity.agentNumber));
  const selectedParent = hierarchyAgent?.reportsTo == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === hierarchyAgent.reportsTo);
  const selectedDirectReports = hierarchyAgent == null
    ? []
    : visibleRoster.filter((agent) => agent.reportsTo === hierarchyAgent.number);
  const selectedRelationKeys = new Set(selectedEntity?.relationKeys ?? (selectedEntity?.relationKey ? [selectedEntity.relationKey] : []));
  const linkedTraceCount = selectedEntity
    ? traces.filter((trace) => selectedRelationKeys.has(trace.agentKey ?? "") || selectedRelationKeys.has(trace.channelKey)).length
    : 0;
  const linkedBindingCount = selectedEntity
    ? props.bindings.filter((binding) =>
      selectedRelationKeys.has(binding.agentKey) || selectedRelationKeys.has(binding.interfaceKey)
    ).length
    : 0;
  const selectedCapability = selectedEntity?.sourceType === "capability"
    ? props.capabilities.find((item) => item.id === selectedEntity.sourceId)
    : undefined;
  const selectedRule = selectedEntity?.sourceType === "law"
    ? props.legalRules.find((item) => item.id === selectedEntity.sourceId)
    : undefined;
  const performance = selectedAgent ? props.performance.byAgent[selectedAgent.key] : undefined;
  const earnings = selectedAgent ? props.earnings.perAgent[selectedAgent.key] : undefined;

  function persistBookmarks(next: string[]) {
    setBookmarks(next);
    try {
      window.localStorage.setItem("atelierpilot-organigram-bookmarks", JSON.stringify(next));
      setBookmarkError(null);
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : "Lesezeichen konnten nicht gespeichert werden.");
    }
  }

  function toggleBookmark() {
    const next = isBookmarked
      ? bookmarks.filter((item) => item !== currentPath)
      : [...bookmarks, currentPath];
    persistBookmarks(next);
  }

  function playSound() {
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) {
        setSpeakerError("Web Audio API ist in diesem Browser nicht verfÃ¼gbar.");
        return;
      }
      const context = new AudioContextConstructor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.16);
      oscillator.onended = () => { void context.close(); };
      setSpeakerError(null);
    } catch (error) {
      setSpeakerError(error instanceof Error ? error.message : "Der Studio-Klang konnte nicht abgespielt werden.");
    }
  }

  function exportBlueprint() {
    const payload = {
      exportedAt: new Date().toISOString(),
      title: currentTitle,
      path,
      disclaimer: "Diagrammexport aus sichtbaren Daten; kein signierter GoBD-Nachweis.",
      nodes: visibleEntities,
      edges: graph.edges.map(({ id, source, target, data }) => ({ id, source, target, packet: data?.packet, traceId: data?.traceId })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atelierpilot-organigram-export.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function pickSearchResult(item: { id: string; path: string[]; entity?: Entity }) {
    navigate(item.path);
    const result = item.entity ?? buildChildren(item.path.slice(0, -1), props, traces)
      .find((entity) => entity.id === item.id) ?? null;
    setSelectedEntity(result);
    setSearchOpen(false);
  }

  const pathTitle = (segment: string) => routeSegmentTitle(segment, visibleRoster, props.legalRules, props.capabilities, props.bindings, traces);
  const departmentCount = DEPARTMENTS.filter((department) => props.allowedDepartmentIds.includes(department.id)).length;
  const glassColumns = visibleEntities.map((column) => ({
    label: column.title,
    entities: column.children ?? [],
  }));

  return (
    <section ref={fullscreenRef} className={`eos-shell${isFullscreen ? " eos-fullscreen" : ""}`} aria-label="Lebendes Firmen-Organigramm">
      <header className="eos-header">
        <div className="eos-toolbar">
          <div>
            <strong style={{ color: "#C5A059", fontSize: 16 }}>{currentTitle}</strong>
            <div style={{ color: "#cbd5e1", fontSize: 11, marginTop: 4 }}>
              {props.ownerShop ? "OWNER UNLIMITED" : `${departmentCount} gebuchte/sichtbare Fachabteilungen`}
              {" Â· "}UI-Herzschlag {new Date(fetcher.data?.snapshotAt ?? Date.now()).toLocaleTimeString("de-DE")}
              {" Â· "}{fetcher.state === "loading" ? "Traces werden aktualisiertâ€¦" : `${traces.length} gespeicherte Traces`}
            </div>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={mode === "flow"} onClick={() => switchMode("flow")}>ðŸ›ï¸ 4-Spalten-Enterprise-OS</button>
            <button type="button" className="eos-button" aria-pressed={mode === "tree"} onClick={() => switchMode("tree")}>ðŸŒ³ Lebender Hierarchie-Baum</button>
            <button type="button" className="eos-button" aria-pressed={mode === "glass"} onClick={() => switchMode("glass")}>ðŸ“š Glasplatten-Schichtenblick Ebene 0â€“5</button>
            <button type="button" className="eos-button" aria-pressed={mode === "touch"} onClick={() => setMode("touch")}>Touch-Kartenansicht</button>
            <a className="eos-button" href="/mobile-monitor">Mobile Monitor / PWA</a>
            <button
              type="button"
              className="eos-button"
              onClick={async () => {
                try {
                  if (document.fullscreenElement) await document.exitFullscreen();
                  else await fullscreenRef.current?.requestFullscreen();
                  setFullscreenError(null);
                } catch (error) {
                  setFullscreenError(error instanceof Error ? error.message : "Vollbild konnte nicht aktiviert werden.");
                }
              }}
            >{isFullscreen ? "Vollbild schlieÃŸen" : "Vollbild"}</button>
            <button type="button" className="eos-button" onClick={() => fitViewRef.current?.()} title="Gesamtansicht einpassen">0 Â· Gesamtansicht</button>
          </div>
        </div>
        <div className="eos-toolbar">
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={cameraFollow} title="Kein Kamerazugriff; folgt nur der aktiven Auswahl." onClick={() => setCameraFollow((value) => !value)}>
              ðŸŽ¥ Live-Kamera-Verfolgung {cameraFollow ? "AN Â· Auswahl-Fokus" : "AUS"}
            </button>
            <button type="button" className="eos-button" aria-pressed={moneyView} onClick={() => setMoneyView((value) => !value)}>ðŸ’¶ Geld- & Zeit-RÃ¶ntgenblick</button>
            <button
              type="button"
              className="eos-button"
              aria-pressed={soundEnabled}
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSound();
              }}
            >
              ðŸ”Š Studio-Klang {soundEnabled ? "AN Â· abspielen" : "AUS"}
            </button>
            <button
              type="button"
              className="eos-button"
              title="Exportiert den Bauplan als JSON; im Baum-Modus zusÃ¤tzlich den Baum als Bild."
              onClick={() => {
                exportBlueprint();
                if (mode === "tree") treeExportRef.current?.();
              }}
            >ðŸ“¸ 1-Klick-Export (Bauplan & Audit-Nachweis)</button>
            <button type="button" className="eos-button" onClick={() => setSearchOpen(true)}>âŒ• Blitz-Sprung Â· Ctrl/Cmd+K</button>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={isBookmarked} onClick={toggleBookmark}>{isBookmarked ? "â˜… Lesezeichen" : "â˜† Pfad merken"}</button>
            <DomainInfoButton domain={path.length ? path.join(" / ") : "live-organization"} />
          </div>
        </div>
        <nav className="eos-breadcrumb" aria-label="Organigramm-Pfad">
          {path.length > 0 && (
            <button type="button" className="eos-button" onClick={() => navigate(path.slice(0, -1))}>
              â† ZurÃ¼ck
            </button>
          )}
          <button type="button" className="eos-button" onClick={() => navigate([])}>Kommandozentrale</button>
          <span aria-hidden="true">â€º</span>
          <button type="button" className="eos-button" onClick={() => navigate([])}>Lebendes Organigramm</button>
          {path.map((segment, index) => (
            <span className="eos-breadcrumb" key={`${segment}-${index}`}>
              <span aria-hidden="true">â€º</span>
              <button type="button" className="eos-button" onClick={() => navigate(path.slice(0, index + 1))}>{pathTitle(segment)}</button>
            </span>
          ))}
          {bookmarks.filter((item) => item && item !== currentPath).map((bookmark) => (
            <button type="button" className="eos-button" key={bookmark} onClick={() => navigate(bookmark.split("/").filter(Boolean))}>â˜… {bookmark.split("/").map(pathTitle).join(" â€º ") || "Kommandozentrale"}</button>
          ))}
        </nav>
        <div className="eos-toolbar">
          <div className="eos-toolbar-group" aria-label="AusfÃ¼hrungs- und Capability-Status">
            <span className="eos-chip">SANDBOX Â· Status nicht ausgewiesen</span>
            <span className="eos-chip">SHADOW / CANARY Â· nicht angebunden</span>
            <span className="eos-chip">VERIFIED LIVE Â· nur gespeicherte Nachweise</span>
            <span className="eos-chip">0,00 â‚¬ Â· keine Laufzeitkosten in Diagramm-Aktionen</span>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" disabled title="Es gibt in den vorhandenen Services keinen Shadow-Canary-Steuerendpunkt.">Shadow-Canary-Steuerung nicht angebunden</button>
            <button type="button" className="eos-button" disabled title="Die vorhandene Ansicht bietet keine per Leitung ausfÃ¼hrbare Suspend/Resume-Aktion.">Leitungssteuerung nur lesend</button>
          </div>
        </div>
        <div className="eos-legend" role="group" aria-label="Interaktive 8-Farben-Legende">
          {LEGEND.map((entry) => {
            const enabled = visibleLegend.has(entry.id);
            return (
              <button
                type="button"
                key={entry.id}
                className="eos-button"
                aria-pressed={enabled}
                onMouseEnter={() => setFocusedLegend(entry.id)}
                onMouseLeave={() => setFocusedLegend(null)}
                onFocus={() => setFocusedLegend(entry.id)}
                onBlur={() => setFocusedLegend(null)}
                onClick={() => setVisibleLegend((current) => {
                  const next = new Set(current);
                  if (next.has(entry.id)) next.delete(entry.id);
                  else next.add(entry.id);
                  return next;
                })}
                style={{ borderColor: entry.color, opacity: enabled ? 1 : .45 }}
              >
                <span aria-hidden="true" style={{ color: entry.color }}>â—</span> {entry.label}
              </button>
            );
          })}
        </div>
        {cameraFollow && <small role="status">Die Verfolgung folgt ausschlieÃŸlich der ausgewÃ¤hlten Platinen-EntitÃ¤t. Es wird keine Kamera aktiviert.</small>}
        {bookmarkError && <small role="alert">Lesezeichen: {bookmarkError}</small>}
        {speakerError && <small role="alert">Studio-Klang: {speakerError}</small>}
        {fullscreenError && <small role="alert">Vollbild: {fullscreenError}</small>}
      </header>

      <div className="eos-main-grid">
        <main className="eos-panel" data-mode={mode}>
          {mode === "flow" && browserReady ? (
            <FlowCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              onNodeClick={activateEntity}
              onEdgeClick={(edge) => {
                if (edge.data?.route) navigate([...path, edge.data.route]);
                setSelectedEdge(edge);
                setHoveredEdge(edge);
                setSelectedEntity(null);
              }}
              onHoverNode={hoverEntity}
              onHoverEdge={(id) => {
                setHoveredEdge(id ? graph.edges.find((edge) => edge.id === id) ?? null : null);
                setHoveredEntity(null);
                setHoveredLegend(null);
                setFocusedId(id ? `edge-${id}` : null);
                setFocusedLegend(null);
              }}
              onRegisterFitView={registerFitView}
            />
          ) : mode === "flow" ? (
            <div className="eos-flow" role="status">Die interaktive Platine wird clientseitig geladenâ€¦</div>
          ) : mode === "tree" && browserReady ? (
            <HierarchyTree
              rows={treeRows}
              startId={treeStart}
              onInspect={inspectTreeRow}
              onBack={treeBack}
              exportRef={treeExportRef}
              sound={soundEnabled ? playSound : noop}
            />
          ) : mode === "tree" ? (
            <div className="eos-flow" role="status">Der Hierarchie-Baum wird clientseitig geladenâ€¦</div>
          ) : mode === "glass" ? (
            <GlassLayers
              roster={visibleRoster}
              ownerShop={props.ownerShop}
              dynamicCount={props.dynamicCount}
              onInspect={(agent) => inspectTreeRow({ id: `agent-${agent.number}`, parentId: null, label: agent.name, sub: agent.role, level: agent.level, agent })}
            />
          ) : (
            <div className="eos-glass-layers" aria-label="Touch-Kartenansicht">
              {glassColumns.map((column) => (
                <section className="eos-glass-layer" key={column.label}>
                  <strong>{column.label}</strong>
                  <div style={{ display: "grid", gap: 7, marginTop: 8 }}>
                    {column.entities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        className="eos-button"
                        style={{ justifyContent: "flex-start", whiteSpace: "normal" }}
                        onClick={() => activateEntity(entity)}
                        onMouseEnter={() => { setFocusedId(entity.id); setFocusedLegend(null); }}
                        onMouseLeave={() => setFocusedId(null)}
                      >
                        <span style={{ color: LEGEND.find((entry) => entry.id === entity.legendId)?.color }}>â—</span>
                        <span><strong>{entity.title}</strong><br /><small>{entity.description}</small></span>
                      </button>
                    ))}
                    {!column.entities.length && <small>Keine EintrÃ¤ge in dieser Ebene.</small>}
                  </div>
                </section>
              ))}
            </div>
          )}
          {(hoveredEntity || hoveredEdge) && (
            <div className="eos-hover-tooltip" role="status" aria-live="polite">
              <strong>Was bedeutet dieser Strom?</strong>
              <span>
                {hoveredEntity
                  ? `${hoveredEntity.title}: ${hoveredEntity.description}`
                  : `${(hoveredEdge?.data?.packet ?? "Systemfluss").replace(/ Â· \d$/, "")} Â· ${LEGEND.find((item) => item.id === hoveredEdge?.data?.legendId)?.label ?? "Verbindung"}. ${hoveredEdge?.data?.legendId ? LEGEND_EXPLANATION[hoveredEdge.data.legendId] : ""}`}
              </span>
              {hoveredEdge && <small>Die Leitung zeigt einen Architekturpfad; Trace-DatensÃ¤tze enthalten hier keine Quell-/Ziel-IDs.</small>}
            </div>
          )}
          {hoveredLegend && (
            <div className="eos-hover-tooltip" role="status" aria-live="polite">
              <strong>Was bedeutet dieser Strom?</strong>
              <span>{LEGEND.find((entry) => entry.id === hoveredLegend)?.label}: {LEGEND_EXPLANATION[hoveredLegend]} Alle Leitungen dieses Stroms leuchten, der Rest wird ausgegraut.</span>
            </div>
          )}
          <div className="eos-canvas-legend" role="group" aria-label="Feste 8-Farben-Legende">
            <strong>LEGENDE</strong>
            {LEGEND.map((entry) => {
              const enabled = visibleLegend.has(entry.id);
              return (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={enabled}
                  onMouseEnter={() => { setFocusedId(null); setFocusedLegend(entry.id); setHoveredLegend(entry.id); }}
                  onMouseLeave={() => { setFocusedLegend(null); setHoveredLegend(null); }}
                  onFocus={() => { setFocusedId(null); setFocusedLegend(entry.id); setHoveredLegend(entry.id); }}
                  onBlur={() => { setFocusedLegend(null); setHoveredLegend(null); }}
                  onClick={() => setVisibleLegend((current) => {
                    const next = new Set(current);
                    if (next.has(entry.id)) next.delete(entry.id);
                    else next.add(entry.id);
                    return next;
                  })}
                >
                  <span style={{ color: entry.color }}>â—</span> {entry.label}
                </button>
              );
            })}
          </div>
          {path.length > 0 && pageEntities.length === 0 && <p>FÃ¼r diese Ebene liegen keine weiteren DatensÃ¤tze vor.</p>}
          <div className="eos-legend" style={{ marginTop: 10 }}>
            <span className="eos-chip">Live-Traces: {traces.length}</span>
            <span className="eos-chip">Latenz: {traces[0]?.detail?.match(/duration_ms=(\d+)/)?.[1] ?? "nicht verfÃ¼gbar"} ms</span>
            <span className="eos-chip">W3C Trace-ID: nicht im Schema verfÃ¼gbar</span>
            <span className="eos-chip">Modell/Temperatur: nicht im Trace enthalten</span>
            {moneyView && <span className="eos-chip">Geld- & Zeitwerte: nur gespeicherte Echt-/Potenzialbuchungen</span>}
          </div>
        </main>

        {(selectedEntity || selectedEdge) && <aside className="eos-inspector" aria-label="RÃ¶ntgen-Inspektor">
          <div className="eos-toolbar">
            <strong style={{ color: "#C5A059" }}>RÃ¶ntgen-Inspektor</strong>
            <button className="eos-button" type="button" onClick={() => { setSelectedEntity(null); setSelectedEdge(null); }}>SchlieÃŸen</button>
          </div>
          {hoveredEntity && (
            <div className="eos-inspector-section" role="status">
              <strong>Hover-Spotlight Â· {hoveredEntity.title}</strong>
              <span>Was macht der Mitarbeiter / Bereich gerade? {hoveredEntity.description}</span>
              {hoveredEntity.metrics?.map((metric) => <span key={metric}>{metric}</span>)}
            </div>
          )}
          {selectedEntity && (
            <>
              <div className="eos-inspector-section">
                <strong>{selectedEntity.title}</strong>
                <span>{selectedEntity.description}</span>
                <span>Was bedeutet dieser Strom? {LEGEND.find((item) => item.id === selectedEntity.legendId)?.label ?? "Systemdaten"}</span>
                {hierarchyAgent && (
                  <>
                    <span>Hierarchie oben: {selectedParent ? `#${selectedParent.number} Â· ${selectedParent.role}` : "keine Ã¼bergeordnete Roster-Person"}.</span>
                    <span>Direkte Unterstellte: {selectedDirectReports.length ? selectedDirectReports.map((agent) => `#${agent.number} ${agent.role}`).join(" Â· ") : "keine geladenen Profile"}.</span>
                  </>
                )}
                <span>VerknÃ¼pfte Live-Traces: {linkedTraceCount} Â· Interface-Bindings: {linkedBindingCount}.</span>
                <span>PrÃ¼fregeln: {props.legalRules.length} verfÃ¼gbare Rechtsquellen; maÃŸgeblich bleiben Owner-Regeln und bestehende Freigaben.</span>
                {selectedEntity.metrics?.map((metric) => <span key={metric}>{metric}</span>)}
              </div>
              {selectedAgent && (
                <div className="eos-inspector-section">
                  <strong>Personalakte Â· #{selectedAgent.number}</strong>
                  <span>{selectedAgent.role} Â· Abteilung {selectedAgent.departmentId}</span>
                  <span>Was macht er gerade? {selectedAgent.mission}</span>
                  <span>Note {performance?.grade == null ? "nicht verfÃ¼gbar" : performance.grade.toFixed(1).replace(".", ",")} Â· {performance?.trend === "UP" ? "â–²" : performance?.trend === "DOWN" ? "â–¼" : performance?.trend === "STABLE" ? "â–º" : "â€”"} Â· {performance?.xp ?? "â€”"} XP</span>
                  <span>Echt: {eur(earnings?.monthReal ?? 0)} / Potenzial: {eur(earnings?.monthPotential ?? 0)}</span>
                  {props.ownerShop && <span>Arbeitsanweisung: Backend-Zertifikatsfunktion nicht angebunden; kein Zertifikat wurde erstellt.</span>}
                </div>
              )}
              {selectedCapability && (
                <div className="eos-inspector-section">
                  <strong>Capability-Nachweis</strong>
                  <span>{selectedCapability.evidenceSummary}</span>
                  <span>{selectedCapability.sourceTitle ?? "Keine Quellentitel-Angabe"} Â· {selectedCapability.verifiedAt ? new Date(selectedCapability.verifiedAt).toLocaleString("de-DE") : "PrÃ¼fdatum fehlt"}</span>
                  {selectedCapability.sourceUrl && <a href={selectedCapability.sourceUrl} target="_blank" rel="noreferrer">Quelle Ã¶ffnen</a>}
                  <span>Risiko {selectedCapability.riskLevel} Â· {selectedCapability.estimatedCostEur == null ? "Kosten nicht angegeben" : eur(selectedCapability.estimatedCostEur)}</span>
                </div>
              )}
              {selectedRule && (
                <div className="eos-inspector-section">
                  <strong>Rechtsquellen-Ledger</strong>
                  <span>{selectedRule.reviewStatus} Â· geprÃ¼ft {new Date(selectedRule.verifiedAt).toLocaleString("de-DE")}</span>
                  <a href={selectedRule.sourceUrl} target="_blank" rel="noreferrer">{selectedRule.sourceTitle}</a>
                  <span>SHA-256: {selectedRule.sourceHash}</span>
                </div>
              )}
              {selectedTrace && (
                <div className="eos-inspector-section">
                  <strong>Live-Trace Â· {selectedTrace.outcome}</strong>
                  <span>{selectedTrace.agentKey ?? "System"} â†’ {selectedTrace.channelKey} Â· {selectedTrace.eventType}</span>
                  <span>AuslÃ¶ser / Dauer: {selectedTrace.detail ?? "nicht protokolliert"}</span>
                  <span>Request-Hash: {selectedTrace.requestHash ?? "nicht vorhanden"}</span>
                  <span>Response-Hash: {selectedTrace.responseHash ?? "nicht vorhanden"}</span>
                  <span>W3C Trace-ID / verknÃ¼pfte Rechtsregel / Urteil: nicht in diesem Trace-Datensatz verknÃ¼pft.</span>
                  <label>
                    Replay-Regler
                    <input type="range" min="0" max={Math.max(traces.length - 1, 0)} defaultValue={Math.max(traces.findIndex((trace) => trace.id === selectedTrace.id), 0)} aria-label="Trace-Zeitleiste" />
                  </label>
                </div>
              )}
              {moneyView && selectedEntity.metrics && (
                <div className="eos-inspector-section"><strong>Geld- & Zeit-RÃ¶ntgenblick</strong>{selectedEntity.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
              )}
            </>
          )}
          {selectedEdge && (
            <>
              <div className="eos-inspector-section">
                <strong>Leitungs-Inspektor</strong>
                <span>{selectedEdge.source} â†’ {selectedEdge.target}</span>
                <span>Datenpaket: {selectedEdge.data?.packet ?? "nicht verfÃ¼gbar"}</span>
                <span>AuslÃ¶ser, Rechtsregel, Urteil #221â€“#225 und Euro-Effekt sind nur sichtbar, sofern im gespeicherten Trace enthalten.</span>
              </div>
              {selectedEdge.data?.trace && (
                <div className="eos-inspector-section">
                  <strong>Trace-Nachweis</strong>
                  <span>{selectedEdge.data.trace.detail ?? "Kein Detail"}</span>
                  <span>SHA-256 Request: {selectedEdge.data.trace.requestHash ?? "nicht vorhanden"}</span>
                  <span>SHA-256 Response: {selectedEdge.data.trace.responseHash ?? "nicht vorhanden"}</span>
                </div>
              )}
              <div className="eos-inspector-section">
                <strong>Steuerung (nur lesend)</strong>
                <span>Autopilot, Shadow-Canary, Chef-Stopp und Suspend/Resume sind mangels vorhandener serverseitiger Steuerendpunkte nicht aktivierbar.</span>
              </div>
            </>
          )}
          <div className="eos-inspector-section">
            <strong>Systemstatus</strong>
            <span>Failover-Pfad: keine verifizierte Provider-Reihenfolge in den Ã¼bergebenen Daten.</span>
            <span>Governance bleibt bei bestehenden Owner-Regeln und Freigabe-Warteschlange.</span>
            <span>{props.executivePulse.slice(0, 3).join(" Â· ") || "Kein Executive-Pulse-Eintrag vorhanden."}</span>
          </div>
          {props.ownerShop && selectedAgent && (
            <div className="eos-inspector-actions">
              <button type="button" className="eos-button" disabled title="Zertifikate kÃ¶nnen nicht Ã¼ber die vorhandenen UI-Props erstellt werden.">Arbeitsanweisung / Zertifikat nicht angebunden</button>
            </div>
          )}
        </aside>}
      </div>

      <dialog
        ref={searchDialogRef}
        className="eos-search-dialog"
        aria-labelledby="eos-search-title"
        aria-describedby="eos-search-description"
        onCancel={(event) => {
          event.preventDefault();
          setSearchOpen(false);
        }}
      >
        <div className="eos-search-heading">
          <div>
            <h2 id="eos-search-title">Blitz-Sprung</h2>
            <p id="eos-search-description">Mitarbeiter, Bereiche, Unterseiten, Gesetze, Schnittstellen und Lesezeichen durchsuchen.</p>
          </div>
          <button type="button" className="eos-button" aria-label="Suche schlieÃŸen" onClick={() => setSearchOpen(false)}>SchlieÃŸen</button>
        </div>
        <input
          ref={searchInputRef}
          className="eos-search-input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={searchOpen}
          aria-controls="eos-search-results"
          aria-activedescendant={filteredSearchItems.length ? `eos-search-option-${activeSearchIndex}` : undefined}
          placeholder="Mitarbeiter, Bereich, Gesetz, Capability oder Trace suchenâ€¦"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex((index) => (index + 1) % filteredSearchItems.length);
            } else if (event.key === "ArrowUp" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex((index) => (index - 1 + filteredSearchItems.length) % filteredSearchItems.length);
            } else if (event.key === "Home" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex(0);
            } else if (event.key === "End" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex(filteredSearchItems.length - 1);
            } else if (event.key === "Enter" && filteredSearchItems[activeSearchIndex]) {
              event.preventDefault();
              pickSearchResult(filteredSearchItems[activeSearchIndex]);
            } else if (event.key === "Escape") {
              setSearchOpen(false);
            }
          }}
        />
        <div className="eos-search-results" id="eos-search-results" role="listbox" aria-label="Suchergebnisse">
          {filteredSearchItems.length ? filteredSearchItems.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={activeSearchIndex === index}
              id={`eos-search-option-${index}`}
              className="eos-search-option"
              key={item.id}
              onMouseEnter={() => setActiveSearchIndex(index)}
              onClick={() => pickSearchResult(item)}
            >
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </button>
          )) : <p className="eos-search-empty" role="status">Keine passenden EintrÃ¤ge gefunden.</p>}
        </div>
        <footer className="eos-search-footer">â†‘ â†“ navigieren Â· Enter Ã¶ffnen Â· Esc schlieÃŸen</footer>
      </dialog>
    </section>
  );
}

