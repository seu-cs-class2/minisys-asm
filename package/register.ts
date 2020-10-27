/**
 * Minisys寄存器定义
 * by z0gSh1u @ 2020-10
 */

import { decToBin } from './utils'

// prettier-ignore
const registerNames = [
  'zero', 'at',
  'v0', 'v1',
  'a0', 'a1', 'a2', 'a3',
  't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
  's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
  'k0', 'k1',
  'gp', 'sp', 'fp',
  'ra',
]

/**
 * 返回寄存器对应的二进制号（5位）
 * @example reg: $1 1 sp $sp
 */
export function regToBin(reg: string) {
  reg = reg.replace('$', '').trim()
  let regNumber
  if (reg.split('').every(x => { return '0123456789'.includes(x) })) {
    regNumber = Number(reg)
  } else {
    regNumber = registerNames.indexOf(reg)
  }
  if (regNumber > 31 || regNumber < 0) {
    throw new Error(`无效的寄存器: ${reg}`)
  }
  return decToBin(regNumber, 5)
}
