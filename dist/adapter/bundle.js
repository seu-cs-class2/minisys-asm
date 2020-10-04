(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./Instruction":2,"./Register":3,"./utils":5}],2:[function(require,module,exports){
"use strict";
/**
 * Minisys指令定义
 * by z0gSh1u @ 2020-10
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinisysInstructions = exports.Instruction = void 0;
var utils_1 = require("./utils");
// 指令类
var Instruction = /** @class */ (function () {
    function Instruction(symbol, desc, pseudo, components) {
        this._symbol = symbol;
        this._desc = desc;
        this._pseudo = pseudo;
        this._components = Array.from(components);
    }
    Instruction.newInstance = function (baseOn) {
        return new Instruction(baseOn.symbol, baseOn.desc, baseOn.pseudo, __spreadArrays(baseOn.components));
    };
    Object.defineProperty(Instruction.prototype, "symbol", {
        get: function () {
            return this._symbol;
        },
        set: function (symbol) {
            this._symbol = symbol;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "desc", {
        get: function () {
            return this._desc;
        },
        set: function (desc) {
            this._desc = desc;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "pseudo", {
        get: function () {
            return this._pseudo;
        },
        set: function (pseudo) {
            this._pseudo = pseudo;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "components", {
        get: function () {
            return this._components;
        },
        set: function (components) {
            this._components = components;
        },
        enumerable: false,
        configurable: true
    });
    Instruction.prototype.setComponent = function (desc, val) {
        var index = this._components.findIndex(function (v) { return v.desc == desc; });
        if (index === -1)
            throw new Error("\u672A\u77E5\u7684\u6307\u4EE4\u7EC4\u5206: " + desc);
        this._components[index].val = val;
    };
    Instruction.prototype.toBinary = function () {
        if (this._components.some(function (v) { return !v.val.trim(); })) {
            throw new Error('尝试将不完整的指令转为2或16进制。');
        }
        return this._components.map(function (v) { return v.val; }).join('');
    };
    Instruction.prototype.toHex = function (zeroX) {
        if (zeroX === void 0) { zeroX = true; }
        return utils_1.binToHex(this.toBinary(), zeroX);
    };
    return Instruction;
}());
exports.Instruction = Instruction;
// MIPS32指令集
exports.MinisysInstructions = (function () {
    var _MinisysInstructions = [];
    // 新增指令
    function newInstruction(symbol, desc, pseudo, components) {
        _MinisysInstructions.push(new Instruction(symbol, desc, pseudo, components.map(function (x) { return ({
            lBit: x[0],
            rBit: x[1],
            desc: x[2],
            type: x[3],
            val: x[4],
        }); })));
    }
    // =================== R型指令 ===================
    newInstruction('ADD', '按字加法', '(rd)←(rs)+(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100000'],
    ]);
    newInstruction('ADDU', '无符号加', '(rd)←(rs)+(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100001'],
    ]);
    newInstruction('SUB', '按字减法', '(rd)←(rs)-(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100010'],
    ]);
    newInstruction('SUBU', '无符号减', '(rd)←(rs)-(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100011'],
    ]);
    newInstruction('AND', '按位与', '(rd)←(rs)&(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100100'],
    ]);
    newInstruction('MULT', '按字乘法', '(HI,LO)←(rs)*(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 6, 'rd+shamt', 'fixed', '0000000000'],
        [5, 0, 'func', 'fixed', '011000'],
    ]);
    newInstruction('MULTU', '无符号乘', '(HI,LO)←(rs)*(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 6, 'rd+shamt', 'fixed', '0000000000'],
        [5, 0, 'func', 'fixed', '011001'],
    ]);
    newInstruction('DIV', '除法', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 6, 'rd+shamt', 'fixed', '0000000000'],
        [5, 0, 'func', 'fixed', '011010'],
    ]);
    newInstruction('DIVU', '无符号除', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 6, 'rd+shamt', 'fixed', '0000000000'],
        [5, 0, 'func', 'fixed', '011011'],
    ]);
    newInstruction('MFHI', '取HI', '(rd)←(HI)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 16, 'rs+rt', 'fixed', '0000000000'],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '010000'],
    ]);
    newInstruction('MFLO', '取LO', '(rd)←(LO)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 16, 'rs+rt', 'fixed', '0000000000'],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '010010'],
    ]);
    newInstruction('MTHI', '存HI', '(HI)←(rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
        [5, 0, 'func', 'fixed', '010001'],
    ]);
    newInstruction('MTLO', '存LO', '(LO)←(rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
        [5, 0, 'func', 'fixed', '010011'],
    ]);
    // 注意MFC0和MTC0的特殊性
    newInstruction('MFC0', '取C0', '(rt)=由(rd)和sel确定的C0寄存器的值', [
        [31, 26, 'op', 'fixed', '010000'],
        [25, 21, 'rs', 'fixed', '00000'],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'c0sel', ''],
    ]);
    newInstruction('MTC0', '存C0', '由(rd)和sel确定的C0寄存器的值=(rt)', [
        [31, 26, 'op', 'fixed', '010000'],
        [25, 21, 'rs', 'fixed', '00100'],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'c0sel', ''],
    ]);
    newInstruction('OR', '按位或', '(rd)←(rs)|(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100101'],
    ]);
    newInstruction('XOR', '按位异或', '(rd)←(rs)^(rt)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100110'],
    ]);
    newInstruction('NOR', '按位或非', '(rd)←~((rs)|(rt))', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '100111'],
    ]);
    newInstruction('SLT', '有符号比较', 'if (rs<rt) rd=1 else rd=0', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '101010'],
    ]);
    newInstruction('SLTU', '无符号比较', 'if (rs<rt) rd=1 else rd=0', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '101011'],
    ]);
    newInstruction('SLL', '逻辑左移', '(rd)←(rt)<<shamt', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'fixed', '00000'],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'shamt', ''],
        [5, 0, 'func', 'fixed', '000000'],
    ]);
    newInstruction('SRL', '逻辑右移', '(rd)←(rt)>>_L shamt', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'fixed', '00000'],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'shamt', ''],
        [5, 0, 'func', 'fixed', '000010'],
    ]);
    newInstruction('SRA', '算术右移', '(rd)←(rt)>>_A shamt', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'fixed', '00000'],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'shamt', ''],
        [5, 0, 'func', 'fixed', '000011'],
    ]);
    newInstruction('SLLV', '逻辑左移V', '(rd)←(rt)<<(rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '000100'],
    ]);
    newInstruction('SRLV', '逻辑右移V', '(rd)←(rt)>>_L (rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '000110'],
    ]);
    newInstruction('SRAV', '算术右移V', '(rd)←(rt)>>_L (rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '000111'],
    ]);
    newInstruction('JR', '无条件跳转（寄存器）', '(PC)←(rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 6, 'rt+rd+shamt', 'fixed', '000000000000000'],
        [5, 0, 'func', 'fixed', '001000'],
    ]);
    newInstruction('JALR', '暂存下条后跳转（寄存器）', '(rd)=(PC)+4,(PC)←(rs)', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'fixed', '00000'],
        [15, 11, 'rd', 'reg', ''],
        [10, 6, 'shamt', 'fixed', '00000'],
        [5, 0, 'func', 'fixed', '001001'],
    ]);
    newInstruction('BREAK', '断点异常', '断点异常', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 6, 'code', 'code', ''],
        [5, 0, 'func', 'fixed', '001101'],
    ]);
    newInstruction('SYSCALL', '系统调用', '系统调用', [
        [31, 26, 'op', 'fixed', '000000'],
        [25, 6, 'code', 'code', ''],
        [5, 0, 'func', 'fixed', '001100'],
    ]);
    newInstruction('ERET', '从中断或者异常中返回', '从中断或者异常中返回', [
        [31, 26, 'op', 'fixed', '010000'],
        [25, 6, 'rs+rt+rd+shamt', 'fixed', '10000000000000000000'],
        [5, 0, 'func', 'fixed', '011000'],
    ]);
    // =================== I型指令 ===================
    newInstruction('ADDI', '加立即数', '(rt)←(rs)+(sign-extend)immediate', [
        [31, 26, 'op', 'fixed', '001000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('ADDIU', '无符号加立即数', '(rt)←(rs)+(sign-extend)immediate', [
        [31, 26, 'op', 'fixed', '001001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('ANDI', '按位与立即数', '(rt)←(rs)&(zero-extend)immediate', [
        [31, 26, 'op', 'fixed', '001100'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('ORI', '按位或立即数', '(rt)←(rs)|(zero-extend)immediate', [
        [31, 26, 'op', 'fixed', '001101'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('XORI', '按位异或立即数', '(rt)←(rs)^(zero-extend)immediate', [
        [31, 26, 'op', 'fixed', '001110'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('LUI', '取立即数高16位', '(rt)←immediate<<16 & 0FFFF0000H', [
        [31, 26, 'op', 'fixed', '001111'],
        [25, 21, 'rs', 'fixed', '00000'],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('LB', '取字节', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', [
        [31, 26, 'op', 'fixed', '100000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('LBU', '取无符号字节', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', [
        [31, 26, 'op', 'fixed', '100100'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('LH', '取半字', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', [
        [31, 26, 'op', 'fixed', '100001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('LHU', '取无符号半字', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', [
        [31, 26, 'op', 'fixed', '100101'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('SB', '存字节', 'Memory[(rs)+(sign_extend)offset]←(rt)7..0', [
        [31, 26, 'op', 'fixed', '101000'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('SH', '存半字', 'Memory[(rs)+(sign_extend)offset]←(rt)15..0', [
        [31, 26, 'op', 'fixed', '101001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('LW', '取字', '(rt)←Memory[(rs)+(sign_extend)offset]', [
        [31, 26, 'op', 'fixed', '100011'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('SW', '存字', 'Memory[(rs)+(sign_extend)offset]←(rt)', [
        [31, 26, 'op', 'fixed', '101011'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BEQ', '相等分支', 'if ((rt)=(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
        [31, 26, 'op', 'fixed', '000100'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BNE', '不等分支', 'if ((rt)≠(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
        [31, 26, 'op', 'fixed', '000101'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BGEZ', '大于等于0分支', 'if ((rs)≥0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
        [31, 26, 'op', 'fixed', '000001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '00001'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BGTZ', '大于0分支', 'if ((rs)＞0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', [
        [31, 26, 'op', 'fixed', '000111'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '00000'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BLEZ', '小于等于0分支', 'if ((rs)≤0) then (PC)←(PC)+4+((Sign-Extend) offset<<2)', [
        [31, 26, 'op', 'fixed', '000110'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '00000'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BLTZ', '小于0分支', 'if ((rs)＜0) then (PC)←(PC)+4+((Sign-Extend) offset<<2)', [
        [31, 26, 'op', 'fixed', '000001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '00000'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BGEZAL', '大于等于0分支（Link）', 'if ((rs)≥0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)', [
        [31, 26, 'op', 'fixed', '000001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '10001'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('BLTZAL', '小于0分支（Link）', 'if ((rs)＜0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)', [
        [31, 26, 'op', 'fixed', '000001'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', '10000'],
        [15, 0, 'offset', 'offset', ''],
    ]);
    newInstruction('SLTI', '小于立即数时Set', 'if ((rs)<(Sign-Extend)immediate) then (rt)←1; else (rt)←0', [
        [31, 26, 'op', 'fixed', '001010'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    newInstruction('SLTIU', '小于立即数时Set（无符号）', 'if ((rs)<(Zero-Extend)immediate) then (rt)←1; else (rt)←0', [
        [31, 26, 'op', 'fixed', '001011'],
        [25, 21, 'rs', 'reg', ''],
        [20, 16, 'rt', 'reg', ''],
        [15, 0, 'immediate', 'immed', ''],
    ]);
    // =================== J型指令 ===================
    newInstruction('J', '无条件跳转', '(PC)←((Zero-Extend)address<<2)', [
        [31, 26, 'op', 'fixed', '000010'],
        [25, 0, 'target', 'addr', ''],
    ]);
    newInstruction('JAL', '暂存下条后跳转（立即数）', '($31)←(PC)+4; (PC)←((Zero-Extend)address<<2),', [
        [31, 26, 'op', 'fixed', '000011'],
        [25, 0, 'target', 'addr', ''],
    ]);
    // =================== NOP指令 ===================
    newInstruction('NOP', '空转指令', 'do nothing', [[31, 0, 'NOP', 'fixed', '0'.repeat(32)]]);
    return _MinisysInstructions;
})();

},{"./utils":5}],3:[function(require,module,exports){
"use strict";
/**
 * Minisys寄存器定义
 * by z0gSh1u @ 2020-10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.regToBin = void 0;
var utils_1 = require("./utils");
// prettier-ignore
var registerNames = [
    'zero', 'at',
    'v0', 'v1',
    'a0', 'a1', 'a2', 'a3',
    't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
    's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
    'k0', 'k1',
    'gp', 'sp', 'fp',
    'ra',
];
/**
 * 返回寄存器对应的二进制号（5位）
 * @example reg: $1 1 sp $sp
 */
function regToBin(reg) {
    reg = reg.replace('$', '').trim();
    var regNumber;
    if (reg.match(/^\d+$/)) {
        regNumber = Number(reg);
    }
    else {
        regNumber = registerNames.indexOf(reg);
    }
    if (regNumber > 31 || regNumber < 0) {
        throw new Error("\u65E0\u6548\u7684\u5BC4\u5B58\u5668: " + reg);
    }
    return utils_1.decToBin(regNumber, 5);
}
exports.regToBin = regToBin;

},{"./utils":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AsmParser_1 = require("../AsmParser");
console.log(AsmParser_1.parseOneLine('add $t1, $t2, $v1'));

},{"../AsmParser":1}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialString = exports.hexToBin = exports.decToHex = exports.binToHex = exports.decToBin = void 0;
/**
 * 将十进制数转为二进制，用pad补齐到len位
 */
function decToBin(dec, len, pad) {
    if (pad === void 0) { pad = '0'; }
    return Number(dec).toString(2).padStart(len, pad);
}
exports.decToBin = decToBin;
/**
 * 将4n位二进制转为n位十六进制
 */
function binToHex(bin, zeroX) {
    if (zeroX === void 0) { zeroX = true; }
    if (bin.length % 4 !== 0) {
        throw new Error('二进制位数不为4的倍数。');
    }
    return (['', '0x'][Number(zeroX)] +
        bin
            .match(/\d{4}/g) // [1000, 1000]
            .map(function (v) { return '0123456789abcdef'.charAt(parseInt(v, 2)); })
            .join(''));
}
exports.binToHex = binToHex;
/**
 * 将十进制数转为十六进制，十进制数会先被转换为4n位二进制
 */
function decToHex(dec, len, zeroX) {
    if (zeroX === void 0) { zeroX = true; }
    return binToHex(decToBin(dec, len, '0'), zeroX);
}
exports.decToHex = decToHex;
/**
 * 将十六进制每位转换为4位二进制，参数带不带0x头都可以
 */
function hexToBin(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.substr(2);
    }
    var table = Array(16)
        .fill('')
        .map(function (_, i) { return decToBin(i, 4, '0'); });
    var res = '';
    hex.split('').forEach(function (v) {
        res += table['0123456789abcdef'.indexOf(v)];
    });
    return res;
}
exports.hexToBin = hexToBin;
/**
 * 去除一串字符串中的全部空格
 */
function serialString(bin) {
    return bin.replace(/\s+/g, '');
}
exports.serialString = serialString;

},{}]},{},[4]);
