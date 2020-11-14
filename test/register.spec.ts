import { regToBin } from '../package/register'

describe('register.ts', () => {
  describe('regToBin', () => {
    test('对寄存器别名转换正确', () => {
      expect(regToBin('$v1')).toBe('00011')
    })

    test('对寄存器非别名转换正确', () => {
      expect(regToBin('$31')).toBe('11111')
    })
  })
})
