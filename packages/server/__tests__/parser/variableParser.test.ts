import { describe, it, expect } from "vitest";
import { parseVariables } from "../../src/parser/variableParser";
import { LineOffsetTable } from "../../src/utils/positionUtils";

describe("variableParser", () => {
  it("parses simple variable", () => {
    const text = "echo ${session_date}";
    const table = new LineOffsetTable(text);
    const { variables, errors } = parseVariables(text, table);

    expect(variables.length).toBe(1);
    expect(variables[0].name).toBe("session_date");
    expect(variables[0].fullExpression).toBe("${session_date}");
    expect(errors.length).toBe(0);
  });

  it("parses multiple variables", () => {
    const text = "${a} and ${b}";
    const table = new LineOffsetTable(text);
    const { variables } = parseVariables(text, table);

    expect(variables.length).toBe(2);
    expect(variables[0].name).toBe("a");
    expect(variables[1].name).toBe("b");
  });

  it("parses variable with method call", () => {
    const text = "${moment(session_time).format('yyyy')}";
    const table = new LineOffsetTable(text);
    const { variables } = parseVariables(text, table);

    expect(variables.length).toBe(1);
    expect(variables[0].name).toBe("moment");
  });

  it("detects unclosed variable", () => {
    const text = "echo ${unclosed";
    const table = new LineOffsetTable(text);
    const { errors } = parseVariables(text, table);

    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("Unclosed");
  });

  it("handles nested braces", () => {
    const text = "${map{key}}";
    const table = new LineOffsetTable(text);
    const { variables, errors } = parseVariables(text, table);

    expect(errors.length).toBe(0);
    expect(variables.length).toBe(1);
  });

  it("handles no variables", () => {
    const text = "plain text with no vars";
    const table = new LineOffsetTable(text);
    const { variables, errors } = parseVariables(text, table);

    expect(variables.length).toBe(0);
    expect(errors.length).toBe(0);
  });
});
