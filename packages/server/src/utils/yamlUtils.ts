import { YAMLMap, Pair, Scalar, isMap, isScalar, isPair } from "yaml";

export function getKeyName(pair: Pair): string | undefined {
  if (isScalar(pair.key)) {
    return String(pair.key.value);
  }
  return undefined;
}

export function isTaskKey(key: string): boolean {
  return key.startsWith("+");
}

export function isOperatorKey(key: string): boolean {
  return key.endsWith(">");
}

export function isDirectiveKey(key: string): boolean {
  return key.startsWith("_");
}

export function getScalarValue(node: unknown): unknown {
  if (isScalar(node)) {
    return node.value;
  }
  return node;
}

export function forEachPair(
  map: YAMLMap,
  callback: (pair: Pair, key: string) => void
): void {
  for (const item of map.items) {
    if (isPair(item)) {
      const key = getKeyName(item);
      if (key !== undefined) {
        callback(item, key);
      }
    }
  }
}
