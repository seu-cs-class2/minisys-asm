import { expansionRules } from '../package/macro'

describe('macro.ts', () => {
  test('PUSH指令展开正确', () => {
    const rule = expansionRules['push']
    rule.pattern.test('PUSH $10')
    expect(rule.replacer()).toEqual(['addi $sp, $sp, -4', 'sw $10, 0($sp)'])
  })

  test('JG指令展开正确', () => {
    const rule = expansionRules['jg']
    rule.pattern.test('jg $2, $v2, 10')
    expect(rule.replacer()).toEqual([
      'addi $sp, $sp, -4',
      'sw $1, 0($sp)',
      `slt $1, $v2, $2`,
      `bne $1, $0, 10`,
      'lw $1, 0($sp)',
      'addi $sp, $sp, 4',
    ])
  })

  test('MOVE指令展开正确', () => {
    const rule = expansionRules['move']
    rule.pattern.test('move $v0, $2')
    expect(rule.replacer()).toEqual(['or $v0, $2, $zero'])
  })
})
