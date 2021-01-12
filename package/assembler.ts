/**
 * Minisys汇编器 - 汇编代码解析
 * by Withod, z0gSh1u @ 2020-10
 */

import unraw from 'unraw'
import { Instruction, MinisysInstructions } from './instruction'
import { expansionRules } from './macro'
import { assert, getOffset, getOffsetAddr, serialString, sizeof } from './utils'

type HexAddr = string
// 仿照如下形式来添加新的变量类型
// prettier-ignore
const __VarCompType = {
  byte: void 0, half: void 0, word: void 0, ascii: void 0, space: void 0
}
export type VarCompType = keyof typeof __VarCompType
const VarCompTypeRegex = Object.keys(__VarCompType).join('|')

/**
 * 汇编程序，由数据段和代码段构成
 */
export interface AsmProgram {
  dataSeg: DataSeg
  textSeg: TextSeg
}

/**
 * 变量组分，由类型和值组成
 * @example `.word 10`
 */
interface DataSegVarComp {
  type: VarCompType // 组分类型
  val: string // 组分值
}

/**
 * 变量，由一系列组分构成
 * @example
 * `DataSegVar:
 *    buf: .word 10
 *         .byte 8, 10, 15`
 */
interface DataSegVar {
  name: string // 变量名
  comps: DataSegVarComp[] // 组成成分
  addr: number // 变量地址
}

/**
 * 数据段
 */
export class DataSeg {
  private _startAddr: HexAddr // 起始地址
  private _vars: DataSegVar[] // 变量

  get startAddr() {
    return this._startAddr
  }

  get vars() {
    return this._vars
  }

  constructor(startAddr: HexAddr, vars: DataSegVar[]) {
    this._startAddr = startAddr
    this._vars = Array.from(vars)
  }

  /**
   * 添加新变量
   */
  newVar(name: string, comps: DataSegVarComp[], addr: number) {
    assert(
      this._vars.every(v => v.name !== name),
      '重复的变量名。'
    )
    this._vars.push({
      name,
      comps,
      addr,
    })
  }

  /**
   * 添加新变量组分
   */
  newComp(name: string, comp: DataSegVarComp) {
    assert(
      this._vars.some(v => v.name === name),
      '找不到该变量。'
    )
    this._vars[this._vars.findIndex(v => v.name === name)].comps.push(comp)
  }
}

/**
 * 代码段标签
 */
interface TextSegLabel {
  name: string // 标签名
  lineno: number // 标签行号
  addr: number // 标签地址
}

/**
 * 代码段
 */
export class TextSeg {
  private _startAddr: string // 开始地址
  private _ins: Instruction[] // 指令
  private _labels: TextSegLabel[] // 标签

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

  /**
   * 代码段二进制输出
   */
  toBinary(): string {
    return this._ins.map(v => v.toBinary()).join('\n')
  }
}

// 分析过程辅助变量
let vars: DataSegVar[] = []
let labels: TextSegLabel[] = []
let pc = 0

/**
 * 获取变量地址
 */
export function getVarAddr(name: string) {
  const res = vars.find(v => v.name == name)
  assert(res, `未知的变量：${name}`)
  return res!.addr
}

/**
 * 获取标签地址
 */
export function getLabelAddr(label: string) {
  const res = labels.find(v => v.name == label)
  assert(res, `未知的标签：${label}`)
  return res!.addr
}

/**
 * 获取PC地址
 */
export function getPC() {
  return pc
}

