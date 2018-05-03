declare function DeepMerge(fn: (target: any, source: any, key: string) => any): (target: any, source: any) => any

declare module 'deep-merge' {
  export = DeepMerge
}
