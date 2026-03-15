import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "../../src/parser/digdagParser";
import { computeDiagnostics } from "../../src/providers/diagnosticsProvider";

function fixture(name: string): string {
  return readFileSync(
    resolve(__dirname, "..", "fixtures", name),
    "utf-8"
  );
}

describe("diagnosticsProvider", () => {
  describe("valid document", () => {
    it("produces no diagnostics for valid.dig", () => {
      const doc = parse("file:///test/valid.dig", fixture("valid.dig"));
      const diagnostics = computeDiagnostics(doc);
      expect(diagnostics.length).toBe(0);
    });
  });

  describe("multiple operators", () => {
    it("reports error when task has two operators", () => {
      const text = `
+task:
  sh>: echo "a"
  py>: my.func
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const multiOp = diagnostics.filter((d) =>
        d.message.includes("Only one operator")
      );
      expect(multiOp.length).toBe(1);
      expect(multiOp[0].message).toContain("py>");
    });

    it("reports error for td> with require> in same task", () => {
      const text = `
+step4:
  td>: tasks/td_sample.sql
  database: sample_db
  engine: hive
  require>: test.dig
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const multiOp = diagnostics.filter((d) =>
        d.message.includes("Only one operator")
      );
      expect(multiOp.length).toBe(1);
      expect(multiOp[0].message).toContain("require>");
    });

    it("does NOT report error for operator inside _do (for_each> + echo>)", () => {
      const text = `
+repeat:
  for_each>:
    fruit: [apple, orange]
    verb: [eat, throw]
  _do:
    echo>: \${verb} \${fruit}
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const multiOp = diagnostics.filter((d) =>
        d.message.includes("Only one operator")
      );
      expect(multiOp.length).toBe(0);
    });
  });

  describe("operator and subtasks", () => {
    it("reports error when task has both operator and subtasks", () => {
      const text = `
+task:
  td>: query.sql
  +subtask:
    sh>: echo "sub"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const conflict = diagnostics.filter((d) =>
        d.message.includes("cannot have both")
      );
      expect(conflict.length).toBe(1);
    });
  });

  describe("_after without _parallel", () => {
    it("reports warning when _after used without _parallel parent", () => {
      const text = `
+parent:
  +child:
    _after: something
    sh>: echo "oops"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const afterWarn = diagnostics.filter((d) =>
        d.message.includes("_after")
      );
      expect(afterWarn.length).toBe(1);
    });
  });

  describe("_after with _parallel", () => {
    it("no warning when parent has _parallel", () => {
      const text = `
+parent:
  _parallel: true
  +child_a:
    sh>: echo "a"
  +child_b:
    _after: child_a
    sh>: echo "b"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const afterWarn = diagnostics.filter((d) =>
        d.message.includes("_after")
      );
      expect(afterWarn.length).toBe(0);
    });
  });

  describe("_background and _parallel conflict", () => {
    it("reports warning when both are true", () => {
      const text = `
+task:
  _parallel: true
  _background: true
  sh>: echo "both"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const conflict = diagnostics.filter((d) =>
        d.message.includes("_background")
      );
      expect(conflict.length).toBe(1);
    });
  });

  describe("unknown operator", () => {
    it("warns on unknown operator", () => {
      const text = `
+task:
  unknown_op>: value
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown operator")
      );
      expect(unknown.length).toBe(1);
    });
  });

  describe("unknown directive", () => {
    it("warns on unknown directive", () => {
      const text = `
+task:
  _unknown_dir: value
  sh>: echo "test"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown directive")
      );
      expect(unknown.length).toBe(1);
    });
  });

  describe("invalid _retry", () => {
    it("reports error for negative retry", () => {
      const text = `
+task:
  _retry: -1
  sh>: echo "test"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const retryErr = diagnostics.filter((d) =>
        d.message.includes("_retry")
      );
      expect(retryErr.length).toBe(1);
    });

    it("accepts valid retry number", () => {
      const text = `
+task:
  _retry: 3
  sh>: echo "test"
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const retryErr = diagnostics.filter((d) =>
        d.message.includes("_retry")
      );
      expect(retryErr.length).toBe(0);
    });
  });

  describe("unknown operator parameter", () => {
    it("warns on unknown parameter for a known operator", () => {
      const text = `
+task:
  sh>: echo "hello"
  unknown_param: value
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown parameter")
      );
      expect(unknown.length).toBe(1);
      expect(unknown[0].message).toContain("unknown_param");
      expect(unknown[0].message).toContain("sh>");
    });

    it("does not warn on valid parameter for a known operator", () => {
      const text = `
+task:
  sh>: echo "hello"
  shell: /bin/bash
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown parameter")
      );
      expect(unknown.length).toBe(0);
    });

    it("does not warn on parameters for unknown operators", () => {
      const text = `
+task:
  custom_op>: value
  some_param: abc
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown parameter")
      );
      expect(unknown.length).toBe(0);
    });

    it("warns on multiple unknown parameters", () => {
      const text = `
+task:
  td>: queries/test.sql
  database: mydb
  bad_param1: value1
  bad_param2: value2
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const unknown = diagnostics.filter((d) =>
        d.message.includes("Unknown parameter")
      );
      expect(unknown.length).toBe(2);
    });
  });

  describe("missing required operator parameter", () => {
    it("reports error when required parameter is missing", () => {
      const text = `
+task:
  td_table_export>: mydb.mytable
  s3_bucket: my-bucket
  s3_path_prefix: /data
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const missing = diagnostics.filter((d) =>
        d.message.includes("Missing required parameter")
      );
      // td_table_export> requires: file_format, from, to (td_table_export> itself is the operator value)
      expect(missing.length).toBe(3);
    });

    it("does not report error when all required parameters are present", () => {
      const text = `
+task:
  td_table_export>: mydb.mytable
  file_format: json.gz
  from: "2024-01-01 00:00:00 +0000"
  to: "2024-01-02 00:00:00 +0000"
  s3_bucket: my-bucket
  s3_path_prefix: /data
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const missing = diagnostics.filter((d) =>
        d.message.includes("Missing required parameter")
      );
      expect(missing.length).toBe(0);
    });

    it("does not check required params for unknown operators", () => {
      const text = `
+task:
  custom_op>: value
`;
      const doc = parse("file:///test.dig", text);
      const diagnostics = computeDiagnostics(doc);
      const missing = diagnostics.filter((d) =>
        d.message.includes("Missing required parameter")
      );
      expect(missing.length).toBe(0);
    });
  });

  describe("unclosed variable interpolation", () => {
    it("reports error for unclosed ${", () => {
      const doc = parse(
        "file:///test.dig",
        fixture("variables.dig")
      );
      const diagnostics = computeDiagnostics(doc);
      const unclosed = diagnostics.filter((d) =>
        d.message.includes("Unclosed")
      );
      expect(unclosed.length).toBe(1);
    });
  });
});
