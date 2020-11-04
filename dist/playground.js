"use strict";
/**
 * 仅调试用
 */
Object.defineProperty(exports, "__esModule", { value: true });
var assembler_1 = require("./assembler");
var asm = "\n.DATA 0x100000\nbuf: .WORD 0x000000ff, 0x55005500\nbuf2: .byte 1\n      .ascii \"hello\"\n.TEXT 0x123456\nstart:  addi  $t0, $zero, 0\n        lw    $v0, 20($t0)\n        addi  $t0, $t0, 4\n        lw    $v1, 20($t0)\n        add   $v0, $v0, $v1\n        addi  $t0, $t0, 4\n        sw    $v0, 20($t0)\n        j     start\n";
var res = assembler_1.assemble(asm);
console.log(res);
// fs.writeFileSync('./res.json', JSON.stringify(res, null, 2))
//# sourceMappingURL=playground.js.map