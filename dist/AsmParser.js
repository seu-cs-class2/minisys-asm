"use strict";
/**
 * Minisys汇编解析器
 * by z0gSh1u @ 2020-10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOneLine = void 0;
var Instruction_1 = require("./Instruction");
var Register_1 = require("./Register");
var utils_1 = require("./utils");
/**
 * 把字面量数字转换为二进制
 * @example 10
 * @example 0xabcd
 */
function literalToBin(literal, len, pad) {
    if (pad === void 0) { pad = '0'; }
    if (literal.startsWith('0x')) {
        return utils_1.hexToBin(literal).padStart(len, pad);
    }
    else {
        return utils_1.decToBin(parseInt(literal), len, pad);
    }
}
/**
 * 解析单行汇编到Instruction对象
 */
function parseOneLine(asm) {
    var asmSplit = asm.trim().replace(/,/g, ' ').split(/\s+/);
    // 处理助记符
    var symbol = asmSplit[0].toUpperCase();
    var instructionIndex = Instruction_1.MinisysInstructions.findIndex(function (x) { return x.symbol == symbol; });
    if (instructionIndex == -1) {
        throw new Error("\u6CA1\u6709\u627E\u5230\u6307\u4EE4\u52A9\u8BB0\u7B26\uFF1A" + symbol);
    }
    var res = Instruction_1.Instruction.newInstance(Instruction_1.MinisysInstructions[instructionIndex]);
    // 填充参数
    var params = asmSplit.slice(1);
    if (res.components.filter(function (v) { return !v.val.trim(); }).length != params.length) {
        throw new Error("\u6307\u4EE4\u53C2\u6570\u4E0E\u5E94\u6709\u7684\u53C2\u6570\u6570\u91CF\u4E0D\u5339\u914D\uFF1A" + symbol);
    }
    var i = 0;
    res.components.forEach(function (component) {
        switch (component.type) {
            case 'fixed':
                return;
            case 'reg':
                res.setComponent(component.desc, Register_1.regToBin(params[i]));
                break;
            case 'immed':
            case 'offset':
                res.setComponent(component.desc, literalToBin(params[i], 16));
                break;
            case 'shamt':
                res.setComponent(component.desc, literalToBin(params[i], 5));
                break;
            case 'addr':
                res.setComponent(component.desc, literalToBin(params[i], 26));
                break;
            case 'code':
                res.setComponent(component.desc, literalToBin(params[i], 20));
                break;
            case 'c0sel':
                res.setComponent(component.desc, literalToBin(params[i], 6));
                break;
            default:
                throw new Error('无效的指令组分类型。');
        }
        i++;
    });
    return res;
}
exports.parseOneLine = parseOneLine;
