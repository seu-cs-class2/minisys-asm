/**
 * Minisys宏指令
 * by Withod, z0gSh1u @ 2020-10
 */

interface MacroExpansionRule {
  pattern: RegExp
  replacer: () => string[]
}

export const expansionRules: { [key: string]: MacroExpansionRule } = {
  push: {
    pattern: /^push\s+(\$\w{1,2})$/i,
    replacer: () => ['addi $sp, $sp, -4', `sw ${RegExp.$1}, 0($sp)`],
  },
  pop: {
    pattern: /^pop\s+(\$\w{1,2})$/i,
    replacer: () => [`lw ${RegExp.$1}, 0($sp)`, 'addi $sp, $sp, 4'],
  },
  // 根据“MiniSys-1A CPU 的寄存器及其约定”，$1（$at）固定用作汇编器的暂时变量
  jg: {
    pattern: /^jg\s+(\$\w{1,2}),\s+(\$\w{1,2}),\s+(\w+)$/i,
    replacer: () => [
      'addi $sp, $sp, -4',
      'sw $1, 0($sp)',
      `slt $1, ${RegExp.$2}, ${RegExp.$1}`,
      `bne $1, $0, ${RegExp.$3}`,
      'lw $1, 0($sp)',
      'addi $sp, $sp, 4',
    ],
  },
  jge: {
    pattern: /^jge\s+(\$\w{1,2}),\s+(\$\w{1,2}),\s+(\w+)$/i,
    replacer: () => [
      'addi $sp, $sp, -4',
      'sw $1, 0($sp)',
      `slt $1, ${RegExp.$1}, ${RegExp.$2}`,
      `beq $1, $0, ${RegExp.$3}`,
      'lw $1, 0($sp)',
      'addi $sp, $sp, 4',
    ],
  },
  jl: {
    pattern: /^jl\s+(\$\w{1,2}),\s+(\$\w{1,2}),\s+(\w+)$/i,
    replacer: () => [
      'addi $sp, $sp, -4',
      'sw $1, 0($sp)',
      `slt $1, ${RegExp.$1}, ${RegExp.$2}`,
      `bne $1, $0, ${RegExp.$3}`,
      'lw $1, 0($sp)',
      'addi $sp, $sp, 4',
    ],
  },
  jle: {
    pattern: /^jle\s+(\$\w{1,2}),\s+(\$\w{1,2}),\s+(\w+)$/i,
    replacer: () => [
      'addi $sp, $sp, -4',
      'sw $1, 0($sp)',
      `slt $1, ${RegExp.$2}, ${RegExp.$1}`,
      `beq $1, $0, ${RegExp.$3}`,
      'lw $1, 0($sp)',
      'addi $sp, $sp, 4',
    ],
  },
}
