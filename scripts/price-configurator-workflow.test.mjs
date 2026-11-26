import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import test from "node:test";
import * as ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(outputText, filename);
  };
}

let fetchers = [];
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "react-router" && parent?.filename.endsWith("PriceConfigurator.tsx")) {
    return {
      useFetcher() {
        const current = fetchers.shift() ?? {};
        return {
          state: "idle",
          ...current,
          Form: ({ children, ...props }) => React.createElement("form", props, children),
        };
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { PriceConfigurator } = require("../app/components/dashboard/PriceConfigurator.tsx");
Module._load = originalLoad;

function render(props, responses = []) {
  fetchers = responses;
  return renderToStaticMarkup(React.createElement(PriceConfigurator, {
    isOwner: true,
    canRunModuleWorkflows: true,
    activeModules: ["m1", "m2", "m3", "m4", "m5", "m6"],
    selectedModules: [],
    onSelectedModulesChange() {},
    ...props,
  }));
}

test("workflow forms require both configured owner access and an active module, not a price selection", () => {
  const html = render();
  assert.equal((html.match(/name="type" value="run_module_workflow"/g) ?? []).length, 6);
  for (let i = 1; i <= 6; i++) {
    assert.match(html, new RegExp(`name="moduleId" value="m${i}"`));
  }
  const selectedButInactive = render({ activeModules: ["m2"], selectedModules: ["m1"] });
  assert.equal((selectedButInactive.match(/name="type" value="run_module_workflow"/g) ?? []).length, 1);
  assert.match(selectedButInactive, /name="moduleId" value="m2"/);
  assert.doesNotMatch(selectedButInactive, /name="moduleId" value="m1"/);
  assert.doesNotMatch(render({ canRunModuleWorkflows: false }), /run_module_workflow/);
});

test("workflow displays its draft and provider or its error, without changing the billing result", () => {
  const success = render({ activeModules: ["m1"] }, [
    { data: { message: "Buchungshinweis" } },
    { data: { ok: true, moduleId: "m1", provider: "local", message: "Entwurf:\nZeile 2" } },
  ]);
  assert.match(success, /Unverbindlicher, ungeprüfter Entwurf · Modul m1 · Anbieter: local/);
  assert.match(success, /Entwurf:\nZeile 2/);
  assert.match(success, /Buchungshinweis/);
  const error = render({ activeModules: ["m1"] }, [
    {},
    { data: { ok: false, message: "Die KI-Notfallpause ist aktiv." } },
  ]);
  assert.match(error, /role="alert"/);
  assert.match(error, /Die KI-Notfallpause ist aktiv/);
  assert.doesNotMatch(error, /Unverbindlicher, ungeprüfter Entwurf/);
});
