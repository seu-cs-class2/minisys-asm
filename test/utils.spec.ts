import { binToHex, serialString } from '../package/utils'

describe('utils.ts', () => {
  describe('binToHex', () => {
    test('binToHex zeroX=true', () => {
      expect(binToHex(serialString('1000 1001 1010 0011 0101 0010 1111 1110'), true)).toBe('0x89a352fe')
    })

    test('binToHex zeroX=false', () => {
      expect(binToHex(serialString('0111 0101 0101 1010 1110 1101 0000 1111'), false)).toBe('755aed0f')
    })
  })
})
