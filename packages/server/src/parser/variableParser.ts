import { LSPRange, DiagnosticInfo } from "../model/types";
import { DiagnosticSeverity } from "vscode-languageserver";
import { LineOffsetTable } from "../utils/positionUtils";

export interface VariableReference {
  name: string;
  range: LSPRange;
  fullExpression: string;
}

export function parseVariables(
  text: string,
  lineOffset: LineOffsetTable
): { variables: VariableReference[]; errors: DiagnosticInfo[] } {
  const variables: VariableReference[] = [];
  const errors: DiagnosticInfo[] = [];

  let i = 0;
  while (i < text.length) {
    if (text[i] === "$" && i + 1 < text.length && text[i + 1] === "{") {
      const start = i;
      i += 2; // skip ${
      const exprStart = i;
      let depth = 1;

      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") depth--;
        if (depth > 0) i++;
      }

      if (depth === 0) {
        const expr = text.substring(exprStart, i);
        const fullExpr = text.substring(start, i + 1);
        const name = expr.split(/[.([\s]/)[0].trim();

        variables.push({
          name,
          range: lineOffset.rangeFromOffsets(start, i + 1),
          fullExpression: fullExpr,
        });
        i++; // skip closing }
      } else {
        errors.push({
          message: "Unclosed `${...}` interpolation",
          range: lineOffset.rangeFromOffsets(start, text.length),
          severity: DiagnosticSeverity.Error,
        });
        break;
      }
    } else {
      i++;
    }
  }

  return { variables, errors };
}
