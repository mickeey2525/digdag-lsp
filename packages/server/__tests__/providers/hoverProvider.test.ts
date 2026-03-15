import { describe, it, expect } from "vitest";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse } from "../../src/parser/digdagParser";
import { computeHover } from "../../src/providers/hoverProvider";

function createDoc(content: string) {
  const uri = "file:///test.dig";
  const textDoc = TextDocument.create(uri, "digdag", 1, content);
  const parsed = parse(uri, content);
  return { parsed, textDoc };
}

describe("hoverProvider", () => {
  describe("operator hover", () => {
    it("shows hover for sh> operator", () => {
      const { parsed, textDoc } = createDoc("+task:\n  sh>: echo hi");
      const hover = computeHover(parsed, textDoc, { line: 1, character: 3 });
      expect(hover).not.toBeNull();
      expect(hover!.contents).toBeDefined();
      const value = (hover!.contents as { value: string }).value;
      expect(value).toContain("sh>");
      expect(value).toContain("shell");
    });
  });

  describe("directive hover", () => {
    it("shows hover for _retry directive", () => {
      const { parsed, textDoc } = createDoc("+task:\n  _retry: 3\n  sh>: x");
      const hover = computeHover(parsed, textDoc, { line: 1, character: 4 });
      expect(hover).not.toBeNull();
      const value = (hover!.contents as { value: string }).value;
      expect(value).toContain("_retry");
      expect(value).toContain("retry");
    });
  });

  describe("variable hover", () => {
    it("shows hover for session_date variable", () => {
      const { parsed, textDoc } = createDoc(
        '+task:\n  sh>: echo "${session_date}"'
      );
      const hover = computeHover(parsed, textDoc, { line: 1, character: 20 });
      expect(hover).not.toBeNull();
      const value = (hover!.contents as { value: string }).value;
      expect(value).toContain("session_date");
    });
  });

  describe("top-level key hover", () => {
    it("shows hover for timezone", () => {
      const { parsed, textDoc } = createDoc("timezone: UTC");
      const hover = computeHover(parsed, textDoc, { line: 0, character: 3 });
      expect(hover).not.toBeNull();
      const value = (hover!.contents as { value: string }).value;
      expect(value).toContain("timezone");
    });
  });

  describe("no hover", () => {
    it("returns null for non-key position", () => {
      const { parsed, textDoc } = createDoc("+task:\n  sh>: echo hello");
      const hover = computeHover(parsed, textDoc, {
        line: 1,
        character: 15,
      });
      expect(hover).toBeNull();
    });
  });
});
