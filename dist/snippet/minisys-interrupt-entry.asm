# ===== minisys-interrupt-handler-entry.asm =====
    push $t0
    push $t1
    push $t2
    mfc0 $t0, $13, 0        # $t0 <- CP0 Cause
    andi $t1, $t0, 0x007C   # keep only ExcCode[4:0] at Cause 2-6
    addi $t2, $zero, 0x0020 # Cause 2-6 of syscall is 01000
    beq $t1, $t2, _int_handler_syscall
    nop
# ===== minisys-interrupt-handler-entry.asm =====