/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
export function parseDataSeg(asm: string[]) {
  // 解析初始化值
  const parseInitValue = (type: VarCompType, init: string) => {
    assert(!(type !== 'ascii' && init.includes('"')), '字符串型数据只能使用.ascii类型')
    init = init.trim()
    assert(init[0] !== ',' && init[init.length - 1] !== ',', '数据初始化值头或尾有非法逗号')
    if (type !== 'ascii') {
      return init.split(/\s*,/).map(v => v.trim())
    } else {
      let inQuote = false,
        nextEscape = false,
        res = [],
        buf = '',
        prev = ''
      for (let i = 0; i < init.length; i++) {
        let ch = init.charAt(i)
        if (!inQuote && !ch.trim()) continue
        if (ch == '"') {
          if (nextEscape) {
            assert(inQuote, '有非法字符出现在引号以外')
            buf += '"'
            nextEscape = false
          } else {
            inQuote = !inQuote
          }
        } else if (ch == '\\') {
          assert(inQuote, '有非法字符出现在引号以外')
          if (nextEscape) {
            buf += '\\'
            nextEscape = false
          } else {
            nextEscape = true
          }
        } else if (ch == ',') {
          if (inQuote) {
            buf += ',' // 引号内逗号可不escape
            nextEscape = false
          } else {
            assert(prev !== ',', '数据初始化值存在连续的逗号分隔')
            res.push(buf)
            buf = ''
          }
        } else {
          assert(inQuote, '有非法字符出现在引号以外')
          if (nextEscape) {
            buf += unraw('\\' + ch)
          } else {
            buf += ch
          }
          nextEscape = false
        }
        prev = ch
      }
      res.push(buf)
      return res
    }
  }

  // 检查起始地址
  const startAddr = asm[0].split(/\s+/)[1] || '0'
  assert(asm[0].split(/\s+/).length <= 2, '数据段首声明非法')

  // 变量声明开始正则
  const VarStartPattern = new RegExp(String.raw`(.+):\s+\.(${VarCompTypeRegex})\s+(.+)`)
  // 变量声明继续正则
  const VarContdPattern = new RegExp(String.raw`\.(${VarCompTypeRegex})\s+(.+)`)

  let comps: DataSegVarComp[] = [],
    name: string | undefined
  let i = 1
  let addr = Number(startAddr),
    nextAddr = addr
  vars = []

  // 开始扫描
  while (i < asm.length) {
    if (VarStartPattern.test(asm[i])) {
      // 一个新变量开始
      if (name !== void 0) {
        vars.push({
          name,
          comps,
          addr,
        })
        comps = []
        name = void 0
        addr = nextAddr
      }
      name = RegExp.$1
      const type = RegExp.$2 as VarCompType
      const size = sizeof(type)
      // 边界对齐
      if (addr % size > 0) {
        nextAddr = addr = addr + size - (addr % size)
      }
      // 推入组分记录
      parseInitValue(type, RegExp.$3).forEach(val => {
        comps.push({
          type,
          val,
        })
        nextAddr += size * (type === 'ascii' ? val.length : 1)
      })
    } else if (VarContdPattern.test(asm[i])) {
      // 变量组分继续
      const type = RegExp.$1 as VarCompType
      const size = sizeof(type)
      // 边界对齐，自动补.space
      while (nextAddr % size > 0) {
        comps.push({
          type: 'space',
          val: '00',
        })
        nextAddr++
      }
      // 推入组分记录
      parseInitValue(type, RegExp.$2).forEach(val => {
        comps.push({
          type,
          val,
        })
        nextAddr += size * (type === 'ascii' ? val.length : 1)
      })
    } else {
      // 报错
      assert(false, `未知的变量定义形式，在数据段第 ${i + 1} 行`)
    }
    // 末尾处理
    if (i === asm.length - 1) {
      vars.push({
        name: name!,
        comps,
        addr,
      })
    }
    i++
  }

  return new DataSeg(startAddr, vars)
}

/**
 * 展开代码段宏指令
 */
export function expandMacros(asm_: string[], lineno_: number[]) {
  let asm = Array.from(asm_)
  let ruleIdx = -1
  const macros = Object.keys(expansionRules)
  let bias = 0
  asm_.forEach((v, i) => {
    const LabelPattern = /^(\w+:)\s*([\w\s$]+)$/
    let labelPreserve = ''
    if (v.match(LabelPattern)) {
      labelPreserve = RegExp.$1
      v = RegExp.$2.trim()
    }
    if ((ruleIdx = macros.findIndex(x => v.match(expansionRules[x].pattern))) !== -1) {
      let replacer = expansionRules[macros[ruleIdx]].replacer()
      replacer[0] = labelPreserve + ' ' + replacer[0]
      asm.splice(i + bias, 1, ...replacer)
      lineno_.splice(i + bias, 1, ...new Array(replacer.length).fill(lineno_[i + bias]))
      bias += replacer.length - 1
    }
  })
  return asm
}

/**
 * 解析代码段
 * @param asm .text起，到代码段结束
 */
