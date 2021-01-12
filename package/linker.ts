/**
 * Minisys汇编器 - 链接
 * by z0gSh1u @ 2021-01
 */

import { expandMacros } from './assembler'
import { assert } from './utils'

/**
 * 计算asm_中有多少条指令（考虑了宏指令展开）
 */
export function countIns(asm_: string) {
  let asm = (asm_ + '\n')
    .replace(/\r\n/g, '\n') // 格式化换行
    .replace(/#(.*)\n/g, '\n') // 消灭注释
    .split('\n')
    .map(v => v.trim())
    .filter(v => v.trim())
  // 展开宏指令
  asm = expandMacros(
    asm,
    Array.from(Array(asm.length), (_, i) => i)
  )
  let insCount = 0
  for (let line of asm) {
    if (line.match(/^(\w+):\s*$/)) continue
    // 纯label行
    else insCount += 1
  }
  return insCount
}

/**
 * 链接所有部分，返回链接后的64KB全内存汇编
 */
export function linkAll(biosASM: string, userASM: string, intEntryASM: string, intHandlerASM: string) {
  // BIOS 0x00000000 ~ 0x00000499
  const biosASMInsCount = countIns(biosASM)
  assert(biosASMInsCount <= 320, 'BIOS 程序段过长。')
  const biosNopPadding = 320 - biosASMInsCount

  // User App 0x00000500 ~ 0x00005499
  let userASM_ = (userASM + '\n')
    .replace(/\r\n/g, '\n')
    .replace(/#(.*)\n/g, '\n')
    .split('\n')
  const textSegStartLine = userASM_.findIndex(v => v.match(/\.text/))
  assert(textSegStartLine !== -1, '未找到代码段开始。')
  userASM_ = userASM_.slice(textSegStartLine + 1)
  userASM = userASM_.join('\n')
  const userASMInsCount = countIns(userASM)
  assert(userASMInsCount <= 5120, '用户程序段过长。')
  const userNopPadding = 5120 - userASMInsCount

  // Empty 0x00005500 ~ 0x0000EFFF
  const middleEmptyNopPadding = 39680 / 4

  // Interrupt Handler Entry 0x0000F000 ~ 0x0000F499
  const intEntryASMInsCount = countIns(intEntryASM)
  assert(intEntryASMInsCount <= 320, '中断处理程序入口过长。')
  const intEntryNopPadding = 320 - intEntryASMInsCount

  // Interrupt Handler 0x0000F500 ~ 0x0000FFFF
  const intHandlerASMInsCount = countIns(intHandlerASM)
  assert(intHandlerASMInsCount <= 704, '中断处理程序过长。')
  const intHandlerNopPadding = 704 - intHandlerASMInsCount

  const totalLength =
    biosASMInsCount +
    biosNopPadding +
    userASMInsCount +
    userNopPadding +
    middleEmptyNopPadding +
    intEntryASMInsCount +
    intEntryNopPadding +
    intHandlerASMInsCount +
    intHandlerNopPadding // instructions
  assert(totalLength * 4 == 0x0000ffff + 1, `IMEM 布局总长度不正确：有 ${totalLength * 4} Bytes.`)

  let allProgram = ''
  // BIOS
  allProgram += '# ====== BIOS START ======\n'
  allProgram += `# BIOS Length = ${biosASMInsCount}\n`
  allProgram += biosASM + '\n'
  allProgram += `# BIOS Padding = ${biosNopPadding}\n`
  allProgram += 'nop\n'.repeat(biosNopPadding)
  allProgram += '# ====== BIOS END ======\n'

  // User Application
  allProgram += '# ====== User Application START ======\n'
  allProgram += `# User Application Length = ${userASMInsCount}\n`
  allProgram += userASM + '\n'
  allProgram += `# User Application Padding = ${userNopPadding}\n`
  allProgram += 'nop\n'.repeat(userNopPadding)
  allProgram += '# ====== User Application END ======\n'

  // Interrupt Entry
  allProgram += '# ====== Interrupt Entry START ======\n'
  allProgram += `# Interrupt Entry Length = ${intEntryASMInsCount}\n`
  allProgram += intEntryASM + '\n'
  allProgram += `# Interrupt Entry Padding = ${intEntryNopPadding}\n`
  allProgram += 'nop\n'.repeat(intEntryNopPadding)
  allProgram += '# ====== Interrupt Entry END ======\n'

  // Interrupt Handler
  allProgram += '# ====== Interrupt Handler START ======\n'
  allProgram += `# Interrupt Entry Length = ${intHandlerASMInsCount}\n`
  allProgram += intHandlerASM + '\n'
  allProgram += `# Interrupt Entry Padding = ${intHandlerNopPadding}\n`
  allProgram += 'nop\n'.repeat(intHandlerNopPadding)
  allProgram += '# ====== Interrupt Handler END ======\n'

  return allProgram
}
