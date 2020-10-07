import { MinisysInstructions } from '../package/instruction'

describe('Instruction.ts', () => {
  describe('MinisysInstructions', () => {
    test('MinisysInstructions 应有 57 + 1 条（NOP）', () => {
      expect(MinisysInstructions).toHaveLength(57 + 1)
    })
  })
})
