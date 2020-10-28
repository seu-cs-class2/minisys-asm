/**
 * Ensure `ensure`, else throw `Error(hint)`.
 */
export function assert(ensure: unknown, hint?: string) {
  if (!ensure) {
    throw new Error(hint)
  }
}

/**
 * 把字面量数字转换为二进制
 * @param literal 要转换的字面量数字
 * @param len 转换后的最少位数
 * @param isSignExtend 转换后位数不足时是否进行符号扩展，默认采用零扩展
 * @example 10
 * @example 0xabcd
 */
export function literalToBin(literal: string, len: number, isSignExtend: boolean = false) {
  assert(!isNaN(Number(literal)), `错误的参数：${literal}`)
  if (literal.startsWith('0x')) {
    let num = hexToBin(literal)
    return num.padStart(len, isSignExtend ? num[0] : '0')
  } else {
    return decToBin(parseInt(literal), len, isSignExtend)
  }
}

/**
 * 将十进制数转为二进制，用pad补齐到len位
 */
export function decToBin(dec: number, len: number, isSignExtend: boolean = false) {
  let num: string = ''
  if (dec < 0) {
    num = '1' + (-dec - 1).toString(2).split('').map(v => { return String.fromCharCode(v.charCodeAt(0) ^ 1) }).join('')
  } else {
    num = '0' + dec.toString(2)
  }
  return num.padStart(len, isSignExtend ? num[0] : '0')
}

/**
 * 将4n位二进制转为n位十六进制
 */
export function binToHex(bin: string, zeroX = true) {
  if (bin.length % 4 !== 0) {
    throw new Error('二进制位数不为4的倍数。')
  }
  return (
    ['', '0x'][Number(zeroX)] +
    bin
      .match(/\d{4}/g)! // [1000, 1000]
      .map(v => '0123456789abcdef'.charAt(parseInt(v, 2)))
      .join('')
  )
}

/**
 * 将十进制数转为十六进制，十进制数会先被转换为4n位二进制
 */
export function decToHex(dec: number, len: number, zeroX = true) {
  return binToHex(decToBin(dec, len, false), zeroX)
}

/**
 * 十六进制转十进制
 */
export function hexToDec(hex: string) {
  return parseInt(hex, 16)
}

/**
 * 将十六进制每位转换为4位二进制，参数带不带0x头都可以
 */
export function hexToBin(hex: string) {
  if (hex.startsWith('0x')) {
    hex = hex.substr(2)
  }
  const table = Array(16)
    .fill('')
    .map((_, i) => decToBin(i, 4, false))
  let res = ''
  hex.split('').forEach(v => {
    res += table['0123456789abcdef'.indexOf(v)]
  })
  return res
}

/**
 * 去除一串字符串中的全部空格
 */
export function serialString(bin: string) {
  return bin.replace(/\s+/g, '')
}

/**
 * 算地址偏移量
 */
export function getOffset(holder: {
  byte?: number
  half?: number
  word?: number
  space?: number
  instruction?: number
}) {
  const WORD_LEN = 4
  const HALF_LEN = WORD_LEN / 2
  const BYTE_LEN = 1
  const INS_LEN = WORD_LEN
  return (
    (holder.byte || 0) * BYTE_LEN +
    (holder.half || 0) * HALF_LEN +
    (holder.word || 0) * WORD_LEN +
    (holder.space || 0) +
    (holder.instruction || 0) * INS_LEN
  )
}

/**
 * 算偏移后的地址
 * @param baseAddr 基地址，十六进制或十进制
 */
export function getOffsetAddr(baseAddr: string, offsetBit: number) {
  let base = baseAddr.startsWith('0x') ? hexToDec(baseAddr) : Number(baseAddr)
  return base + offsetBit
}
