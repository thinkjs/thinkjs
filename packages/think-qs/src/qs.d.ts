// Private structural boundary for the untyped runtime dependency. No ambient
// declaration or qs types leak into the generated public package declarations.
declare module 'qs' {
  export function parse(input: string | undefined, options: object): unknown;
  export function stringify(input: unknown): string;
}
