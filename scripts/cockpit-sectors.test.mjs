import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import test from "node:test";
import * as ts from "typescript";
import React from "react";

const require = createRequire(import.meta.url);
require.extensions[".tsx"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  module._compile(outputText, filename);
};

let states = [];
let stateIndex = 0;
const fakeReact = {
  ...React,
  useState(initial) {
    const index = stateIndex++;
    if (!(index in states)) states[index] = initial;
    return [states[index], (next) => {
      states[index] = typeof next === "function" ? next(states[index]) : next;
    }];
  },
  useCallback(fn) { return fn; },
  useMemo(fn) { return fn(); },
  useEffect() {},
};
const component = (name) => Object.assign(() => null, { displayName: name });
const Vault = component("OwnerSecretVault");
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.endsWith("SingularityCockpitLayout.tsx")) {
    if (request === "react") return fakeReact;
    if (request === "react-router") return { useSearchParams: () => [new URLSearchParams(), () => {}] };
    if (request === "../ui/SingularityPrimitives") return { INVESTMENT_LEVELS: {} };
    if (request === "../ui/SingularityShell") return { SingularityShell: component("Shell") };
    if (request === "../ui/useTelemetryStream") return { useTelemetryStream() {} };
    if (request === "./AmbientCoreReactor") return { AmbientCoreReactor: component("Reactor") };
    if (request === "./CommandWheelCanvas") return { CommandWheelBottomCards: component("Cards") };
    if (request === "./InstitutionsPanel") return { InstitutionsPanel: component("Institutions") };
    if (request === "./RDLab") return { RDLab: component("Lab") };
    if (request === "./OwnerSecretVault") return { OwnerSecretVault: Vault };
    if (request === "./theme") return { btn: {}, card: {} };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { SingularityCockpitLayout } = require("../app/components/dashboard/SingularityCockpitLayout.tsx");
Module._load = originalLoad;

const props = {
  initialTraces: [], executivePulse: [], dynamicCount: 0, ownerShop: true, roster: [],
  earnings: {}, performance: {}, allowedDepartmentIds: [], onPickDept() {}, onSelectModule() {},
  canAccessSecretVault: true, modulePanel: React.createElement("div", null, "module panel"),
  onOpenTeam() {}, onOpenPlatforms() {},
};
function render(overrides = {}) {
  stateIndex = 0;
  return SingularityCockpitLayout({ ...props, ...overrides }).props;
}

test("all five sector buttons change the active panel and mark the active item", () => {
  states = [];
  let shell = render();
  assert.equal(shell.navItems.length, 5);
  for (let index = 0; index < 5; index++) {
    shell.navItems[index].onClick();
    shell = render();
    assert.equal(shell.navItems.filter((item) => item.active).length, 1);
    assert.equal(shell.navItems[index].active, true);
    assert.match(shell.breadcrumbItems[1].label, new RegExp(`^${index + 1}\\.`));
  }
  shell.navItems[1].onClick();
  shell = render();
  assert.equal(shell.children.props.children[2], props.modulePanel);
});

test("the security sector only renders the vault for authorized shops", () => {
  states = [];
  let shell = render();
  shell.navItems[2].onClick();
  shell = render();
  const security = shell.children.props.children[3];
  assert.equal(security.props.children[1].type, Vault);
  shell = render({ canAccessSecretVault: false });
  assert.equal(shell.children.props.children[3].props.children[1], false);
});
