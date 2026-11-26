import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/aetherion-guardian.yml", import.meta.url), "utf8");
const match = workflow.match(/          python3 - <<'EOF'\n([\s\S]*?)\n          EOF/);
assert.ok(match, "Telegram Python script is present");
const script = match[1].split("\n").map((line) => line.slice(10)).join("\n");

function runNotification(overrides = {}, failRequest = false) {
  const mock = `
import urllib.request, urllib.parse
def fake_urlopen(req, timeout):
    assert req.full_url == "https://api.telegram.org/bot123456:example_token/sendMessage"
    assert req.get_method() == "POST"
    assert timeout == 15
    data = urllib.parse.parse_qs(req.data.decode("utf-8"))
    assert data["chat_id"] == ["test-chat"]
    assert ${failRequest ? "True" : "False"} or "AETHERION" in data["text"][0]
    if ${failRequest ? "True" : "False"}:
        raise RuntimeError(req.full_url)
    class Response:
        status = 200
        def __enter__(self): return self
        def __exit__(self, *args): pass
    return Response()
urllib.request.urlopen = fake_urlopen
`;
  return spawnSync("python3", ["-c", mock + script], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      BOT_TOKEN: "123456:example_token",
      CHAT_ID: "test-chat",
      PRIMARY_STATUS: "200",
      BACKUP1_STATUS: "200",
      EDGE_STATUS: "200",
      ...overrides,
    },
  });
}

test("sends the status to the Telegram Bot API with and without the bot prefix", () => {
  for (const token of ["123456:example_token", "bot123456:example_token"]) {
    const result = runNotification({ BOT_TOKEN: token });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Telegram HTTP Status: 200/);
  }
});

test("fails safely when Telegram configuration is missing or malformed", () => {
  for (const overrides of [{ BOT_TOKEN: "" }, { BOT_TOKEN: "bad-token" }, { CHAT_ID: "" }]) {
    const result = runNotification(overrides);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stderr, /123456:example_token|Traceback/);
  }
});

test("does not expose the token when a Telegram request fails", () => {
  const result = runNotification({}, true);
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stderr, /123456:example_token|Traceback/);
});
