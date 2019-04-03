/* eslint-disable no-undef */

import * as cobra from './cobra'

onmessage = async (message) => {
  const model = cobra.modelFromWorkerData(message.data)
  const solution = await (model.optimize())
  postMessage(solution)
}
