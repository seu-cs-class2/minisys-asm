# ====== minisys-bios.asm ======
addi	$s5,    $zero,  0xFFFFFC60  # s5存放设备基址,LED
addi	$s1,    $zero,  0x000000FF  # s1存放数据字
sb      $s1,    $s5,    0x00000000  # 红灯全亮
sb      $s1,    $s5,    0x00000002  # 黄灯全亮
sb      $s1,    $s5,    0x00000004  # 绿灯全亮

addi    $s5,    $zero,  0xFFFFFC00  # s5存放设备基址,7seg阴极数码管
addi    $s1,    $zero,  0x00000000
sb      $s1,    0($s5)              # 数码管全亮


addi	$s2,    $s2,    0x01312d00  # s2存放loop的循环次数
addi    $s2,    $s2,    0xFFFFFFFF  # s2--;
bne		$s2,    $zero,  0xFFFFFFFE  # (PC)->(PC)+4-(2<<2)

addi	$s5,    $zero,  0xFFFFFC60  # s5存放设备基址,LED
sb      $zero,  $s5,    0x00000000  # 红灯全灭
sb      $zero,  $s5,    0x00000002  # 黄灯全灭
sb      $zero,  $s5,    0x00000004  # 绿灯全灭

addi    $s5,    $zero,  0xFFFFFC00  # s5存放设备基址,7seg阴极数码管
addi    $s1,    $zero,  0xFFFFFFFF  
sb      $s1,    0($s5)              # 数码管全灭



addi    $s5,    $zero,  0xFFFFFC10  # s5存放设备基址,定时器


addi    $s5,    $zero,  0xFFFFFC30  # s5存放设备基址,PWM


addi    $s5,    $zero,  0xFFFFFC40  # s5存放设备基址,UART


addi    $s5,    $zero,  0xFFFFFC50  # s5存放设备基址,看门狗


addi    $s5,    $zero,  0xFFFFFC70  # s5存放设备基址,拨码开关


addi    $s5,    $zero,  0xFFFFFD10  # s5存放设备基址,蜂鸣器


addi    $s5,    $zero,  0xFFFFFD20  # s5存放设备基址,mic

jal main
nop
addi $v0, $zero, 0
syscall
# ====== minisys-bios.asm ======
