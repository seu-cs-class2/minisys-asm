/**
 * Minisys汇编器 - coe、txt文件导出
 * by Withod, z0gSh1u @ 2020-10
 */

import { DataSeg, TextSeg } from './assembler'
import { assert, binToHex, decToHex, literalToBin, sizeof } from './utils'

/**
 * 数据段转coe文件
 * @param padTo 补齐到多少KByte
 */
export function dataSegToCoe(dataSeg: DataSeg, padTo = 64) {
  const wordLength = sizeof('word')
  let coe = 'memory_initialization_radix = 16;\nmemory_initialization_vector =\n'
  const lineLimit = (padTo * 1024) / wordLength
  let buf = '',
    lineno = 0

  dataSeg.vars.forEach(v => {
    if (v.addr / wordLength - lineno > 0 && buf.length > 0) {
      coe += buf.padStart(8, '0') + ',\n'
      buf = ''
      lineno++
    }
    coe += '00000000,\n'.repeat(v.addr / wordLength - lineno)
    lineno = v.addr / wordLength
    buf = '00'.repeat(((v.addr % wordLength) - buf.length / 2 + wordLength) % wordLength) + buf
    v.comps.forEach(comp => {
      assert(lineno < lineLimit, `变量 ${v.name} 地址超出限制`)
      switch (comp.type) {
        case 'ascii':
          comp.val.split('').forEach(c => {
            buf = decToHex(c.charCodeAt(0), 8, false) + buf
            if (buf.length == 8) {
              coe += buf + ',\n'
              buf = ''
              lineno++
            }
          })
          assert(lineno < lineLimit, `变量 ${v.name} 地址超出限制`)
          break
        case 'space':
          buf = '00' + buf
          break
        default:
          buf = binToHex(literalToBin(comp.val, sizeof(comp.type) * 8, true), false) + buf
      }
      assert(buf.length <= 8, `变量 ${v.name} 中存在未对齐地址`)
      if (buf.length == 8) {
        coe += buf + ',\n'
        buf = ''
        lineno++
      }
    })
  })
  if (buf.length > 0) {
    coe += '0'.repeat(8 - buf.length) + buf + ',\n'
    lineno++
  }
  coe += '00000000,\n'.repeat(lineLimit - lineno)
  return coe.slice(0, -2) + ';\n'
}

/**
 * 代码段转coe文件
 * @param padTo 补齐到多少KByte
 */
export function textSegToCoe(textSeg: TextSeg, padTo = 64) {
  const wordLength = sizeof('word')
  let coe = 'memory_initialization_radix = 16;\nmemory_initialization_vector =\n'
  const lineLimit = (padTo * 1024) / wordLength
  const startLine = Number(textSeg.startAddr) / wordLength
  let lineno = 0

  coe += '00000000,\n'.repeat(startLine)
  textSeg.ins.forEach(ins => {
    assert(lineno + startLine < lineLimit, `第 ${lineno} 条指令 ${ins.symbol} 地址超出限制`)
    let buf = ''
    ins.components.forEach(comp => {
      buf += comp.val
    })
    coe += binToHex(buf, false) + ',\n'
    lineno++
  })
  coe += '00000000,\n'.repeat(lineLimit - lineno - startLine)
  return coe.slice(0, -2) + ';\n'
}

/**
 * 将两个coe文件并为可用UART串口写入的ASCII流文件
 */
export function coeToTxt(programCoe: string, dataCoe: string) {
  const introSignal = '03020000' // 前导握手信号
  /**
   * coe文件内容转hex流串
   */
  const toStream = (coe: string) =>
    coe
      .replace(/\r\n/, '\n')
      .split('\n')
      .filter(v => v.trim())
      .slice(2)
      .map(x => x.replace(/[,;]/g, ''))
      .join('')
  const content = `${introSignal}${toStream(programCoe)}${toStream(dataCoe)}`
  return content
}
