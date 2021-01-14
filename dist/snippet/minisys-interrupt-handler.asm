__int_handler_syscall:
  # handler of syscall
  # $v0 stores syscall type
__int_handler_syscall_0:
  # 0 means user application is finished
  bne $v0, $zero, __int_handler_default
  nop
  # just flash all leds
  addiu $t0, $zero, 0xFC60
__int_handler_syscall_0_label1:
  # light all up
  addiu $t1, $zero, 0xFFFF
  sw $t1, 0($t0)
  nop
  nop
  # delay 1s (prepare 6666666 D)
  lui	$t2, 101
	ori	$t2, $t2, 47530
__int_handler_syscall_0_label2:
  addiu $t2, $t2, -1
  bne $t2, $zero, __int_handler_syscall_0_label2
  nop
  # all down
  sw $zero, 0($t0)
  nop
  nop
  # delay 1s (prepare 6666666 D)
  lui	$t2, 101
	ori	$t2, $t2, 47530
__int_handler_syscall_0_label3:
  addiu $t2, $t2, -1
  bne $t2, $zero, __int_handler_syscall_0_label3
  nop
  j __int_handler_syscall_0_label1
  nop
__int_handler_default:
  nop
