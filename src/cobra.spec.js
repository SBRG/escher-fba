/* eslint-env jest */

import * as cobra from './cobra'

describe('modelFromJsonData', () => {
  it('returns null for null data', () => {
    expect(cobra.modelFromJsonData(null)).toBeNull()
  })
})
