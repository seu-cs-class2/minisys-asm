# ====== minisys-bios.asm ======
    lui $sp, 1 # init $sp
    # -----------------------------
    addi $s1,$zero,0xFFFF
    addi $s7,$zero,0xFC60   # LED基址
    sw	 $s1,0($s7)         # LED全亮
    # 数码管刷新SEU09172
    lui  $s5,8
    addi $s3,$zero,0xFC00   # 段码基址
    addi $s4,$zero,0xFC04   # 位码基址

    addi $s6,$zero,8 # off
_bios_label1:
    addi $s1,$zero,5        # S
    addi $s2,$zero,7 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,14       # E
    addi $s2,$zero,6 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,16       # U
    addi $s2,$zero,5 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,0        # 0
    addi $s2,$zero,4 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,9        # 9
    addi $s2,$zero,3 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,1        # 1
    addi $s2,$zero,2 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,7        # 7
    addi $s2,$zero,1 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s1,$zero,2        # 2
    addi $s2,$zero,0 # loc
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    nop
    nop
    sw   $s6,0($s4)
    nop
    addi $s5,$s5,-1             # 刷一遍计数-1
    beq  $s5,$zero,_bios_label3
    nop
    j    _bios_label1
    nop
_bios_label3:
    sw   $zero,0($s7)           # 关LED 
    sw   $s6,0($s4)             # 关数码管 
    # -----------------------------
    jal main
    nop
    # close 7seg
    addi $s4,$zero,0xFC04   # 位码基址
    addi $s6,$zero,8 # off
    sw   $s6,0($s4)         # 关数码管 
    syscall
# ====== minisys-bios.asm ======
