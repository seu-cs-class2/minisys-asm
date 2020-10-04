/**
 * Minisys汇编解析器
 * by z0gSh1u @ 2020-10
 */

import { Instruction, MinisysInstructions } from './Instruction'
import { regToBin } from './Register'
import { decToBin, hexToBin } from './utils'

/**
 * 把字面量数字转换为二进制
 * @example 10
 * @example 0xabcd
 */
function literalToBin(literal: string, len: number, pad: '0' | '1' = '0') {
  if (literal.startsWith('0x')) {
    return hexToBin(literal).padStart(len, pad)
  } else {
    return decToBin(parseInt(literal), len, pad)
  }
}

/**
 * 解析单行汇编到Instruction对象
 */
export function parseOneLine(asm: string) {
  const asmSplit = asm.trim().replace(/,/g, ' ').split(/\s+/)
  // 处理助记符
  const symbol = asmSplit[0].toUpperCase()
  const instructionIndex = MinisysInstructions.findIndex(x => x.symbol == symbol)
  if (instructionIndex == -1) {
    throw new Error(`没有找到指令助记符：${symbol}`)
  }
  const res = Instruction.newInstance(MinisysInstructions[instructionIndex])
  // 填充参数
  const params = asmSplit.slice(1)
  if (res.components.filter(v => !v.val.trim()).length != params.length) {
    throw new Error(`指令参数与应有的参数数量不匹配：${symbol}`)
  }
  let i = 0
  res.components.forEach(component => {
    switch (component.type) {
      case 'fixed':
        return
      case 'reg':
        res.setComponent(component.desc, regToBin(params[i]))
        break
      case 'immed':
      case 'offset':
        res.setComponent(component.desc, literalToBin(params[i], 16))
        break
      case 'shamt':
        res.setComponent(component.desc, literalToBin(params[i], 5))
        break
      case 'addr':
        res.setComponent(component.desc, literalToBin(params[i], 26))
        break
      case 'code':
        res.setComponent(component.desc, literalToBin(params[i], 20))
        break
      case 'c0sel':
        res.setComponent(component.desc, literalToBin(params[i], 6))
        break
      default:
        throw new Error('无效的指令组分类型。')
    }
    i++
  })
  return res
}
