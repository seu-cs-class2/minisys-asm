"use strict";
/**
 * Minisys汇编器 - 汇编代码解析
 * by Withod, z0gSh1u @ 2020-10
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assemble = exports.parseOneLine = exports.getPC = exports.getLabelAddr = exports.getVarAddr = exports.TextSeg = exports.DataSeg = void 0;
var unraw_1 = __importDefault(require("unraw"));
var instruction_1 = require("./instruction");
var macro_1 = require("./macro");
var utils_1 = require("./utils");
// 仿照如下形式来添加新的变量类型
// prettier-ignore
var __VarCompType = {
    byte: void 0, half: void 0, word: void 0, ascii: void 0, space: void 0
};
var VarCompTypeRegex = Object.keys(__VarCompType).join('|');
/**
 * 数据段
 */
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
    /**
     * 添加新变量
     */
    DataSeg.prototype.newVar = function (name, comps, addr) {
        utils_1.assert(this._vars.every(function (v) { return v.name !== name; }), '重复的变量名。');
        this._vars.push({
            name: name,
            comps: comps,
            addr: addr,
        });
    };
    /**
     * 添加新变量组分
     */
    DataSeg.prototype.newComp = function (name, comp) {
        utils_1.assert(this._vars.some(function (v) { return v.name === name; }), '找不到该变量。');
        this._vars[this._vars.findIndex(function (v) { return v.name === name; })].comps.push(comp);
    };
    return DataSeg;
}());
exports.DataSeg = DataSeg;
/**
 * 代码段
 */
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
    /**
     * 代码段二进制输出
     */
    TextSeg.prototype.toBinary = function () {
        return this._ins.map(function (v) { return v.toBinary(); }).join('\n');
    };
    return TextSeg;
}());
exports.TextSeg = TextSeg;
// 分析过程辅助变量
var vars = [];
var labels = [];
var pc = 0;
/**
 * 获取变量地址
 */
function getVarAddr(name) {
    var res = vars.find(function (v) { return v.name == name; });
    utils_1.assert(res, "\u672A\u77E5\u7684\u53D8\u91CF\uFF1A" + name);
    return res.addr;
}
exports.getVarAddr = getVarAddr;
/**
 * 获取标签地址
 */
function getLabelAddr(label) {
    var res = labels.find(function (v) { return v.name == label; });
    utils_1.assert(res, "\u672A\u77E5\u7684\u6807\u7B7E\uFF1A" + label);
    return res.addr;
}
exports.getLabelAddr = getLabelAddr;
/**
 * 获取PC地址
 */
function getPC() {
    return pc;
}
exports.getPC = getPC;
/**
 * 解析数据段
 * @param asm 从.data开始，到.text的前一行
 */
