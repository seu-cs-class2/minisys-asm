import { DataSeg, TextSeg } from './assembler'
import { assert, binToHex, decToHex, literalToBin, sizeof } from './utils'

export function dataSegToCoe(dataSeg: DataSeg, padTo = 64) {
  let coe = 'memory_initialization_radix = 16;\nmemory_initialization_vector =\n'
  const lineLimit = padTo * 1024 / 4
  let buf = '',
    lineno = 0
  
  dataSeg.vars.forEach(v => {
    if (v.addr / 4 - lineno > 0 && buf.length > 0) {
      coe += buf.padStart(8, '0') + ',\n'
      buf = ''
      lineno++
    }
    coe += '00000000,\n'.repeat(v.addr / 4 - lineno)
    lineno = v.addr / 4
    buf = '00'.repeat((v.addr % 4 - buf.length / 2 + 4) % 4) + buf
    v.comps.forEach(comp => {
      assert(lineno < lineLimit, `变量${v.name}地址超出限制`)
      switch(comp.type) {
        case 'ascii':
          comp.val.split('').forEach(c => {
            buf = decToHex(c.charCodeAt(0), 8, false) + buf
            if (buf.length == 8) {
              coe += buf + ',\n'
              buf = ''
              lineno++
            }
          })
          assert(lineno < lineLimit, `变量${v.name}地址超出限制`)
          break
        case 'space':
          buf = '00' + buf
          break
        default:
          buf = binToHex(literalToBin(comp.val, sizeof(comp.type) * 8, true), false) + buf
      }
      assert(buf.length <= 8, `变量${v.name}中存在未对齐地址`)
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

export function textSegToCoe(textSeg: TextSeg, padTo = 64) {
  // TODO:
  return
}

/**
 * 将两个coe文件并为可用UART串口写入的ASCII流文件
 */
export function coeToTxt(programCoe: string, dataCoe: string) {
  const toStream = (coe: string) =>
    coe
      .replace(/\r\n/, '\n')
      .split('\n')
      .filter(v => v.trim())
      .slice(2)
      .map(x => x.replace(',', ''))
      .join('')
  const content = `03020000${toStream(programCoe)}${toStream(dataCoe)}`
  return content
}
