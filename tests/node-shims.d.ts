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
    throws(fn: () => unknown, expected?: RegExp | string, message?: string): void;
    match(value: string, pattern: RegExp, message?: string): void;

    doesNotMatch(value: string, pattern: RegExp, message?: string): void;
  };
  export default assert;
}
declare module 'node:fs' {
  export function readFileSync(path: URL | string, encoding: 'utf8'): string;
  export function readFileSync(path: URL | string): { toString(): string };
  export function existsSync(path: URL | string): boolean;
  export function readdirSync(path: URL | string): string[];
  export function statSync(path: URL | string): { isDirectory(): boolean };
  export function writeFileSync(path: URL | string, text: string): void;
  export function copyFileSync(from: URL | string, to: URL | string): void;
  export function unlinkSync(path: URL | string): void;
}
declare module 'node:crypto' {
  export function createHash(algorithm: 'sha256'): {
    update(data: { toString(): string }): { digest(encoding: 'hex'): string };
  };
}
declare module 'node:child_process' {
  export function execFileSync(file: string, args: readonly string[], options: { encoding: 'utf8'; cwd?: URL | string; stdio?: readonly string[] }): string;
}
declare const process: {
  readonly argv: readonly string[];
  readonly execPath: string;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly stdout: { write(text: string): boolean };
  readonly stderr: { write(text: string): boolean };
  exit(code?: number): never;
};
