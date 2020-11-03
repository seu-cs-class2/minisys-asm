/**
 * Minisys汇编解析器
 * by z0gSh1u @ 2020-10
 */

import { maxHeaderSize } from 'http'
import { Instruction, MinisysInstructions } from './instruction'
import { assert, getOffset, getOffsetAddr, serialString, sizeof } from './utils'

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
  addr: number
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

  newVar(name: string, comps: DataSegVarComp[], addr: number) {
    assert(
      this._vars.every(v => v.name !== name),
      '重复的变量名。'
    )
    this._vars.push({
      name,
      comps: [...comps],
      addr,
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

let vars: DataSegVar[] = []

export function getVarAddr(name: string) {
  let res = vars.find(v => { return v.name == name })
  if (res === undefined) {
    throw new Error(`未知的变量：${name}`)
  } else {
    return res.addr
  }
}

/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
function parseDataSeg(asm: string[]) {
  // 解析初始化值
  const parseInitValue = (init: string) => init.split(/\s*,/).map(v => v.trim())

  const startAddr = asm[0].split(/\s+/)[1] || '0'
  assert(asm[0].split(/\s+/).length <= 2, '数据段首声明非法。')

  const VarStartPattern = /(.+):\s+\.(word|byte|half|ascii|space)\s+(.+)/
  const VarContdPattern = /\.(word|byte|half|ascii|space)\s+(.+)/
  let comps: DataSegVarComp[] = [],
    name
  let i = 1
  let addr = 0,
    nextAddr = 0
  vars = []

  do {
    if (VarStartPattern.test(asm[i])) {
      // 一个新变量开始
      if (name !== void 0) {
        vars.push({
          name: name,
          comps: comps,
          addr: getOffsetAddr(startAddr, addr)
        })
        comps = []
        name = void 0
        addr = nextAddr
      }
      name = RegExp.$1
      const type = RegExp.$2 as VarCompType
      const size = sizeof(type as string)
      if (addr % size > 0) {
        nextAddr = addr = addr + size - addr % size
      }
      parseInitValue(RegExp.$3).forEach(val => {
        comps.push({
          type,
          val,
        })
        nextAddr += size
      })
    } else if (VarContdPattern.test(asm[i])) {
      // 变量组分继续
      const type = RegExp.$1 as VarCompType
      const size = sizeof(type as string)
      if (nextAddr % size > 0) {
        nextAddr = nextAddr + size - nextAddr % size
      }
      parseInitValue(RegExp.$2).forEach(val => {
        comps.push({
          type,
          val,
        })
        nextAddr += size
      })
    } else {
      assert(false, `未知的变量定义形式，数据段行号: ${i + 1}`)
    }
    if (i === asm.length - 1) {
      vars.push({
        name: name as string,
        comps: comps,
        addr: getOffsetAddr(startAddr, addr),
      })
    }
    i++
  } while (i < asm.length)

  return new DataSeg(startAddr, vars)
}

let labels: TextSegLabel[] = []

export function getLabelAddr(label: string) {
  let res = labels.find(l => { return l.name == label })
  if (res === undefined) {
    throw new Error(`未知的label：${label}`)
  } else {
    return res.addr
  }
}

/**
 * 解析代码段
 * @param asm .text起，到代码段结束
 */
function parseTextSeg(asm_: string[]) {
  let asm = Array.from(asm_)
  const startAddr = asm[0].split(/\s+/)[1] || '0'
  assert(asm[0].split(/\s+/).length <= 2, '代码段首声明非法。')

  // 先提取掉所有的label
  labels = []
  pc = getOffsetAddr(startAddr, 0)
  asm = asm.map((v, i) => {
    if (i === 0) return v
    if (/(\w+):\s*(.+)/.test(v)) {
      assert(
        labels.every(label => label.name !== RegExp.$1),
        `存在重复的label: ${RegExp.$1}`
      )
      // FIXME: 地址4字节对齐？
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
    .replace(/#(.*)\n/g, '\n')
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

let pc = 0

export function getPC() {
  return pc
}

/**
 * 解析单行汇编到Instruction对象
 */
export function parseOneLine(asm: string, labels: TextSegLabel[], lineno: number) {
  // 处理助记符
  assert(/^\s*(\w+)\s+(.*)/.test(asm), `没有找到指令助记符，在第 ${lineno} 行。`)
  const symbol = RegExp.$1
  asm = serialString(RegExp.$2)
  pc += sizeof('ins')
  const instructionIndex = MinisysInstructions.findIndex(x => x.symbol == symbol)
  assert(instructionIndex !== -1, `没有找到指令助记符：${symbol}，在第 ${lineno} 行。`)

  let res = Instruction.newInstance(MinisysInstructions[instructionIndex])

  assert(res.insPattern.test(asm), `第 ${lineno} 行指令参数不匹配：${asm}`)
  res.components.forEach(component => {
    if (!component.val.trim()) {
      try {
        res.setComponent(component.desc, component.toBin())
      } catch (err) {
        throw new Error(err.message + `，在第 ${lineno}行`)
      }
    }
  })

  return res
}