export function parseTextSeg(asm_: string[], lineno: number[]) {
  // 先展开宏指令
  let asm = expandMacros(asm_, lineno)
  // 确定数据段起始地址
  let startAddr = asm[0].split(/\s+/)[1] || '0'
  assert(asm[0].split(/\s+/).length <= 2, '代码段首声明非法。')
  // 起始地址校正到4字节对齐（32位）
  const sizeofWord = sizeof('word')
  const startAddrNumber = Number(startAddr)
  startAddr = String(((sizeofWord - (startAddrNumber % sizeofWord)) % sizeofWord) + startAddrNumber)
  // pc指针
  pc = getOffsetAddr(startAddr, 0)
  labels = []
  // 去除label后指令实际行号
  let insLineno = 1

  // 先提取掉所有的label
  asm = asm.map((v, i) => {
    if (i === 0) return v
    if (/(\w+):\s*(.*)/.test(v)) {
      assert(
        labels.every(label => label.name !== RegExp.$1),
        `存在重复的label：${RegExp.$1}，在代码第${lineno[i]}行。`
      )
      labels.push({ name: RegExp.$1, lineno: insLineno, addr: getOffsetAddr(startAddr, getOffset({ ins: insLineno - 1 })) })
      if (RegExp.$2.trim()) insLineno++
      return RegExp.$2
    }
    insLineno++
    return v
  })
  lineno = lineno.filter((x, i) => asm[i].trim())
  asm = asm.filter(x => x.trim())

  const ins: Instruction[] = []
  asm.forEach((v, i) => {
    i !== 0 && ins.push(parseOneLine(v, lineno[i]))
  })

  return new TextSeg(startAddr, ins, labels)
}

/**
 * 解析单行汇编到Instruction对象
 */
export function parseOneLine(asm: string, lineno: number) {
  // 处理助记符
  assert(/^\s*(\w+)\s*(.*)/.test(asm), `没有找到指令助记符，在代码第 ${lineno} 行。`)
  const symbol = RegExp.$1
  // 检验助记符合法性
  const instructionIndex = MinisysInstructions.findIndex(x => x.symbol == symbol)
  assert(instructionIndex !== -1, `无效的指令助记符或错误的指令用法：${symbol}，在代码第 ${lineno} 行。`)
  // 单行汇编去空格
  asm = serialString(RegExp.$2)
  // pc移进
  pc += sizeof('ins')

  // 开始组装Instruction对象
  let res = Instruction.newInstance(MinisysInstructions[instructionIndex])
  assert(res.insPattern.test(asm), `代码段第 ${lineno} 行指令参数不匹配：${asm}`)
  res.components.forEach(component => {
    if (!component.val.trim() /* 代表是需要填充的变量，而不是指令二进制中的定值 */) {
      try {
        res.setComponent(component.desc, component.toBinary())
      } catch (err) {
        err.message += `，在代码第 ${lineno} 行`
        throw err
      }
    }
  })

  return res
}

/**
 * 汇编！
 * @param asm_ 汇编代码
 */
export function assemble(asm_: string) {
  // 格式化之：去掉空行；CRLF均变LF；均用单个空格分分隔；逗号后带空格，均小写。
  const asm__ = (asm_ + '\n')
    .replace(/\r\n/g, '\n')
    .replace(/#(.*)\n/g, '\n')
    .split('\n')
  const lineno = Array.from(new Array(asm__.length), (x, i) => i + 1)
    .filter(x => asm__[x - 1].trim())
  const asm = asm__
    .filter(x => x.trim())
    .map(x => x.trim().replace(/\s+/g, ' ').replace(/,\s*/, ', ').toLowerCase())

  // 挑出代码段和数据段
  const dataSegStartLine = asm.findIndex(v => v.match(/\.data/))
  const textSegStartLine = asm.findIndex(v => v.match(/\.text/))
  assert(dataSegStartLine !== -1, '未找到数据段开始')
  assert(textSegStartLine !== -1, '未找到代码段开始')
  assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后')

  // 解析数据段
  const dataSeg = parseDataSeg(asm.slice(dataSegStartLine, textSegStartLine))
  // 解析代码段
  const textSeg = parseTextSeg(asm.slice(textSegStartLine), lineno.slice(textSegStartLine))

  return {
    dataSeg,
    textSeg,
  } as AsmProgram
}