function parseDataSeg(asm) {
    // 解析初始化值
    var parseInitValue = function (type, init) {
        utils_1.assert(!(type !== 'ascii' && init.includes('"')), '字符串型数据只能使用.ascii类型');
        init = init.trim();
        utils_1.assert(init[0] !== ',' && init[init.length - 1] !== ',', '数据初始化值头或尾有非法逗号');
        if (type !== 'ascii') {
            return init.split(/\s*,/).map(function (v) { return v.trim(); });
        }
        else {
            var inQuote = false, nextEscape = false, res = [], buf = '', prev = '';
            for (var i_1 = 0; i_1 < init.length; i_1++) {
                var ch = init.charAt(i_1);
                if (!inQuote && !ch.trim())
                    continue;
                if (ch == '"') {
                    if (nextEscape) {
                        utils_1.assert(inQuote, '有非法字符出现在引号以外');
                        buf += '"';
                        nextEscape = false;
                    }
                    else {
                        inQuote = !inQuote;
                    }
                }
                else if (ch == '\\') {
                    utils_1.assert(inQuote, '有非法字符出现在引号以外');
                    if (nextEscape) {
                        buf += '\\';
                        nextEscape = false;
                    }
                    else {
                        nextEscape = true;
                    }
                }
                else if (ch == ',') {
                    if (inQuote) {
                        buf += ','; // 引号内逗号可不escape
                        nextEscape = false;
                    }
                    else {
                        utils_1.assert(prev !== ',', '数据初始化值存在连续的逗号分隔');
                        res.push(buf);
                        buf = '';
                    }
                }
                else {
                    utils_1.assert(inQuote, '有非法字符出现在引号以外');
                    if (nextEscape) {
                        buf += unraw_1.default('\\' + ch);
                    }
                    else {
                        buf += ch;
                    }
                    nextEscape = false;
                }
                prev = ch;
            }
            res.push(buf);
            return res;
        }
    };
    // 检查起始地址
    var startAddr = asm[0].split(/\s+/)[1] || '0';
    utils_1.assert(asm[0].split(/\s+/).length <= 2, '数据段首声明非法');
    // 变量声明开始正则
    var VarStartPattern = new RegExp(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["(.+):s+.(", ")s+(.+)"], ["(.+):\\s+\\.(", ")\\s+(.+)"])), VarCompTypeRegex));
    // 变量声明继续正则
    var VarContdPattern = new RegExp(String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject([".(", ")s+(.+)"], ["\\.(", ")\\s+(.+)"])), VarCompTypeRegex));
    var comps = [], name;
    var i = 1;
    var addr = Number(startAddr), nextAddr = addr;
    vars = [];
    var _loop_1 = function () {
        if (VarStartPattern.test(asm[i])) {
            // 一个新变量开始
            if (name !== void 0) {
                vars.push({
                    name: name,
                    comps: comps,
                    addr: addr,
                });
                comps = [];
                name = void 0;
                addr = nextAddr;
            }
            name = RegExp.$1;
            var type_1 = RegExp.$2;
            var size_1 = utils_1.sizeof(type_1);
            // 边界对齐
            if (addr % size_1 > 0) {
                nextAddr = addr = addr + size_1 - (addr % size_1);
            }
            // 推入组分记录
            parseInitValue(type_1, RegExp.$3).forEach(function (val) {
                comps.push({
                    type: type_1,
                    val: val,
                });
                nextAddr += size_1 * (type_1 === 'ascii' ? val.length : 1);
            });
        }
        else if (VarContdPattern.test(asm[i])) {
            // 变量组分继续
            var type_2 = RegExp.$1;
            var size_2 = utils_1.sizeof(type_2);
            // 边界对齐，自动补.space
            while (nextAddr % size_2 > 0) {
                comps.push({
                    type: 'space',
                    val: '00',
                });
                nextAddr++;
            }
            // 推入组分记录
            parseInitValue(type_2, RegExp.$2).forEach(function (val) {
                comps.push({
                    type: type_2,
                    val: val,
                });
                nextAddr += size_2 * (type_2 === 'ascii' ? val.length : 1);
            });
        }
        else {
            // 报错
            utils_1.assert(false, "\u672A\u77E5\u7684\u53D8\u91CF\u5B9A\u4E49\u5F62\u5F0F\uFF0C\u5728\u6570\u636E\u6BB5\u7B2C " + (i + 1) + " \u884C");
        }
        // 末尾处理
        if (i === asm.length - 1) {
            vars.push({
                name: name,
                comps: comps,
                addr: addr,
            });
        }
        i++;
    };
    // 开始扫描
    while (i < asm.length) {
        _loop_1();
    }
    return new DataSeg(startAddr, vars);
}
/**
 * 展开代码段宏指令
 */
function expandMacros(asm_, lineno_) {
    var asm = Array.from(asm_);
    var ruleIdx = -1;
    var macros = Object.keys(macro_1.expansionRules);
    var bias = 0;
    asm_.forEach(function (v, i) {
        var LabelPattern = /^(\w+:)\s*([\w\s$]+)$/;
        var labelPreserve = '';
        if (v.match(LabelPattern)) {
            labelPreserve = RegExp.$1;
            v = RegExp.$2.trim();
        }
        if ((ruleIdx = macros.findIndex(function (x) { return v.match(macro_1.expansionRules[x].pattern); })) !== -1) {
            var replacer = macro_1.expansionRules[macros[ruleIdx]].replacer();
            replacer[0] = labelPreserve + ' ' + replacer[0];
            asm.splice.apply(asm, __spreadArrays([i + bias, 1], replacer));
            lineno_.splice.apply(lineno_, __spreadArrays([i + bias, 1], new Array(replacer.length).fill(lineno_[i + bias])));
            bias += replacer.length - 1;
        }
    });
    return asm;
}
/**
 * 解析代码段
 * @param asm .text起，到代码段结束
 */
