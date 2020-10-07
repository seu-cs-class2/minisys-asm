import fs from 'fs'
import { assemble } from './assembler'

const asm = `
.DATA 0x100000
buf: .WORD 0x000000ff, 0x55005500
buf2: .byte 1
      .ascii "hello"
.TEXT 0x123456
start:  addi  $t0, $zero, 0
        lw    $v0, 20($t0)
        addi  $t0, $t0, 4
        lw    $v1, 20($t0)
        add   $v0, $v0, $v1
        addi  $t0, $t0, 4
        sw    $v0, 20($t0)
        j     start
`

const res = assemble(asm)
fs.writeFileSync('./res.json', JSON.stringify(res, null, 2))
