// The few Node built-ins the tests use, typed just enough for `astro check` (the project has no
// @types/node, and adding it for two modules is not worth a dependency). Node itself runs the
// tests with --experimental-strip-types, which ignores these declarations.
declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
}
declare module 'node:assert/strict' {
  const assert: {
    ok(value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    throws(fn: () => unknown, message?: string): void;
    match(value: string, pattern: RegExp, message?: string): void;
  };
  export default assert;
}
declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
  export function readdirSync(path: URL | string): string[];
}
