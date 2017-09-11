/* eslint-disable no-undef */
import * as COBRA from './COBRA.js'
onmessage = async (message) => {
  const model = COBRA.modelFromWorkerData(message.data)
  const solution = await (model.optimize())
  postMessage(solution)
}
