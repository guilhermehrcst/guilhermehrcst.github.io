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
  };
  export default assert;
}
