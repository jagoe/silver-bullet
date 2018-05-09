import Mapping from './mapping'

export default interface Config {
  editor: string,
  path: string,
  showAfterPreview: boolean,
  mappings: {[key: string]: Mapping},
  preview: boolean | string
}
