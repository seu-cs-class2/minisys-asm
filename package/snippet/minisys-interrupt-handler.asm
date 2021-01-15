_int_handler_syscall:
  # handler of syscall
  # just light last 4 leds
  addi $t0, $zero, 0x000F
  addi $t1, $zero, 0xFC60
  sw $t0, 0($t1)
  nop
  nop
  pop $t2
  pop $t1
  pop $t1
  eret
  nop
