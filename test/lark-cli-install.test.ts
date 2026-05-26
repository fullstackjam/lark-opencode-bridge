import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLarkCliVersion } from "../src/lark/lark-cli-install.js";

describe("parseLarkCliVersion", () => {
  it("parses standard lark-cli --version output", () => {
    assert.equal(parseLarkCliVersion("lark-cli version 1.0.40"), "1.0.40");
  });

  it("returns undefined for empty output", () => {
    assert.equal(parseLarkCliVersion(""), undefined);
  });
});
