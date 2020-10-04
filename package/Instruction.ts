/**
 * Minisys指令定义
 * by z0gSh1u @ 2020-10
 */

import { binToHex } from './utils'

/**
 * fixed: 固定值；reg: 寄存器（5位）；immed: 立即数（16位）；
 * c0sel：C0指令（5位）；offset: 偏移（16位）；addr: 地址（26位）；
 * shamt: 5位；code：20位
 */
type InstructionComponentType = 'fixed' | 'reg' | 'immed' | 'c0sel' | 'offset' | 'addr' | 'shamt' | 'code'

// 指令组分
export interface InstructionComponent {
  // bit范围定义，lBit > rBit，0~31，闭区间
  lBit: number
  rBit: number
  // 参数描述
  desc: string
  // 参数类型
  type: InstructionComponentType
  // 参数值，为空串表示可变，否则表示固定或已填写
  val: string
}

// 指令类
export class Instruction {
  private _symbol: string // 指令名称（助记符）
  private _desc: string // 指令描述
  private _pseudo: string // 指令伪代码
  private _components: InstructionComponent[] // 指令组分

  static newInstance(baseOn: Instruction) {
    return new Instruction(baseOn.symbol, baseOn.desc, baseOn.pseudo, [...baseOn.components])
  }

  get symbol(): string {
    return this._symbol
  }

  set symbol(symbol: string) {
    this._symbol = symbol
  }

  get desc(): string {
    return this._desc
  }

  set desc(desc: string) {
    this._desc = desc
  }

  get pseudo(): string {
    return this._pseudo
  }

  set pseudo(pseudo: string) {
    this._pseudo = pseudo
  }

  get components(): InstructionComponent[] {
    return this._components
  }

  set components(components: InstructionComponent[]) {
    this._components = components
  }

  constructor(symbol: string, desc: string, pseudo: string, components: InstructionComponent[]) {
    this._symbol = symbol
    this._desc = desc
    this._pseudo = pseudo
    this._components = Array.from(components)
  }

  setComponent(desc: string, val: string) {
    const index = this._components.findIndex(v => v.desc == desc)
    if (index === -1) throw new Error(`未知的指令组分: ${desc}`)
    this._components[index].val = val
  }

  toBinary() {
    if (this._components.some(v => !v.val.trim())) {
      throw new Error('尝试将不完整的指令转为2或16进制。')
    }
    return this._components.map(v => v.val).join('')
  }

  toHex(zeroX = true) {
    return binToHex(this.toBinary(), zeroX)
  }
}

