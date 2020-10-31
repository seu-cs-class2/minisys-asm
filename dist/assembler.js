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
exports.parseOneLine = exports.assemble = exports.TextSeg = exports.DataSeg = void 0;
var instruction_1 = require("./instruction");
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
exports.DataSeg = DataSeg;
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
exports.TextSeg = TextSeg;
/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
function parseDataSeg(asm) {
    // 解析初始化值
    var parseInitValue = function (init) { return init.split(/\s*,/).map(function (v) { return v.trim(); }); };
    var startAddr = asm[0].split(/\s+/)[1] || '0';
    utils_1.assert(asm[0].split(/\s+/).length <= 2, '数据段首声明非法。');
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
    var startAddr = asm[0].split(/\s+/)[1] || '0';
    utils_1.assert(asm[0].split(/\s+/).length <= 2, '代码段首声明非法。');
    // 先提取掉所有的label
    var labels = [];
    asm = asm.map(function (v, i) {
        if (i === 0)
            return v;
        if (/(\w+):\s*(.+)/.test(v)) {
            utils_1.assert(labels.every(function (label) { return label.name !== RegExp.$1; }), "\u5B58\u5728\u91CD\u590D\u7684label: " + RegExp.$1);
            // FIXME: 地址4字节对齐？
            labels.push({ name: RegExp.$1, lineno: i, addr: utils_1.getOffsetAddr(startAddr, utils_1.getOffset({ instruction: i - 1 })) });
            return RegExp.$2;
        }
        return v;
    });
    labels.sort(function (a, b) { return b.name.length - a.name.length; });
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
        .replace(/#(.*)\n/g, '\n')
        .replace(/:\s*\n/g, ': ')
        .split('\n')
        .filter(function (x) { return x.trim(); })
        .map(function (x) { return x.trim().replace(/\s+/g, ' ').replace(/,\s*/, ', ').toLowerCase(); });
    var dataSegStartLine = asm.findIndex(function (v) { return v.match(/\.data/); });
    var textSegStartLine = asm.findIndex(function (v) { return v.match(/\.text/); });
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
 * 解析单行汇编到Instruction对象
 */
function parseOneLine(asm, labels, lineno) {
    // 处理助记符
    utils_1.assert(/^\s*(\w+)\s+(.*)/.test(asm), "\u6CA1\u6709\u627E\u5230\u6307\u4EE4\u52A9\u8BB0\u7B26\uFF0C\u5728\u7B2C " + lineno + " \u884C\u3002");
    var symbol = RegExp.$1;
    asm = utils_1.serialString(RegExp.$2);
    labels.forEach(function (label) {
        asm = asm.replace(new RegExp(label.name, 'gm'), label.addr.toString());
    });
    var instructionIndex = instruction_1.MinisysInstructions.findIndex(function (x) { return x.symbol == symbol; });
    utils_1.assert(instructionIndex !== -1, "\u6CA1\u6709\u627E\u5230\u6307\u4EE4\u52A9\u8BB0\u7B26\uFF1A" + symbol + "\uFF0C\u5728\u7B2C " + lineno + " \u884C\u3002");
    var res = instruction_1.Instruction.newInstance(instruction_1.MinisysInstructions[instructionIndex]);
    utils_1.assert(res.insPattern.test(asm), "\u7B2C " + lineno + " \u884C\u6307\u4EE4\u53C2\u6570\u4E0D\u5339\u914D\uFF1A" + asm);
    res.components.forEach(function (component) {
        if (!component.val.trim()) {
            try {
                var arg = component.toBin();
                // TODO: 目前暂未支持变量名的转换
                res.setComponent(component.desc, arg);
            }
            catch (err) {
                throw new Error(err.message + ("\uFF0C\u5728\u7B2C " + lineno + "\u884C"));
            }
        }
    });
    return res;
}
exports.parseOneLine = parseOneLine;
