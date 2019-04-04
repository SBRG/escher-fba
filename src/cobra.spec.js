/* eslint-env jest */

import * as cobra from './cobra.js'

const mockModelData = {
  reactions: [
    {
      id: 'PGI',
      objective_coefficient: 2
    },
    {
      id: 'ACK',
      objective_coefficient: -0.5
    },
    {
      id: 'ICL'
    }
  ],
  metabolites: [],
  genes: [],
  id: 'mockModelData',
  notes: '',
  description: ''
}

describe('modelFromJsonData', () => {
  it('returns null for null data', () => {
    expect(cobra.modelFromJsonData(null)).toBeNull()
  })

  it('converts objectives to 1, -1, or 0', () => {
    const model = cobra.modelFromJsonData(mockModelData)
    expect(model.reactions[0].objective_coefficient).toEqual(1)
    expect(model.reactions[1].objective_coefficient).toEqual(-1)
    expect(model.reactions[2].objective_coefficient).toEqual(0)
  })
})
