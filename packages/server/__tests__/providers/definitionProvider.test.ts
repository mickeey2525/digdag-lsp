import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { readFileSync } from "fs";
import { computeDefinition } from "../../src/providers/definitionProvider";

const fixturesDir = resolve(__dirname, "..", "fixtures");

function createDocFromFixture(name: string) {
  const filePath = resolve(fixturesDir, name);
  const content = readFileSync(filePath, "utf-8");
  const uri = URI.file(filePath).toString();
  return TextDocument.create(uri, "digdag", 1, content);
}

describe("definitionProvider", () => {
  describe("call> operator", () => {
    it("resolves call> to the target .dig file", () => {
      const textDoc = createDocFromFixture("caller.dig");
      // Line 1: call>: call_target.dig
      const result = computeDefinition(textDoc, { line: 1, character: 10 });

      expect(result).not.toBeNull();
      const location = result as { uri: string };
      expect(location.uri).toContain("call_target.dig");
    });
  });

  describe("require> operator", () => {
    it("resolves require> with auto-appended .dig extension", () => {
      const textDoc = createDocFromFixture("caller.dig");
      // Line 4: require>: call_target
      const result = computeDefinition(textDoc, { line: 4, character: 12 });

      expect(result).not.toBeNull();
      const location = result as { uri: string };
      expect(location.uri).toContain("call_target.dig");
    });
  });

  describe("non-existent file", () => {
    it("returns null for missing file reference", () => {
      const content = "+step:\n  call>: does_not_exist.dig";
      const uri = URI.file(resolve(fixturesDir, "test.dig")).toString();
      const textDoc = TextDocument.create(uri, "digdag", 1, content);

      const result = computeDefinition(textDoc, { line: 1, character: 10 });
      expect(result).toBeNull();
    });
  });

  describe("non-file-ref keys", () => {
    it("returns null for regular config keys", () => {
      const content = "+step:\n  database: my_db";
      const uri = URI.file(resolve(fixturesDir, "test.dig")).toString();
      const textDoc = TextDocument.create(uri, "digdag", 1, content);

      const result = computeDefinition(textDoc, { line: 1, character: 5 });
      expect(result).toBeNull();
    });
  });

  describe("!include directive", () => {
    it("resolves !include to the target file", () => {
      // Simulate the original !include line (before preprocessing)
      const content = "!include: call_target.dig\n\n+step:\n  sh>: echo hi";
      const uri = URI.file(resolve(fixturesDir, "test.dig")).toString();
      const textDoc = TextDocument.create(uri, "digdag", 1, content);

      const result = computeDefinition(textDoc, { line: 0, character: 12 });
      expect(result).not.toBeNull();
      const location = result as { uri: string };
      expect(location.uri).toContain("call_target.dig");
    });
  });
});
