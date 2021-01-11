/**
 * Minisys寄存器定义
 * by Withod, z0gSh1u @ 2020-10
 */

import { assert, decToBin } from './utils'

// prettier-ignore
const registerNames = [
  'zero', 'at',
  'v0', 'v1',
  'a0', 'a1', 'a2', 'a3',
  't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
  's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
  't8', 't9',
  'k0', 'k1',
  'gp', 'sp', 'fp',
  'ra',
]

/**
 * 返回寄存器对应的五位二进制号
 * @example $1 1 sp $sp
 * @warn 请勿在本函数内覆盖RegExp.$x
 */
export function regToBin(reg: string) {
  reg = reg.replace('$', '').trim()
  let regNumber
  if (reg.split('').every(x => '0123456789'.includes(x))) {
    regNumber = Number(reg)
  } else {
    regNumber = registerNames.indexOf(reg)
  }
  assert(regNumber >= 0 && regNumber <= 31, `无效的寄存器: ${reg}`)
  return decToBin(regNumber, 5)
}
