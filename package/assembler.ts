/**
 * Minisys汇编解析器
 * by z0gSh1u @ 2020-10
 */

import { Instruction, MinisysInstructions } from './instruction'
import { regToBin } from './register'
import { assert, decToBin, getOffset, getOffsetAddr, hexToBin } from './utils'

type HexAddr = string
type VarCompType = 'byte' | 'half' | 'word' | 'ascii' | 'space'

interface AsmProgram {
  dataSeg: DataSeg
  textSeg: TextSeg
}

/**
 * DataSeg:
 *    .data 0x0000
 *    buf: .word 10
 *    ...
 * DataSegVar:
 *    buf: .word 10
 *         .byte 8, 10, 15
 * DataSegVarComp:
 *         .word 10
 *         .byte 8
 *         .byte 10
 *         ...
 */

interface DataSegVarComp {
  type: VarCompType
  val: string
}

interface DataSegVar {
  name: string
  comps: DataSegVarComp[]
}

export class DataSeg {
  private _startAddr: HexAddr
  private _vars: DataSegVar[]

  get startAddr(): HexAddr {
    return this._startAddr
  }

  get vars(): DataSegVar[] {
    return this._vars
  }

  constructor(startAddr: HexAddr, vars: DataSegVar[]) {
    this._startAddr = startAddr
    this._vars = Array.from(vars)
  }

  newVar(name: string, comps: DataSegVarComp[]) {
    assert(
      this._vars.every(v => v.name !== name),
      '重复的变量名。'
    )
    this._vars.push({
      name,
      comps: [...comps],
    })
  }

  newComp(name: string, comp: DataSegVarComp) {
    assert(
      this._vars.some(v => v.name === name),
      '找不到该变量。'
    )
    this._vars[this._vars.findIndex(v => v.name === name)].comps.push(comp)
  }
}

/**
 * TextSeg:
 *    .text 0x0000
 *    addi $v0, $0, 10
 *    ...
 * TextSegIns:
 *    start: addi $v0, $0, 10
 *    ^^^^^label
 */

interface TextSegLabel {
  name: string
  lineno: number
  addr: number
}

export class TextSeg {
  private _startAddr: string
  private _ins: Instruction[]
  private _labels: TextSegLabel[]

  get startAddr() {
    return this._startAddr
  }

  get ins() {
    return this._ins
  }

  get labels() {
    return this._labels
  }

  constructor(startAddr: string, ins: Instruction[], labels: TextSegLabel[]) {
    this._startAddr = startAddr
    this._ins = Array.from(ins)
    this._labels = Array.from(labels)
  }

  toBinary() {
    let res = ''
    this._ins.forEach(ins => {
      res += ins.toBinary() + '\n'
    })
    return res
  }
}

/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
function parseDataSeg(asm: string[]) {
  // 解析初始化值
  const parseInitValue = (init: string) => init.split(/\s*,/).map(v => v.trim())

  const startAddr = asm[0].split(/\s+/)[1] || "0"
  assert(asm[0].split(/\s+/).length <= 2, '数据段首声明非法。')

  const VarStartPattern = /(.+):\s+\.(word|byte|half|ascii|space)\s+(.+)/
  const VarContdPattern = /\.(word|byte|half|ascii|space)\s+(.+)/
  let vars: DataSegVar[] = [],
    comps: DataSegVarComp[] = [],
    name
  let i = 1

  do {
    if (VarStartPattern.test(asm[i])) {
      // 一个新变量开始
      if (name !== void 0) {
        vars.push({
          name,
          comps,
        })
        comps = []
        name = void 0
      }
      name = RegExp.$1
      const type = RegExp.$2 as VarCompType
      parseInitValue(RegExp.$3).forEach(val => {
        comps.push({
          type,
          val,
        })
      })
    } else if (VarContdPattern.test(asm[i])) {
      // 变量组分继续
      const type = RegExp.$1 as VarCompType
      parseInitValue(RegExp.$2).forEach(val => {
        comps.push({
          type,
          val,
        })
      })
    } else {
      assert(false, `未知的变量定义形式，数据段行号: ${i + 1}`)
    }
    if (i === asm.length - 1) {
      vars.push({
        name: name as string,
        comps,
      })
    }
    i++
  } while (i < asm.length)

  return new DataSeg(startAddr, vars)
}

/**
 * 解析代码段
 * @param asm .text起，到代码段结束
 */
