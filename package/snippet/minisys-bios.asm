# ====== minisys-bios.asm ======
    lui $sp, 1 # init $sp
    # -----------------------------
    addi $s1,$zero,0xFFFF
    addi $s7,$zero,0xFC60   # LED基址
    sw	 $s1,0($s7)         # LED全亮
    lui  $s5,8   # 数码管刷新0.5s的8
    addi $s1,$zero,8
    addi $s2,$zero,0
    addi $s3,$zero,0xFC00   # 段码基址
    addi $s4,$zero,0xFC04   # 位码基址
    addi $s6,$zero,8
_bios_label1:
    sw   $s1,0($s3)
    sw   $s2,0($s4)
    addi $s2,$s2,1
    beq  $s2,$s6,_bios_label2   # 位码逢8归0
    nop
    j    _bios_label1
    nop
_bios_label2:
    addi $s2,$zero,0
    addi $s5,$s5,-1             # 刷一遍计数-1
    beq  $s5,$zero,_bios_label3
    nop
    j    _bios_label1
    nop
_bios_label3:
    sw   $zero,0($s7)           # 关LED
    # -----------------------------
    jal main
    nop
    addi $v0, $zero, 0
    syscall
# ====== minisys-bios.asm ======
