.DATA 0x000004
buf:  .word 0x000000ff, 0x55005500
buf2: .byte 1
      .ascii "hello", "oh\"y,,e,\,r\n\0"
.TEXT 
start:  addi  $t0, $zero, 0
        lw    $v0, 20($t0)
        addi  $t0, $t0, 4
        lw    $v1, 20($t0)
        add   $v0, $v0, $v1
        addi  $t0, $t0, 4
        sw    $v0, 20($t0)
        push  $2
        pop   $2
        jg    $2, $3, 40
        jle   $2, $3, start
        j     start