function parseTextSeg(asm_: string[]) {
  let asm = Array.from(asm_)
  const startAddr = asm[0].split(/\s+/)[1] || "0"
  assert(asm[0].split(/\s+/).length <= 2, '代码段首声明非法。')

  // 先提取掉所有的label
  let labels: TextSegLabel[] = []
  asm = asm.map((v, i) => {
    if (i === 0) return v
    if (/(.+):\s*(.+)/.test(v)) {
      assert(
        labels.every(label => label.name !== RegExp.$1),
        `存在重复的label: ${RegExp.$1}`
      )
      // FIXME: 地址4字节对齐？
      // FIXME: 地址计算不正确
      labels.push({ name: RegExp.$1, lineno: i, addr: getOffsetAddr(startAddr, getOffset({ instruction: i - 1 })) })
      return RegExp.$2
    }
    return v
  })

  let ins: Instruction[] = []
  asm.forEach((v, i) => {
    i !== 0 && ins.push(parseOneLine(v, labels, i))
  })

  return new TextSeg(startAddr, ins, labels)
}

/**
 * 汇编！
 * @param asm_ 汇编代码
 */
export function assemble(asm_: string) {
  // 格式化之。去掉空行；CRLF均变LF；均用单个空格分分隔；逗号后带空格
  const asm = asm_
    .replace(/\r\n/g, '\n')
    .replace(/:\s*\n/g, ': ')
    .split('\n')
    .filter(x => x.trim())
    .map(x => x.trim().replace(/\s+/g, ' ').replace(/,\s*/, ', ').toLowerCase())

  const dataSegStartLine = asm.findIndex(v => v.match(/\.data/))
  const textSegStartLine = asm.findIndex(v => v.match(/\.text/))
  assert(dataSegStartLine !== -1, '未找到数据段开始。')
  assert(textSegStartLine !== -1, '未找到代码段开始。')
  assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后。')

  // 解析数据段
  const dataSeg = parseDataSeg(asm.slice(dataSegStartLine, textSegStartLine))
  // 解析代码段
  const textSeg = parseTextSeg(asm.slice(textSegStartLine))

  return {
    dataSeg,
    textSeg,
  } as AsmProgram
}

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
export function parseOneLine(asm: string, labels: TextSegLabel[], lineno: number) {
  const asmSplit = asm.trim().replace(/,/g, ' ').split(/\s+/)
  assert(
    asmSplit.every(v => v.length),
    `存在空参数，在第 ${lineno} 行。`
  )

  // 处理助记符
  const symbol = asmSplit[0]
  const instructionIndex = MinisysInstructions.findIndex(x => x.symbol == symbol)
  assert(instructionIndex !== -1, `没有找到指令助记符：${symbol}，在第 ${lineno} 行。`)

  let res = Instruction.newInstance(MinisysInstructions[instructionIndex])
  // 填充参数
  let params = asmSplit.slice(1)
  params = params.map(v => {
    // 是label
    if (labels.some(x => x.name === v)) {
      return String(labels.find(x => x.name === v)!.addr)
    }
    if (v.match(/^[A-Za-z][A-Za-z0-9]*$/)) {
      assert(false, `没道理的参数: ${v}，在第 ${lineno} 行。`)
    }
    return v
  })

  // 处理比较特别的load/store指令
  const LoadStoreIns = ['lb', 'lbu', 'lh', 'lhu', 'sb', 'sh', 'lw', 'sw']
  if (LoadStoreIns.includes(symbol)) {
    let tmp = params.pop() as string
    // **example**: lb $1, 10($2)
    if (new RegExp(/(.+)\((.+)\)/).test(tmp)) {
      params.push(RegExp.$2, RegExp.$1)
    } else {
      throw new Error(`指令参数与应有的参数不匹配：${symbol}`)
    }
  }
  // 普通情况
  assert(
    res.components.filter(v => v.type !== 'fixed').length === params.length,
    `指令参数与应有的参数不匹配：${symbol}`
  )
  let i = 0
  res.components.forEach(component => {
    let arg
    switch (component.type) {
      case 'fixed':
        return
      case 'reg':
        arg = regToBin(params[i])
        break
      case 'immed':
        arg = literalToBin(params[i], 16)
        break
      case 'offset':
        // @ts-ignore
        if (LoadStoreIns.includes(symbol) && isNaN(params[i])) {
          // TODO:
          throw new Error('暂不支持带变量名的 load/store 指令。')
        }
        arg = literalToBin(params[i], 16)
        break
      case 'shamt':
        arg = literalToBin(params[i], 5)
        break
      case 'addr':
        arg = literalToBin(params[i], 26)
        break
      case 'code':
        arg = literalToBin(params[i], 20)
        break
      case 'c0sel':
        arg = literalToBin(params[i], 6)
        break
      default:
        throw new Error('无效的指令组分类型。')
    }

    res.setComponent(component.desc, arg)
    i++
  })

  return res
}
