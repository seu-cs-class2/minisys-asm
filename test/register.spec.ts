import { regToBin } from '../package/Register'

describe('Register.ts', () => {
  describe('regToBin', () => {
    test('对寄存器别名转换正确', () => {
      expect(regToBin('$v1')).toBe('00011')
    })
  })
})
