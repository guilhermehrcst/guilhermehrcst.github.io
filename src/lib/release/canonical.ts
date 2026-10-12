// Deterministic serialization and digest of a record (Academy incremental release, proposal §3).
// The digest an editor approves is the SHA-256 of this text, so the text must be one and only one for a
// given record: keys sorted (UTF-16 code unit order), no whitespace, an undefined field the same as an
// absent one, and every value that has no single JSON form (NaN, Infinity, bigint, functions, symbols,
// Dates, Maps, cycles, holes) refused rather than silently coerced. Runs under Node only (build and tests).
import { createHash } from 'node:crypto';

const refuse = (why: string): never => {
  throw new Error(`canonical: ${why}`);
};

const write = (value: unknown, seen: Set<object>): string => {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return JSON.stringify(value);
    case 'number':
      return Number.isFinite(value) ? JSON.stringify(value) : refuse(`${value} has no JSON form`);
    case 'object':
      break;
    default:
      return refuse(`a ${typeof value} has no JSON form`);
  }
  const object = value as object;
  if (seen.has(object)) refuse('cycle');
  seen.add(object);
  let text: string;
  if (Array.isArray(object)) {
    text = `[${object.map((item) => (item === undefined ? refuse('undefined inside an array') : write(item, seen))).join(',')}]`;
  } else {
    const proto = Object.getPrototypeOf(object);
    if (proto !== Object.prototype && proto !== null) refuse(`a ${proto?.constructor?.name ?? 'non-plain'} object has no JSON form`);
    const entries = Object.entries(object).filter(([, v]) => v !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    text = `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${write(v, seen)}`).join(',')}}`;
  }
  seen.delete(object);
  return text;
};

/** The one text of a record. */
export const canonicalJson = (value: unknown): string => write(value, new Set());

/** `sha256:<64 hex>` of the canonical text (strings hash as UTF-8). */
export const digestOf = (value: unknown): string =>
  `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;

export const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
