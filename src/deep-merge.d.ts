declare function DeepMerge(
  fn: (target: unknown, source: unknown, key: string) => unknown,
): (target: unknown, source: unknown) => unknown

declare module 'deep-merge' {
  export = DeepMerge
}
