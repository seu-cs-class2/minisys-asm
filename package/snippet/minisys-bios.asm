# ====== minisys-bios.asm ======
addi $s1,$zero,0x00FFFFFF
addi $s7,$zero,0xFFFFFC60   # LED基址
sw	 $s7,0($s1)             # LED全亮
nop
nop
addi $s5,$zero,100000       # 数码管刷新0.5s的8
addi $s1,$zero,8
addi $s2,$zero,0
addi $s3,$zero,0xFFFFFC00   # 段码基址
addi $s4,$zero,0xFFFFFC04   # 位码基址
addi $s6,$zero,4
sw   $s3,0($s1)
nop
nop
sw   $s4,0($s2)
nop
nop
addi $s2,$s2,1
bne  $s2,$s6,-32            # 位码逢4归0
addi $s2,$zero,0
addi $s5,$s5,-1             # 刷一遍计数-1
bne  $s5,$zero,-44
sw   $s7,0($zero)           # 关LED
nop
nop
jal main
nop
addi $v0, $zero, 0
syscall
# ====== minisys-bios.asm ======
