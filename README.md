# *minisys*-asm - Minisys 汇编器 / 链接器

<p align="center">
  <img src="https://travis-ci.org/seu-cs-class2/minisys-asm.svg?branch=master"></img>
	<br><br>
  <img src="https://i.loli.net/2021/01/03/19RMlfgokruPy3Q.png"></img>
</p>

这是一个将 [Minisys](http://www.icourse163.org/course/SEU-1003566002) 汇编程序转换到 Minisys 体系机器码的汇编器，同时兼具链接功能。

## 使用

### 在线版

访问 http://zxuuu.tech/minisys/asm/ 。

使用 Travis CI 持续集成，master 分支将被自动部署到该地址。

### CLI

```bash
$ node dist/entry/node.js <in_file> <out_dir> [options]
```

可用的 options 包括：

| option | 功能                     |
| ------ | ------------------------ |
| -l     | 链接 BIOS 和中断处理程序 |

## 链接功能

minisys-asm 兼具链接功能，可以完成内存的布局、地址的重定位。

### 内存布局

Minisys 体系使用哈佛结构，指令 MEM 有 64 KB，按字节编址。因此，其地址范围为 0x00000000 ~ 0x0000FFFF。指令 MEM 布局如下：

| 地址                    | 作用                                                         |
| ----------------------- | ------------------------------------------------------------ |
| 0x00000000 ~ 0x00000499 | BIOS 区域。大小为 500 H = 1280 D Byte，最多存放 1280 / 4 = 320 条指令。 |
| 0x00000500 ~ 0x00005499 | 用户程序区域。大小为 5000 H = 20480 D Byte，最多存放 20480 / 4 =  5120 条指令。 |
| 0x00005500 ~ 0x0000EFFF | 空。                                                         |
| 0x0000F000 ~ 0x0000F499 | 中断处理程序入口。大小为 500 H = 1280 D Byte，最多存放 1280 / 4 = 320 条指令。 |
| 0x0000F500 ~ 0x0000FFFF | 中断处理程序。大小为 B00 H = 2816 D Byte，最多存放 2816 / 4 = 704 条指令。 |

### BIOS

[BIOS](./package/snippet/minisys-bios.asm) 负责初始化各部件，检测各部件能否正确运行，最后跳转到用户程序处。由于没有操作系统，故 BIOS 会被拼接到用户程序前。在调用完用户程序后，发中断，提示程序执行完成。

当前 BIOS 的主要检查特征是在数码管显示 “SEU09172”，即我们的班号。

```assembly
# ...
jal main
nop
addi $v0, $zero, 0 # 假设 0 号系统调用表示用户程序执行结束
syscall
```

### 中断处理程序

中断发生时，统一跳转到 [中断处理程序入口](./package/snippet/minisys-interrupt-entry.asm)（0x0000F000），在这里，判断中断类型，进行派发。
