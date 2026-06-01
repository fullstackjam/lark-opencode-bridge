import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { windowsTaskXml } from "../src/service/daemon.js";

describe("windowsTaskXml", () => {
  const xml = windowsTaskXml({ larkCli: "C:\\bin\\lark-cli.cmd", opencode: "C:\\bin\\opencode.cmd" });

  it("is a well-formed UTF-16 scheduled task", () => {
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-16"\?>/);
    assert.match(xml, /<Task version="1\.2"/);
    assert.match(xml, /<LogonTrigger>/);
  });

  it("runs the bridge via cmd with the binary flags and log redirection", () => {
    assert.match(xml, /<Command>cmd\.exe<\/Command>/);
    assert.match(xml, /lark-opencode-bridge\.mjs/);
    assert.match(xml, /run/);
    // schtasks XML escapes the redirection operators.
    assert.match(xml, /1&gt;&gt;/);
    assert.match(xml, /service\.stdout\.log/);
    assert.match(xml, /service\.stderr\.log/);
    assert.match(xml, /--lark-cli/);
    assert.match(xml, /--opencode/);
  });

  it("restarts on crash but not on clean exit", () => {
    // RestartOnFailure mirrors launchd KeepAlive{SuccessfulExit:false} / systemd Restart=always.
    assert.match(xml, /<RestartOnFailure>/);
    assert.match(xml, /<Interval>PT1M<\/Interval>/);
  });
});
