import { deepmerge } from './merge'
export { equal } from './equal'
export { copy } from './copy'

const overwriteMerge = function overwriteMerge(destinationArray, sourceArray, options) {
  return sourceArray
}

export const merge = function (destination, source) {
  return deepmerge(destination, source, {
    arrayMerge: overwriteMerge
  })
}
