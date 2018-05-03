import Mapping from './mapping'

export default interface Config {
  path: string,
  mappings: {[key: string]: Mapping},
  preview: boolean | string
}
