"use strict";
/**
 * Minisys汇编解析器
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
exports.parseOneLine = exports.assemble = void 0;
var instruction_1 = require("./instruction");
var register_1 = require("./register");
var utils_1 = require("./utils");
var DataSeg = /** @class */ (function () {
    function DataSeg(startAddr, vars) {
        this._startAddr = startAddr;
        this._vars = Array.from(vars);
    }
    Object.defineProperty(DataSeg.prototype, "startAddr", {
        get: function () {
            return this._startAddr;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataSeg.prototype, "vars", {
        get: function () {
            return this._vars;
        },
        enumerable: false,
        configurable: true
    });
    DataSeg.prototype.newVar = function (name, comps) {
        utils_1.assert(this._vars.every(function (v) { return v.name !== name; }), '重复的变量名。');
        this._vars.push({
            name: name,
            comps: __spreadArrays(comps),
        });
    };
    DataSeg.prototype.newComp = function (name, comp) {
        utils_1.assert(this._vars.some(function (v) { return v.name === name; }), '找不到该变量。');
        this._vars[this._vars.findIndex(function (v) { return v.name === name; })].comps.push(comp);
    };
    return DataSeg;
}());
var TextSeg = /** @class */ (function () {
    function TextSeg(startAddr, ins, labels) {
        this._startAddr = startAddr;
        this._ins = Array.from(ins);
        this._labels = Array.from(labels);
    }
    Object.defineProperty(TextSeg.prototype, "startAddr", {
        get: function () {
            return this._startAddr;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextSeg.prototype, "ins", {
        get: function () {
            return this._ins;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextSeg.prototype, "labels", {
        get: function () {
            return this._labels;
        },
        enumerable: false,
        configurable: true
    });
    TextSeg.prototype.toBinary = function () {
        var res = '';
        this._ins.forEach(function (ins) {
            res += ins.toBinary() + '\n';
        });
        return res;
    };
    return TextSeg;
}());
/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
function parseDataSeg(asm) {
    // 解析初始化值
    var parseInitValue = function (init) { return init.split(/\s*,/).map(function (v) { return v.trim(); }); };
    var startAddr = asm[0].split(/\s+/)[1];
    utils_1.assert(asm[0].split(/\s+/).length === 2, '数据段首声明非法。');
    var VarStartPattern = /(.+):\s+\.(word|byte|half|ascii|space)\s+(.+)/;
    var VarContdPattern = /\.(word|byte|half|ascii|space)\s+(.+)/;
    var vars = [], comps = [], name;
    var i = 1;
    var _loop_1 = function () {
        if (VarStartPattern.test(asm[i])) {
            // 一个新变量开始
            if (name !== void 0) {
                vars.push({
                    name: name,
                    comps: comps,
                });
                comps = [];
                name = void 0;
            }
            name = RegExp.$1;
            var type_1 = RegExp.$2;
            parseInitValue(RegExp.$3).forEach(function (val) {
                comps.push({
                    type: type_1,
                    val: val,
                });
            });
        }
        else if (VarContdPattern.test(asm[i])) {
            // 变量组分继续
            var type_2 = RegExp.$1;
            parseInitValue(RegExp.$2).forEach(function (val) {
                comps.push({
                    type: type_2,
                    val: val,
                });
            });
        }
        else {
            utils_1.assert(false, "\u672A\u77E5\u7684\u53D8\u91CF\u5B9A\u4E49\u5F62\u5F0F\uFF0C\u6570\u636E\u6BB5\u884C\u53F7: " + (i + 1));
        }
        if (i === asm.length - 1) {
            vars.push({
                name: name,
                comps: comps,
            });
        }
        i++;
    };
    do {
        _loop_1();
    } while (i < asm.length);
    return new DataSeg(startAddr, vars);
}
/**
 * 解析代码段
 * @param asm .text起，到代码段结束
 */
function parseTextSeg(asm_) {
    var asm = Array.from(asm_);
    var startAddr = asm[0].split(/\s+/)[1];
    // 先提取掉所有的label
    var labels = [];
    asm = asm.map(function (v, i) {
        if (i === 0)
            return v;
        if (/(.+):\s+(.+)/.test(v)) {
            utils_1.assert(labels.every(function (label) { return label.name !== RegExp.$1; }), "\u5B58\u5728\u91CD\u590D\u7684label: " + RegExp.$1);
            // FIXME: 地址4字节对齐？
            labels.push({ name: RegExp.$1, lineno: i, addr: utils_1.getOffsetAddr(startAddr, utils_1.getOffset({ instruction: i - 1 })) });
            return RegExp.$2;
        }
        return v;
    });
    var ins = [];
    asm.forEach(function (v, i) {
        i !== 0 && ins.push(parseOneLine(v, labels, i));
    });
    return new TextSeg(startAddr, ins, labels);
}
/**
 * 汇编！
 * @param asm_ 汇编代码
 */
function assemble(asm_) {
    // 格式化之。去掉空行；CRLF均变LF；均用单个空格分分隔；逗号后带空格
    var asm = asm_
        .replace(/\r\n/g, '\n')
        .replace(/:\s*\n/g, ': ')
        .split('\n')
        .filter(function (x) { return x.trim(); })
        .map(function (x) { return x.trim().replace(/\s+/g, ' ').replace(/,\s*/, ', ').toLowerCase(); });
    var dataSegStartLine = asm.findIndex(function (v) { return v.match(/\.data\s+(.+)/); });
    var textSegStartLine = asm.findIndex(function (v) { return v.match(/\.text\s+(.+)/); });
    utils_1.assert(dataSegStartLine !== -1, '未找到数据段开始。');
    utils_1.assert(textSegStartLine !== -1, '未找到代码段开始。');
    utils_1.assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后。');
    // 解析数据段
    var dataSeg = parseDataSeg(asm.slice(dataSegStartLine, textSegStartLine));
    // 解析代码段
    var textSeg = parseTextSeg(asm.slice(textSegStartLine));
    return {
        dataSeg: dataSeg,
        textSeg: textSeg,
    };
}
exports.assemble = assemble;
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
function parseOneLine(asm, labels, lineno) {
    var asmSplit = asm.trim().replace(/,/g, ' ').split(/\s+/);
    utils_1.assert(asmSplit.every(function (v) { return v.length; }), "\u5B58\u5728\u7A7A\u53C2\u6570\uFF0C\u5728\u7B2C " + lineno + " \u884C\u3002");
    // 处理助记符
    var symbol = asmSplit[0];
    var instructionIndex = instruction_1.MinisysInstructions.findIndex(function (x) { return x.symbol == symbol; });
    utils_1.assert(instructionIndex !== -1, "\u6CA1\u6709\u627E\u5230\u6307\u4EE4\u52A9\u8BB0\u7B26\uFF1A" + symbol + "\uFF0C\u5728\u7B2C " + lineno + " \u884C\u3002");
    var res = instruction_1.Instruction.newInstance(instruction_1.MinisysInstructions[instructionIndex]);
    // 填充参数
    var params = asmSplit.slice(1);
    params = params.map(function (v) {
        // 是label
        if (labels.some(function (x) { return x.name === v; })) {
            return String(labels.find(function (x) { return x.name === v; }).addr);
        }
        if (v.match(/^[A-Za-z][A-Za-z0-9]*$/)) {
            utils_1.assert(false, "\u6CA1\u9053\u7406\u7684\u53C2\u6570: " + v + "\uFF0C\u5728\u7B2C " + lineno + " \u884C\u3002");
        }
        return v;
    });
    // 处理比较特别的load/store指令
    var LoadStoreIns = ['lb', 'lbu', 'lh', 'lhu', 'sb', 'sh', 'lw', 'sw'];
    if (LoadStoreIns.includes(symbol)) {
        var tmp = params.pop();
        // **example**: lb $1, 10($2)
        if (new RegExp(/(.+)\((.+)\)/).test(tmp)) {
            params.push(RegExp.$2, RegExp.$1);
        }
        else {
            throw new Error("\u6307\u4EE4\u53C2\u6570\u4E0E\u5E94\u6709\u7684\u53C2\u6570\u4E0D\u5339\u914D\uFF1A" + symbol);
        }
    }
    // 普通情况
    utils_1.assert(res.components.filter(function (v) { return v.type !== 'fixed'; }).length === params.length, "\u6307\u4EE4\u53C2\u6570\u4E0E\u5E94\u6709\u7684\u53C2\u6570\u4E0D\u5339\u914D\uFF1A" + symbol);
    var i = 0;
    res.components.forEach(function (component) {
        var arg;
        switch (component.type) {
            case 'fixed':
                return;
            case 'reg':
                arg = register_1.regToBin(params[i]);
                break;
            case 'immed':
                arg = literalToBin(params[i], 16);
                break;
            case 'offset':
                // @ts-ignore
                if (LoadStoreIns.includes(symbol) && isNaN(params[i])) {
                    // TODO:
                    throw new Error('暂不支持带变量名的 load/store 指令。');
                }
                arg = literalToBin(params[i], 16);
                break;
            case 'shamt':
                arg = literalToBin(params[i], 5);
                break;
            case 'addr':
                arg = literalToBin(params[i], 26);
                break;
            case 'code':
                arg = literalToBin(params[i], 20);
                break;
            case 'c0sel':
                arg = literalToBin(params[i], 6);
                break;
            default:
                throw new Error('无效的指令组分类型。');
        }
        res.setComponent(component.desc, arg);
        i++;
    });
    return res;
}
exports.parseOneLine = parseOneLine;