// MIPS32指令集
export const MinisysInstructions: Instruction[] = (function () {
  const _MinisysInstructions: Instruction[] = []

  // 新增指令
  function newInstruction(
    symbol: string,
    desc: string,
    pseudo: string,
    components: [number, number, string, InstructionComponentType, string][]
  ) {
    _MinisysInstructions.push(
      new Instruction(
        symbol,
        desc,
        pseudo,
        components.map(x => ({
          lBit: x[0],
          rBit: x[1],
          desc: x[2],
          type: x[3],
          val: x[4],
        })) as InstructionComponent[]
      )
    )
  }

  // =================== R型指令 ===================

  newInstruction('ADD', '按字加法', '(rd)←(rs)+(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100000'],
  ])

  newInstruction('ADDU', '无符号加', '(rd)←(rs)+(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100001'],
  ])

  newInstruction('SUB', '按字减法', '(rd)←(rs)-(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100010'],
  ])

  newInstruction('SUBU', '无符号减', '(rd)←(rs)-(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100011'],
  ])

  newInstruction('AND', '按位与', '(rd)←(rs)&(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100100'],
  ])

  newInstruction('MULT', '按字乘法', '(HI,LO)←(rs)*(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 6, 'rd+shamt', 'fixed', '0000000000'],
    [5, 0, 'func', 'fixed', '011000'],
  ])

  newInstruction('MULTU', '无符号乘', '(HI,LO)←(rs)*(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 6, 'rd+shamt', 'fixed', '0000000000'],
    [5, 0, 'func', 'fixed', '011001'],
  ])

  newInstruction('DIV', '除法', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 6, 'rd+shamt', 'fixed', '0000000000'],
    [5, 0, 'func', 'fixed', '011010'],
  ])

  newInstruction('DIVU', '无符号除', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 6, 'rd+shamt', 'fixed', '0000000000'],
    [5, 0, 'func', 'fixed', '011011'],
  ])

  newInstruction('MFHI', '取HI', '(rd)←(HI)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 16, 'rs+rt', 'fixed', '0000000000'],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '010000'],
  ])

  newInstruction('MFLO', '取LO', '(rd)←(LO)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 16, 'rs+rt', 'fixed', '0000000000'],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '010010'],
  ])

  newInstruction('MTHI', '存HI', '(HI)←(rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
    [5, 0, 'func', 'fixed', '010001'],
  ])

  newInstruction('MTLO', '存LO', '(LO)←(rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
    [5, 0, 'func', 'fixed', '010011'],
  ])

  // 注意MFC0和MTC0的特殊性
  newInstruction('MFC0', '取C0', '(rt)=由(rd)和sel确定的C0寄存器的值', [
    [31, 26, 'op', 'fixed', '010000'],
    [25, 21, 'rs', 'fixed', '00000'],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'c0sel', ''],
  ])

  newInstruction('MTC0', '存C0', '由(rd)和sel确定的C0寄存器的值=(rt)', [
    [31, 26, 'op', 'fixed', '010000'],
    [25, 21, 'rs', 'fixed', '00100'],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'c0sel', ''],
  ])

  newInstruction('OR', '按位或', '(rd)←(rs)|(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100101'],
  ])

  newInstruction('XOR', '按位异或', '(rd)←(rs)^(rt)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100110'],
  ])

  newInstruction('NOR', '按位或非', '(rd)←~((rs)|(rt))', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '100111'],
  ])

  newInstruction('SLT', '有符号比较', 'if (rs<rt) rd=1 else rd=0', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '101010'],
  ])

  newInstruction('SLTU', '无符号比较', 'if (rs<rt) rd=1 else rd=0', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '101011'],
  ])

  newInstruction('SLL', '逻辑左移', '(rd)←(rt)<<shamt', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'fixed', '00000'],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'shamt', ''],
    [5, 0, 'func', 'fixed', '000000'],
  ])

  newInstruction('SRL', '逻辑右移', '(rd)←(rt)>>_L shamt', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'fixed', '00000'],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'shamt', ''],
    [5, 0, 'func', 'fixed', '000010'],
  ])

  newInstruction('SRA', '算术右移', '(rd)←(rt)>>_A shamt', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'fixed', '00000'],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'shamt', ''],
    [5, 0, 'func', 'fixed', '000011'],
  ])

  newInstruction('SLLV', '逻辑左移V', '(rd)←(rt)<<(rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '000100'],
  ])

  newInstruction('SRLV', '逻辑右移V', '(rd)←(rt)>>_L (rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '000110'],
  ])

  newInstruction('SRAV', '算术右移V', '(rd)←(rt)>>_L (rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '000111'],
  ])

  newInstruction('JR', '无条件跳转（寄存器）', '(PC)←(rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
    [5, 0, 'func', 'fixed', '001000'],
  ])

  newInstruction('JALR', '暂存下条后跳转（寄存器）', '(rd)=(PC)+4,(PC)←(rs)', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'fixed', '00000'],
    [15, 11, 'rd', 'reg', ''],
    [10, 6, 'shamt', 'fixed', '00000'],
    [5, 0, 'func', 'fixed', '001001'],
  ])

  newInstruction('BREAK', '断点异常', '断点异常', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 6, 'code', 'code', ''],
    [5, 0, 'func', 'fixed', '001101'],
  ])

  newInstruction('SYSCALL', '系统调用', '系统调用', [
    [31, 26, 'op', 'fixed', '000000'],
    [25, 6, 'code', 'code', ''],
    [5, 0, 'func', 'fixed', '001100'],
  ])

  newInstruction('ERET', '从中断或者异常中返回', '从中断或者异常中返回', [
    [31, 26, 'op', 'fixed', '010000'],
    [25, 6, 'rs+rt+rd+shamt', 'fixed', '10000000000000000000'],
    [5, 0, 'func', 'fixed', '011000'],
  ])

  // =================== I型指令 ===================

  newInstruction('ADDI', '加立即数', '(rt)←(rs)+(sign-extend)immediate', [
    [31, 26, 'op', 'fixed', '001000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('ADDIU', '无符号加立即数', '(rt)←(rs)+(sign-extend)immediate', [
    [31, 26, 'op', 'fixed', '001001'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('ANDI', '按位与立即数', '(rt)←(rs)&(zero-extend)immediate', [
    [31, 26, 'op', 'fixed', '001100'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('ORI', '按位或立即数', '(rt)←(rs)|(zero-extend)immediate', [
    [31, 26, 'op', 'fixed', '001101'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('XORI', '按位异或立即数', '(rt)←(rs)^(zero-extend)immediate', [
    [31, 26, 'op', 'fixed', '001110'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('LUI', '取立即数高16位', '(rt)←immediate<<16 & 0FFFF0000H', [
    [31, 26, 'op', 'fixed', '001111'],
    [25, 21, 'rs', 'fixed', '00000'],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('LB', '取字节', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', [
    [31, 26, 'op', 'fixed', '100000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('LBU', '取无符号字节', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', [
    [31, 26, 'op', 'fixed', '100100'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('LH', '取半字', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', [
    [31, 26, 'op', 'fixed', '100001'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('LHU', '取无符号半字', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', [
    [31, 26, 'op', 'fixed', '100101'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('SB', '存字节', 'Memory[(rs)+(sign_extend)offset]←(rt)7..0', [
    [31, 26, 'op', 'fixed', '101000'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('SH', '存半字', 'Memory[(rs)+(sign_extend)offset]←(rt)15..0', [
    [31, 26, 'op', 'fixed', '101001'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('LW', '取字', '(rt)←Memory[(rs)+(sign_extend)offset]', [
    [31, 26, 'op', 'fixed', '100011'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('SW', '存字', 'Memory[(rs)+(sign_extend)offset]←(rt)', [
    [31, 26, 'op', 'fixed', '101011'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BEQ', '相等分支', 'if ((rt)=(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
    [31, 26, 'op', 'fixed', '000100'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BNE', '不等分支', 'if ((rt)≠(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
    [31, 26, 'op', 'fixed', '000101'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BGEZ', '大于等于0分支', 'if ((rs)≥0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
    [31, 26, 'op', 'fixed', '000001'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', '00001'],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BGTZ', '大于0分支', 'if ((rs)＞0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
    [31, 26, 'op', 'fixed', '000111'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', '00000'],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BLEZ', '小于等于0分支', 'if ((rs)≤0) then (PC)←(PC)+4+((Sign-Extend) offset<<2)', [
    [31, 26, 'op', 'fixed', '000110'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', '00000'],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction('BLTZ', '小于0分支', 'if ((rs)＜0) then (PC)←(PC)+4+((Sign-Extend) offset<<2)', [
    [31, 26, 'op', 'fixed', '000001'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', '00000'],
    [15, 0, 'offset', 'offset', ''],
  ])

  newInstruction(
    'BGEZAL',
    '大于等于0分支（Link）',
    'if ((rs)≥0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)',
    [
      [31, 26, 'op', 'fixed', '000001'],
      [25, 21, 'rs', 'reg', ''],
      [20, 16, 'rt', 'reg', '10001'],
      [15, 0, 'offset', 'offset', ''],
    ]
  )

  newInstruction(
    'BLTZAL',
    '小于0分支（Link）',
    'if ((rs)＜0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)',
    [
      [31, 26, 'op', 'fixed', '000001'],
      [25, 21, 'rs', 'reg', ''],
      [20, 16, 'rt', 'reg', '10000'],
      [15, 0, 'offset', 'offset', ''],
    ]
  )

  newInstruction('SLTI', '小于立即数时Set', 'if ((rs)<(Sign-Extend)immediate) then (rt)←1; else (rt)←0', [
    [31, 26, 'op', 'fixed', '001010'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  newInstruction('SLTIU', '小于立即数时Set（无符号）', 'if ((rs)<(Zero-Extend)immediate) then (rt)←1; else (rt)←0', [
    [31, 26, 'op', 'fixed', '001011'],
    [25, 21, 'rs', 'reg', ''],
    [20, 16, 'rt', 'reg', ''],
    [15, 0, 'immediate', 'immed', ''],
  ])

  // =================== J型指令 ===================

  newInstruction('J', '无条件跳转', '(PC)←((Zero-Extend)address<<2)', [
    [31, 26, 'op', 'fixed', '000010'],
    [25, 0, 'target', 'addr', ''],
  ])

  newInstruction('JAL', '暂存下条后跳转（立即数）', '($31)←(PC)+4; (PC)←((Zero-Extend)address<<2),', [
    [31, 26, 'op', 'fixed', '000011'],
    [25, 0, 'target', 'addr', ''],
  ])

  // =================== NOP指令 ===================
  newInstruction('NOP', '空转指令', 'do nothing', [[31, 0, 'NOP', 'fixed', '0'.repeat(32)]])

  return _MinisysInstructions
})()
