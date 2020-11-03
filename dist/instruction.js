"use strict";
/**
 * Minisys指令定义
 * by z0gSh1u @ 2020-10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinisysInstructions = exports.Instruction = void 0;
var register_1 = require("./register");
var utils_1 = require("./utils");
var nop = function () { };
// 指令类
var Instruction = /** @class */ (function () {
    function Instruction(symbol, desc, pseudo, insPattern, components) {
        this._symbol = symbol;
        this._desc = desc;
        this._pseudo = pseudo;
        this._insPattern = insPattern;
        this._components = components.concat().map(function (x) { return ({
            lBit: x.lBit,
            rBit: x.rBit,
            desc: x.desc,
            toBin: x.toBin,
            type: x.type,
            val: x.val,
        }); });
    }
    Instruction.newInstance = function (baseOn) {
        return new Instruction(baseOn.symbol, baseOn.desc, baseOn.pseudo, baseOn.insPattern, baseOn.components);
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
    Object.defineProperty(Instruction.prototype, "insPattern", {
        get: function () {
            return this._insPattern;
        },
        set: function (insPattern) {
            this._insPattern = insPattern;
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
        utils_1.assert(index !== -1, "\u672A\u77E5\u7684\u6307\u4EE4\u7EC4\u5206: " + desc);
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
// Minisys指令集
exports.MinisysInstructions = (function () {
    var _MinisysInstructions = [];
    // 新增指令
    function newInstruction(symbol, desc, pseudo, insPattern, components) {
        _MinisysInstructions.push(new Instruction(symbol, desc, pseudo, insPattern, components.map(function (x) { return ({
            lBit: x[0],
            rBit: x[1],
            desc: x[2],
            toBin: x[3],
            type: x[4],
            val: x[5],
        }); })));
    }
    /**
     * 获取指令正则模式
     * @param params 汇编指令的参数个数
     */
    function paramPattern(num) {
        if (num < 1) {
            return /^$/;
        }
        else {
            return new RegExp('^' + '([\\w$-]+),'.repeat(num - 1) + '([\\w$-]+)$');
        }
    }
    // =================== R型指令 ===================
    newInstruction('add', '按字加法', '(rd)←(rs)+(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100000'],
    ]);
    newInstruction('addu', '无符号加', '(rd)←(rs)+(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100001'],
    ]);
    newInstruction('sub', '按字减法', '(rd)←(rs)-(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100010'],
    ]);
    newInstruction('subu', '无符号减', '(rd)←(rs)-(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100011'],
    ]);
    newInstruction('and', '按位与', '(rd)←(rs)&(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100100'],
    ]);
    newInstruction('mult', '按字乘法', '(HI,LO)←(rs)*(rt)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 6, 'rd+shamt', nop, 'fixed', '0000000000'],
        [5, 0, 'func', nop, 'fixed', '011000'],
    ]);
    newInstruction('multu', '无符号乘', '(HI,LO)←(rs)*(rt)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 6, 'rd+shamt', nop, 'fixed', '0000000000'],
        [5, 0, 'func', nop, 'fixed', '011001'],
    ]);
    newInstruction('div', '除法', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 6, 'rd+shamt', nop, 'fixed', '0000000000'],
        [5, 0, 'func', nop, 'fixed', '011010'],
    ]);
    newInstruction('divu', '无符号除', '(HI)←(rs)%(rt), (LO)←(rs)/(rt)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 6, 'rd+shamt', nop, 'fixed', '0000000000'],
        [5, 0, 'func', nop, 'fixed', '011011'],
    ]);
    newInstruction('mfhi', '取HI', '(rd)←(HI)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 16, 'rs+rt', nop, 'fixed', '0000000000'],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '010000'],
    ]);
    newInstruction('mflo', '取LO', '(rd)←(LO)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 16, 'rs+rt', nop, 'fixed', '0000000000'],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '010010'],
    ]);
    newInstruction('mthi', '存HI', '(HI)←(rs)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 6, 'rt+rd+shamt', nop, 'fixed', '000000000000000'],
        [5, 0, 'func', nop, 'fixed', '010001'],
    ]);
    newInstruction('mtlo', '存LO', '(LO)←(rs)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 6, 'rt+rd+shamt', nop, 'fixed', '000000000000000'],
        [5, 0, 'func', nop, 'fixed', '010011'],
    ]);
    // 注意MFC0和MTC0的特殊性
    newInstruction('mfc0', '取C0', '(rt)=由(rd)和sel确定的C0寄存器的值', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '010000'],
        [25, 21, 'rs', nop, 'fixed', '00000'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', function () { return utils_1.literalToBin(RegExp.$3, 6); }, 'c0sel', ''],
    ]);
    newInstruction('mtc0', '存C0', '由(rd)和sel确定的C0寄存器的值=(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '010000'],
        [25, 21, 'rs', nop, 'fixed', '00100'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', function () { return utils_1.literalToBin(RegExp.$3, 6); }, 'c0sel', ''],
    ]);
    newInstruction('or', '按位或', '(rd)←(rs)|(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100101'],
    ]);
    newInstruction('xor', '按位异或', '(rd)←(rs)^(rt)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100110'],
    ]);
    newInstruction('nor', '按位或非', '(rd)←~((rs)|(rt))', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '100111'],
    ]);
    newInstruction('slt', '有符号比较', 'if (rs<rt) rd=1 else rd=0', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '101010'],
    ]);
    newInstruction('sltu', '无符号比较', 'if (rs<rt) rd=1 else rd=0', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '101011'],
    ]);
    newInstruction('sll', '逻辑左移', '(rd)←(rt)<<shamt', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', nop, 'fixed', '00000'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', function () { return utils_1.literalToBin(RegExp.$3, 5); }, 'shamt', ''],
        [5, 0, 'func', nop, 'fixed', '000000'],
    ]);
    newInstruction('srl', '逻辑右移', '(rd)←(rt)>>_L shamt', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', nop, 'fixed', '00000'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', function () { return utils_1.literalToBin(RegExp.$3, 5); }, 'shamt', ''],
        [5, 0, 'func', nop, 'fixed', '000010'],
    ]);
    newInstruction('sra', '算术右移', '(rd)←(rt)>>_A shamt', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', nop, 'fixed', '00000'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', function () { return utils_1.literalToBin(RegExp.$3, 5); }, 'shamt', ''],
        [5, 0, 'func', nop, 'fixed', '000011'],
    ]);
    newInstruction('sllv', '逻辑左移V', '(rd)←(rt)<<(rs)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '000100'],
    ]);
    newInstruction('srlv', '逻辑右移V', '(rd)←(rt)>>_L (rs)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '000110'],
    ]);
    newInstruction('srav', '算术右移V', '(rd)←(rt)>>_L (rs)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '000111'],
    ]);
    newInstruction('jr', '无条件跳转（寄存器）', '(PC)←(rs)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 6, 'rt+rd+shamt', nop, 'fixed', '000000000000000'],
        [5, 0, 'func', nop, 'fixed', '001000'],
    ]);
    newInstruction('jalr', '暂存下条后跳转（寄存器）', '(rd)=(PC)+4,(PC)←(rs)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '00000'],
        [15, 11, 'rd', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [10, 6, 'shamt', nop, 'fixed', '00000'],
        [5, 0, 'func', nop, 'fixed', '001001'],
    ]);
    newInstruction('break', '断点异常', '断点异常', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 6, 'code', function () { return utils_1.literalToBin(RegExp.$1, 20); }, 'code', ''],
        [5, 0, 'func', nop, 'fixed', '001101'],
    ]);
    newInstruction('syscall', '系统调用', '系统调用', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000000'],
        [25, 6, 'code', function () { return utils_1.literalToBin(RegExp.$1, 20); }, 'code', ''],
        [5, 0, 'func', nop, 'fixed', '001100'],
    ]);
    newInstruction('eret', '从中断或者异常中返回', '从中断或者异常中返回', paramPattern(0), [
        [31, 26, 'op', nop, 'fixed', '010000'],
        [25, 6, 'rs+rt+rd+shamt', nop, 'fixed', '10000000000000000000'],
        [5, 0, 'func', nop, 'fixed', '011000'],
    ]);
    // =================== I型指令 ===================
    newInstruction('addi', '加立即数', '(rt)←(rs)+(sign-extend)immediate', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16, true); }, 'immed', ''],
    ]);
    newInstruction('addiu', '无符号加立即数', '(rt)←(rs)+(sign-extend)immediate', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16, true); }, 'immed', ''],
    ]);
    newInstruction('andi', '按位与立即数', '(rt)←(rs)&(zero-extend)immediate', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001100'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16); }, 'immed', ''],
    ]);
    newInstruction('ori', '按位或立即数', '(rt)←(rs)|(zero-extend)immediate', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001101'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16); }, 'immed', ''],
    ]);
    newInstruction('xori', '按位异或立即数', '(rt)←(rs)^(zero-extend)immediate', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001110'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16); }, 'immed', ''],
    ]);
    newInstruction('lui', '取立即数高16位', '(rt)←immediate<<16 & 0FFFF0000H', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '001111'],
        [25, 21, 'rs', nop, 'fixed', '00000'],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$2, 16, true); }, 'immed', ''],
    ]);
    newInstruction('lb', '取字节', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '100000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('lbu', '取无符号字节', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '100100'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('lh', '取半字', '(rt)←(Sign-Extend)Memory[(rs)+(sign_extend)offset]', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '100001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('lhu', '取无符号半字', '(rt)←(Zero-Extend)Memory[(rs)+(sign_extend)offset]', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '100101'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('sb', '存字节', 'Memory[(rs)+(sign_extend)offset]←(rt)7..0', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '101000'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('sh', '存半字', 'Memory[(rs)+(sign_extend)offset]←(rt)15..0', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '101001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('lw', '取字', '(rt)←Memory[(rs)+(sign_extend)offset]', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '100011'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('sw', '存字', 'Memory[(rs)+(sign_extend)offset]←(rt)', /^([\w$-]+),([\w-]+)\(([\w$-]+)\)$/, [
        [31, 26, 'op', nop, 'fixed', '101011'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$3); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.varToAddrBin(RegExp.$2, 16, true); }, 'offset', ''],
    ]);
    newInstruction('beq', '相等分支', 'if ((rt)=(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000100'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$3, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bne', '不等分支', 'if ((rt)≠(rs)) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '000101'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$3, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bgez', '大于等于0分支', 'if ((rs)≥0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '00001'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bgtz', '大于0分支', 'if ((rs)＞0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000111'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '00000'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('blez', '小于等于0分支', 'if ((rs)≤0) then (PC)←(PC)+4+((Sign-Extend)offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000110'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '00000'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bltz', '小于0分支', 'if ((rs)＜0) then (PC)←(PC)+4+((Sign-Extend) offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000111'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '00000'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bgezal', '大于等于0分支（Link）', 'if ((rs)≥0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '10001'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('bltzal', '小于0分支（Link）', 'if ((rs)＜0) then ($31)←(PC)+4,(PC)←(PC)+4+((Sign-Extend) offset<<2)', paramPattern(2), [
        [31, 26, 'op', nop, 'fixed', '000001'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [20, 16, 'rt', nop, 'fixed', '10000'],
        [15, 0, 'offset', function () { return utils_1.labelToBin(RegExp.$2, 18, true, true).slice(-18, -2); }, 'offset', ''],
    ]);
    newInstruction('slti', '小于立即数时Set', 'if ((rs)<(Sign-Extend)immediate) then (rt)←1; else (rt)←0', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001010'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16, true); }, 'immed', ''],
    ]);
    newInstruction('sltiu', '小于立即数时Set（无符号）', 'if ((rs)<(Zero-Extend)immediate) then (rt)←1; else (rt)←0', paramPattern(3), [
        [31, 26, 'op', nop, 'fixed', '001011'],
        [25, 21, 'rs', function () { return register_1.regToBin(RegExp.$2); }, 'reg', ''],
        [20, 16, 'rt', function () { return register_1.regToBin(RegExp.$1); }, 'reg', ''],
        [15, 0, 'immediate', function () { return utils_1.literalToBin(RegExp.$3, 16); }, 'immed', ''],
    ]);
    // =================== J型指令 ===================
    newInstruction('j', '无条件跳转', '(PC)←((Zero-Extend)address<<2)', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000010'],
        [25, 0, 'target', function () { return utils_1.labelToBin(RegExp.$1, 28, false).slice(-28, -2); }, 'addr', ''],
    ]);
    newInstruction('jal', '暂存下条后跳转（立即数）', '($31)←(PC)+4; (PC)←((Zero-Extend)address<<2),', paramPattern(1), [
        [31, 26, 'op', nop, 'fixed', '000011'],
        [25, 0, 'target', function () { return utils_1.labelToBin(RegExp.$1, 28, false).slice(-28, -2); }, 'addr', ''],
    ]);
    // =================== NOP指令 ===================
    newInstruction('nop', '空转指令', 'do nothing', paramPattern(0), [[31, 0, 'NOP', nop, 'fixed', '0'.repeat(32)]]);
    return _MinisysInstructions;
})();
