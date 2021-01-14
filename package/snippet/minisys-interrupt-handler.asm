_int_handler_syscall:
  # handler of syscall
  # $v0 stores syscall type
  # just light all leds
  push $t0
  push $t1
  addi $t0, $zero, 0xFFFF
  addi $t1, $zero, 0xFC60
  sw $t0, 0($t1)
  nop
  nop
  pop $t1
  pop $t0
  eret
