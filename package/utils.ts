/**
 * Utilities
 * by Withod, z0gSh1u @ 2020-10
 */

import { getLabelAddr, getPC, getVarAddr, VarCompType } from './assembler'

export class SeuError extends Error {}

/**
 * Ensure `ensure`, else throw `SeuError(hint)`.
 */
export function assert(ensure: unknown, hint?: string) {
  if (!ensure) {
    throw new SeuError(hint)
  }
}

/**
 * 将label或字面量转换为二进制
 * @param label label名称或字面量数字
 * @param len 转换后的长度
 * @param isOffset 转换而成的是否为相对当前地址的偏移量
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 */
export function labelToBin(label: string, len: number, isOffset: boolean, signExt: boolean = false) {
  try {
    if (!isOffset) {
      return decToBin(
        // @ts-ignore
        parseInt(literalToBin(label, len, signExt), 2) + (globalThis?._minisys?._userAppOffset || 0),
        len,
        signExt
      ).slice(-len)
    } else {
      return literalToBin(label, len, signExt).slice(-len)
    }
  } catch (e) {
    return literalToBin((getLabelAddr(label) - (isOffset ? getPC() : 0)).toString(), len, isOffset).slice(-len)
  }
}

/**
 * 将变量名或字面量转换为二进制
 * @param name 变量名称或字面量数字
 * @param len 转换后的长度
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 */
export function varToAddrBin(name: string, len: number, signExt: boolean = false) {
  try {
    return literalToBin(name, len, signExt).slice(-len)
  } catch (_) {
    return literalToBin(getVarAddr(name).toString(), len).slice(-len)
  }
}

/**
 * 把字面量数字转换为二进制
 * @param literal 要转换的字面量数字
 * @param len 转换后的最少位数
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 * @example 10
 * @example 0xabcd
 */
export function literalToBin(literal: string, len: number, signExt: boolean = false) {
  assert(!isNaN(Number(literal)), `错误的参数：${literal}`)
  if (literal.startsWith('0x')) {
    let num = hexToBin(literal)
    return num.padStart(len, signExt && parseInt(literal, 16) < 0 ? '1' : '0')
  } else {
    return decToBin(parseInt(literal), len, signExt)
  }
}

/**
 * 将十进制数转为二进制，用pad补齐到len位，支持负数
 */
export function decToBin(dec: number, len: number, signExt = false) {
  let num: string = ''
  if (dec < 0) {
    // 算补码
    num = (-dec - 1)
      .toString(2)
      .split('')
      .map(v => String.fromCharCode(v.charCodeAt(0) ^ 1))
      .join('')
  } else {
    num = dec.toString(2)
  }
  return num.padStart(len, signExt && dec < 0 ? '1' : '0')
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
 * 获取变量组分或指令占用的字节数
 */
export function sizeof(type: VarCompType | 'ins') {
  const size =
    {
      byte: 1,
      half: 2,
      word: 4,
      space: 1,
      ascii: 1,
      ins: 4, // 指令
    }[type] || -1
  assert(size !== -1, `错误的变量类型：${type}`)
  return size
}

/**
 * 算地址偏移量
 */
export function getOffset(holder: {
  byte?: number
  half?: number
  word?: number
  ascii?: number
  space?: number
  ins?: number
}) {
  return (
    (holder.byte || 0) * sizeof('byte') +
    (holder.half || 0) * sizeof('half') +
    (holder.word || 0) * sizeof('word') +
    (holder.ascii || 0) * sizeof('ascii') +
    (holder.space || 0) +
    (holder.ins || 0) * sizeof('word')
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
