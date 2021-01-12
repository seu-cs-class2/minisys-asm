"use strict";
/**
 * Minisys汇编器 - 链接
 * by z0gSh1u @ 2021-01
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkAll = exports.countIns = void 0;
var assembler_1 = require("./assembler");
var utils_1 = require("./utils");
/**
 * 计算asm_中有多少条指令（考虑了宏指令展开）
 */
function countIns(asm_) {
    var asm = (asm_ + '\n')
        .replace(/\r\n/g, '\n') // 格式化换行
        .replace(/#(.*)\n/g, '\n') // 消灭注释
        .split('\n')
        .map(function (v) { return v.trim(); })
        .filter(function (v) { return v.trim(); });
    // 展开宏指令
    asm = assembler_1.expandMacros(asm, Array.from(Array(asm.length), function (_, i) { return i; }));
    var insCount = 0;
    for (var _i = 0, asm_1 = asm; _i < asm_1.length; _i++) {
        var line = asm_1[_i];
        if (line.match(/^(\w+):\s*$/))
            continue;
        // 纯label行
        else
            insCount += 1;
    }
    return insCount;
}
exports.countIns = countIns;
/**
 * 链接所有部分，返回链接后的64KB全内存汇编
 */
function linkAll(biosASM, userASM, intEntryASM, intHandlerASM) {
    // BIOS 0x00000000 ~ 0x00000499
    var biosASMInsCount = countIns(biosASM);
    utils_1.assert(biosASMInsCount <= 320, 'BIOS 程序段过长。');
    var biosNopPadding = 320 - biosASMInsCount;
    // User App 0x00000500 ~ 0x00005499
    var userASM_ = (userASM + '\n')
        .replace(/\r\n/g, '\n')
        .replace(/#(.*)\n/g, '\n')
        .split('\n');
    var textSegStartLine = userASM_.findIndex(function (v) { return v.match(/\.text/); });
    utils_1.assert(textSegStartLine !== -1, '未找到代码段开始。');
    userASM_ = userASM_.slice(textSegStartLine + 1);
    userASM = userASM_.join('\n');
    var userASMInsCount = countIns(userASM);
    utils_1.assert(userASMInsCount <= 5120, '用户程序段过长。');
    var userNopPadding = 5120 - userASMInsCount;
    // Empty 0x00005500 ~ 0x0000EFFF
    var middleEmptyNopPadding = 39680 / 4;
    // Interrupt Handler Entry 0x0000F000 ~ 0x0000F499
    var intEntryASMInsCount = countIns(intEntryASM);
    utils_1.assert(intEntryASMInsCount <= 320, '中断处理程序入口过长。');
    var intEntryNopPadding = 320 - intEntryASMInsCount;
    // Interrupt Handler 0x0000F500 ~ 0x0000FFFF
    var intHandlerASMInsCount = countIns(intHandlerASM);
    utils_1.assert(intHandlerASMInsCount <= 704, '中断处理程序过长。');
    var intHandlerNopPadding = 704 - intHandlerASMInsCount;
    var totalLength = biosASMInsCount +
        biosNopPadding +
        userASMInsCount +
        userNopPadding +
        middleEmptyNopPadding +
        intEntryASMInsCount +
        intEntryNopPadding +
        intHandlerASMInsCount +
        intHandlerNopPadding; // instructions
    utils_1.assert(totalLength * 4 == 0x0000ffff + 1, "IMEM \u5E03\u5C40\u603B\u957F\u5EA6\u4E0D\u6B63\u786E\uFF1A\u6709 " + totalLength * 4 + " Bytes.");
    var allProgram = '';
    // BIOS
    allProgram += '# ====== BIOS START ======\n';
    allProgram += "# BIOS Length = " + biosASMInsCount + "\n";
    allProgram += biosASM + '\n';
    allProgram += "# BIOS Padding = " + biosNopPadding + "\n";
    allProgram += 'nop\n'.repeat(biosNopPadding);
    allProgram += '# ====== BIOS END ======\n';
    // User Application
    allProgram += '# ====== User Application START ======\n';
    allProgram += "# User Application Length = " + userASMInsCount + "\n";
    allProgram += userASM + '\n';
    allProgram += "# User Application Padding = " + userNopPadding + "\n";
    allProgram += 'nop\n'.repeat(userNopPadding);
    allProgram += '# ====== User Application END ======\n';
    // Interrupt Entry
    allProgram += '# ====== Interrupt Entry START ======\n';
    allProgram += "# Interrupt Entry Length = " + intEntryASMInsCount + "\n";
    allProgram += intEntryASM + '\n';
    allProgram += "# Interrupt Entry Padding = " + intEntryNopPadding + "\n";
    allProgram += 'nop\n'.repeat(intEntryNopPadding);
    allProgram += '# ====== Interrupt Entry END ======\n';
    // Interrupt Handler
    allProgram += '# ====== Interrupt Handler START ======\n';
    allProgram += "# Interrupt Entry Length = " + intHandlerASMInsCount + "\n";
    allProgram += intHandlerASM + '\n';
    allProgram += "# Interrupt Entry Padding = " + intHandlerNopPadding + "\n";
    allProgram += 'nop\n'.repeat(intHandlerNopPadding);
    allProgram += '# ====== Interrupt Handler END ======\n';
    return allProgram;
}
exports.linkAll = linkAll;