function parseTextSeg(asm_, lineno) {
    // 先展开宏指令
    var asm = expandMacros(asm_, lineno);
    // 确定数据段起始地址
    var startAddr = asm[0].split(/\s+/)[1] || '0';
    utils_1.assert(asm[0].split(/\s+/).length <= 2, '代码段首声明非法。');
    // 起始地址校正到4字节对齐（32位）
    var sizeofWord = utils_1.sizeof('word');
    var startAddrNumber = Number(startAddr);
    startAddr = String(((sizeofWord - (startAddrNumber % sizeofWord)) % sizeofWord) + startAddrNumber);
    // pc指针
    pc = utils_1.getOffsetAddr(startAddr, 0);
    labels = [];
    // 去除label后指令实际行号
    var insLineno = 1;
    // 先提取掉所有的label
    asm = asm.map(function (v, i) {
        if (i === 0)
            return v;
        if (/(\w+):\s*(.*)/.test(v)) {
            utils_1.assert(labels.every(function (label) { return label.name !== RegExp.$1; }), "\u5B58\u5728\u91CD\u590D\u7684label\uFF1A" + RegExp.$1 + "\uFF0C\u5728\u4EE3\u7801\u7B2C" + lineno[i] + "\u884C\u3002");
            labels.push({ name: RegExp.$1, lineno: insLineno, addr: utils_1.getOffsetAddr(startAddr, utils_1.getOffset({ ins: insLineno - 1 })) });
            if (RegExp.$2.trim())
                insLineno++;
            return RegExp.$2;
        }
        insLineno++;
        return v;
    });
    lineno = lineno.filter(function (x, i) { return asm[i].trim(); });
    asm = asm.filter(function (x) { return x.trim(); });
    var ins = [];
    asm.forEach(function (v, i) {
        i !== 0 && ins.push(parseOneLine(v, lineno[i]));
    });
    return new TextSeg(startAddr, ins, labels);
}
/**
 * 解析单行汇编到Instruction对象
 */
function parseOneLine(asm, lineno) {
    // 处理助记符
    utils_1.assert(/^\s*(\w+)\s*(.*)/.test(asm), "\u6CA1\u6709\u627E\u5230\u6307\u4EE4\u52A9\u8BB0\u7B26\uFF0C\u5728\u4EE3\u7801\u7B2C " + lineno + " \u884C\u3002");
    var symbol = RegExp.$1;
    // 检验助记符合法性
    var instructionIndex = instruction_1.MinisysInstructions.findIndex(function (x) { return x.symbol == symbol; });
    utils_1.assert(instructionIndex !== -1, "\u65E0\u6548\u7684\u6307\u4EE4\u52A9\u8BB0\u7B26\u6216\u9519\u8BEF\u7684\u6307\u4EE4\u7528\u6CD5\uFF1A" + symbol + "\uFF0C\u5728\u4EE3\u7801\u7B2C " + lineno + " \u884C\u3002");
    // 单行汇编去空格
    asm = utils_1.serialString(RegExp.$2);
    // pc移进
    pc += utils_1.sizeof('ins');
    // 开始组装Instruction对象
    var res = instruction_1.Instruction.newInstance(instruction_1.MinisysInstructions[instructionIndex]);
    utils_1.assert(res.insPattern.test(asm), "\u4EE3\u7801\u6BB5\u7B2C " + lineno + " \u884C\u6307\u4EE4\u53C2\u6570\u4E0D\u5339\u914D\uFF1A" + asm);
    res.components.forEach(function (component) {
        if (!component.val.trim() /* 代表是需要填充的变量，而不是指令二进制中的定值 */) {
            try {
                res.setComponent(component.desc, component.toBinary());
            }
            catch (err) {
                err.message += "\uFF0C\u5728\u4EE3\u7801\u7B2C " + lineno + " \u884C";
                throw err;
            }
        }
    });
    return res;
}
exports.parseOneLine = parseOneLine;
/**
 * 汇编！
 * @param asm_ 汇编代码
 */
function assemble(asm_) {
    // 格式化之：去掉空行；CRLF均变LF；均用单个空格分分隔；逗号后带空格，均小写。
    var asm__ = (asm_ + '\n')
        .replace(/\r\n/g, '\n')
        .replace(/#(.*)\n/g, '\n')
        .split('\n');
    var lineno = Array.from(new Array(asm__.length), function (x, i) { return i + 1; })
        .filter(function (x) { return asm__[x - 1].trim(); });
    var asm = asm__
        .filter(function (x) { return x.trim(); })
        .map(function (x) { return x.trim().replace(/\s+/g, ' ').replace(/,\s*/, ', ').toLowerCase(); });
    // 挑出代码段和数据段
    var dataSegStartLine = asm.findIndex(function (v) { return v.match(/\.data/); });
    var textSegStartLine = asm.findIndex(function (v) { return v.match(/\.text/); });
    utils_1.assert(dataSegStartLine !== -1, '未找到数据段开始。');
    utils_1.assert(textSegStartLine !== -1, '未找到代码段开始。');
    utils_1.assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后。');
    // 解析数据段
    var dataSeg = parseDataSeg(asm.slice(dataSegStartLine, textSegStartLine));
    // 解析代码段
    var textSeg = parseTextSeg(asm.slice(textSegStartLine), lineno.slice(textSegStartLine));
    return {
        dataSeg: dataSeg,
        textSeg: textSeg,
    };
}
exports.assemble = assemble;
var templateObject_1, templateObject_2;
//# sourceMappingURL=assembler.js.map