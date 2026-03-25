import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "../../src/parser/digdagParser";

function fixture(name: string): string {
  return readFileSync(
    resolve(__dirname, "..", "fixtures", name),
    "utf-8"
  );
}

describe("digdagParser", () => {
  describe("valid.dig", () => {
    const text = fixture("valid.dig");
    const doc = parse("file:///test/valid.dig", text);

    it("parses timezone", () => {
      expect(doc.timezone).toBeDefined();
      expect(doc.timezone!.value).toBe("Asia/Tokyo");
    });

    it("parses schedule", () => {
      expect(doc.schedule).toBeDefined();
      expect(doc.schedule!.entries.length).toBe(1);
      expect(doc.schedule!.entries[0].key).toBe("daily>");
    });

    it("parses global exports", () => {
      expect(doc.globalExports).toBeDefined();
      expect(doc.globalExports!.database).toBe("my_db");
    });

    it("parses top-level tasks", () => {
      expect(doc.tasks.length).toBe(4);
      expect(doc.tasks.map((t) => t.name)).toEqual([
        "+load_data",
        "+transform",
        "+parallel_tasks",
        "+notify",
      ]);
    });

    it("parses operators", () => {
      expect(doc.tasks[0].operator).toBeDefined();
      expect(doc.tasks[0].operator!.name).toBe("sh>");
    });

    it("parses directives", () => {
      const transform = doc.tasks[1];
      expect(transform.directives.length).toBe(1);
      expect(transform.directives[0].name).toBe("_retry");
      expect(transform.directives[0].value).toBe(3);
    });

    it("parses subtasks", () => {
      const parallel = doc.tasks[2];
      expect(parallel.subtasks.length).toBe(2);
      expect(parallel.subtasks[0].name).toBe("+task_a");
      expect(parallel.subtasks[1].name).toBe("+task_b");
    });

    it("parses _parallel flag", () => {
      expect(doc.tasks[2].hasParallel).toBe(true);
    });

    it("has no YAML errors", () => {
      expect(doc.yamlErrors.length).toBe(0);
    });
  });

  describe("empty document", () => {
    it("returns empty tasks", () => {
      const doc = parse("file:///test/empty.dig", "");
      expect(doc.tasks).toEqual([]);
      expect(doc.yamlErrors.length).toBe(0);
    });
  });

  describe("YAML errors", () => {
    it("reports parse errors", () => {
      const doc = parse("file:///test/bad.dig", ":\n  bad: [unclosed");
      expect(doc.yamlErrors.length).toBeGreaterThan(0);
    });
  });

  describe("!include directive", () => {
    const text = fixture("include.dig");
    const doc = parse("file:///test/include.dig", text);

    it("parses without errors", () => {
      expect(doc.yamlErrors.length).toBe(0);
    });

    it("parses timezone after !include", () => {
      expect(doc.timezone).toBeDefined();
      expect(doc.timezone!.value).toBe("UTC");
    });

    it("parses all tasks", () => {
      expect(doc.tasks.length).toBe(3);
      expect(doc.tasks.map((t) => t.name)).toEqual([
        "+step1",
        "+step2",
        "+step3",
      ]);
    });
  });

  describe("variable interpolations with special characters", () => {
    it("does not produce YAML errors for quotes inside ${...}", () => {
      const text = `
+task:
  if>: \${rule["col_names"].length == 0}
  _do:
    sh>: echo "done"
`;
      const doc = parse("file:///test/interpolation.dig", text);
      const yamlErrors = doc.yamlErrors.filter(
        (e) => !e.message.includes("Unclosed")
      );
      expect(yamlErrors.length).toBe(0);
    });

    it("does not produce YAML errors for colons inside ${...}", () => {
      const text = `
+task:
  echo>: \${a > 0 ? "yes" : "no"}
`;
      const doc = parse("file:///test/interpolation2.dig", text);
      const yamlErrors = doc.yamlErrors.filter(
        (e) => !e.message.includes("Unclosed")
      );
      expect(yamlErrors.length).toBe(0);
    });
  });

  describe("nested tasks", () => {
    it("parses deeply nested tasks", () => {
      const text = `
+parent:
  +child:
    +grandchild:
      sh>: echo "deep"
`;
      const doc = parse("file:///test/nested.dig", text);
      expect(doc.tasks.length).toBe(1);
      expect(doc.tasks[0].subtasks.length).toBe(1);
      expect(doc.tasks[0].subtasks[0].subtasks.length).toBe(1);
      expect(doc.tasks[0].subtasks[0].subtasks[0].operator?.name).toBe("sh>");
    });
  });
});
