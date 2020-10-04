/**
 * 将十进制数转为二进制，用pad补齐到len位
 */
export function decToBin(dec: number, len: number, pad: '0' | '1' = '0') {
  return Number(dec).toString(2).padStart(len, pad)
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
  return binToHex(decToBin(dec, len, '0'), zeroX)
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
    .map((_, i) => decToBin(i, 4, '0'))
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
