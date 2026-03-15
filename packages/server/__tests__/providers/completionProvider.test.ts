import { describe, it, expect } from "vitest";
import { TextDocument } from "vscode-languageserver-textdocument";
import { parse } from "../../src/parser/digdagParser";
import { computeCompletions } from "../../src/providers/completionProvider";

function createDoc(content: string): {
  parsed: ReturnType<typeof parse>;
  textDoc: TextDocument;
} {
  const uri = "file:///test.dig";
  const textDoc = TextDocument.create(uri, "digdag", 1, content);
  const parsed = parse(uri, content);
  return { parsed, textDoc };
}

describe("completionProvider", () => {
  describe("root level completions", () => {
    it("provides root completions at column 0", () => {
      const { parsed, textDoc } = createDoc("");
      const completions = computeCompletions(parsed, textDoc, {
        line: 0,
        character: 0,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("+task");
      expect(labels).toContain("timezone");
      expect(labels).toContain("schedule");
      expect(labels).toContain("_export");
    });
  });

  describe("task level completions", () => {
    it("provides operators and directives inside a task", () => {
      const { parsed, textDoc } = createDoc("+my_task:\n  ");
      const completions = computeCompletions(parsed, textDoc, {
        line: 1,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("sh>");
      expect(labels).toContain("td>");
      expect(labels).toContain("_retry");
      expect(labels).toContain("_parallel");
      expect(labels).toContain("+subtask");
    });
  });

  describe("operator parameter completions", () => {
    it("suggests td> specific params when task has td> operator", () => {
      const content = "+my_task:\n  td>: queries/my_query.sql\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 2,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("database");
      expect(labels).toContain("engine");
      expect(labels).toContain("priority");
      expect(labels).toContain("create_table");
      // Should not contain other operators
      expect(labels).not.toContain("sh>");
      expect(labels).not.toContain("py>");
      // Should still contain directives and subtask
      expect(labels).toContain("_retry");
      expect(labels).toContain("+subtask");
    });

    it("suggests sh> specific params when task has sh> operator", () => {
      const content = "+run_shell:\n  sh>: echo hello\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 2,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("shell");
      // The operator key itself should be excluded
      expect(labels).not.toContain("sh>");
      expect(labels).not.toContain("td>");
    });

    it("excludes already-used params from suggestions", () => {
      const content = "+my_task:\n  td>: queries/my_query.sql\n  database: mydb\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 3,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).not.toContain("database");
      expect(labels).not.toContain("td>");
      expect(labels).toContain("engine");
      expect(labels).toContain("priority");
    });

    it("shows all operators when task has no operator yet", () => {
      const content = "+my_task:\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 1,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("sh>");
      expect(labels).toContain("td>");
      expect(labels).toContain("py>");
    });

    it("marks required params with sort priority", () => {
      const content = "+my_task:\n  td>: queries/my_query.sql\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 2,
        character: 2,
      });
      const databaseItem = completions.find((c) => c.label === "database");
      const engineItem = completions.find((c) => c.label === "engine");
      // Both are optional for td>, so both get "1" prefix
      expect(databaseItem?.sortText).toBe("1database");
      expect(engineItem?.sortText).toBe("1engine");
    });

    it("sets correct detail for operator params", () => {
      const content = "+my_task:\n  td>: queries/my_query.sql\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 2,
        character: 2,
      });
      const databaseItem = completions.find((c) => c.label === "database");
      expect(databaseItem?.detail).toBe("td> parameter");
    });

    it("excludes already-used directives from suggestions", () => {
      const content = "+my_task:\n  sh>: echo hello\n  _retry: 3\n  ";
      const { parsed, textDoc } = createDoc(content);
      const completions = computeCompletions(parsed, textDoc, {
        line: 3,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).not.toContain("_retry");
      expect(labels).toContain("_parallel");
    });
  });

  describe("schedule completions", () => {
    it("provides schedule types after schedule:", () => {
      const { parsed, textDoc } = createDoc("schedule:\n  ");
      const completions = computeCompletions(parsed, textDoc, {
        line: 1,
        character: 2,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("daily>");
      expect(labels).toContain("hourly>");
      expect(labels).toContain("cron>");
    });
  });

  describe("variable completions", () => {
    it("provides variable completions inside ${", () => {
      const { parsed, textDoc } = createDoc('+task:\n  sh>: echo "${session');
      const completions = computeCompletions(parsed, textDoc, {
        line: 1,
        character: 21,
      });
      const labels = completions.map((c) => c.label);
      expect(labels).toContain("session_date");
      expect(labels).toContain("session_time");
    });

    it("provides all variables on empty prefix", () => {
      const { parsed, textDoc } = createDoc("+task:\n  sh>: ${");
      const completions = computeCompletions(parsed, textDoc, {
        line: 1,
        character: 9,
      });
      expect(completions.length).toBeGreaterThan(5);
    });
  });
});
