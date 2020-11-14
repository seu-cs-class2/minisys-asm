import { MinisysInstructions } from '../package/instruction'

describe('instruction.ts', () => {
  describe('MinisysInstructions', () => {
    test('MinisysInstructions 应有 57 + 1 条（NOP）', () => {
      expect(MinisysInstructions).toHaveLength(57 + 1)
    })
  })
})
