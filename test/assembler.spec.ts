import { parseOneLine } from '../package/assembler'
import { serialString } from '../package/utils'

describe('AsmParser.ts', () => {
  describe('parseOneLine', () => {
    test('R型指令解析正确', () => {
      expect(parseOneLine('mult $2, $v1').toBinary()).toBe(serialString('000000 00010 00011 0000000000 011000'))
    })

    test('I型指令解析正确', () => {
      expect(parseOneLine('beq $1, $2, 40').toBinary()).toBe(serialString('000100 00001 00010 00000000 00101000'))
    })

    test('J型指令解析正确', () => {
      expect(parseOneLine('j 0x2710').toBinary()).toBe(serialString('000010 000000000 00010011100010000'))
    })
  })
})
