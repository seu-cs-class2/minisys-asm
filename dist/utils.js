"use strict";
/**
 * Utilities
 * by Withod, z0gSh1u @ 2020-10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffsetAddr = exports.getOffset = exports.sizeof = exports.serialString = exports.hexToBin = exports.hexToDec = exports.decToHex = exports.binToHex = exports.decToBin = exports.literalToBin = exports.varToAddrBin = exports.labelToBin = exports.assert = void 0;
var assembler_1 = require("./assembler");
/**
 * Ensure `ensure`, else throw `Error(hint)`.
 */
function assert(ensure, hint) {
    if (!ensure) {
        throw new Error(hint);
    }
}
exports.assert = assert;
/**
 * 将label或字面量转换为二进制
 * @param label label名称或字面量数字
 * @param len 转换后的长度
 * @param isOffset 转换而成的是否为相对当前地址的偏移量
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 */
function labelToBin(label, len, isOffset, signExt) {
    if (signExt === void 0) { signExt = false; }
    try {
        if (!isOffset) {
            return decToBin(parseInt(literalToBin(label, len, signExt), 2) + assembler_1.userAddrOffset, len, signExt).slice(-len);
        }
        else {
            return literalToBin(label, len, signExt).slice(-len);
        }
    }
    catch (e) {
        return literalToBin((assembler_1.getLabelAddr(label) - (isOffset ? assembler_1.getPC() : 0)).toString(), len, isOffset).slice(-len);
    }
}
exports.labelToBin = labelToBin;
/**
 * 将变量名或字面量转换为二进制
 * @param name 变量名称或字面量数字
 * @param len 转换后的长度
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 */
function varToAddrBin(name, len, signExt) {
    if (signExt === void 0) { signExt = false; }
    try {
        return literalToBin(name, len, signExt).slice(-len);
    }
    catch (_) {
        return literalToBin(assembler_1.getVarAddr(name).toString(), len).slice(-len);
    }
}
exports.varToAddrBin = varToAddrBin;
/**
 * 把字面量数字转换为二进制
 * @param literal 要转换的字面量数字
 * @param len 转换后的最少位数
 * @param signExt 转换后位数不足时是否进行符号扩展，默认采用零扩展
 * @example 10
 * @example 0xabcd
 */
function literalToBin(literal, len, signExt) {
    if (signExt === void 0) { signExt = false; }
    assert(!isNaN(Number(literal)), "\u9519\u8BEF\u7684\u53C2\u6570\uFF1A" + literal);
    if (literal.startsWith('0x')) {
        var num = hexToBin(literal);
        return num.padStart(len, signExt && parseInt(literal, 16) < 0 ? '1' : '0');
    }
    else {
        return decToBin(parseInt(literal), len, signExt);
    }
}
exports.literalToBin = literalToBin;
/**
 * 将十进制数转为二进制，用pad补齐到len位，支持负数
 */
function decToBin(dec, len, signExt) {
    if (signExt === void 0) { signExt = false; }
    var num = '';
    if (dec < 0) {
        // 算补码
        num = (-dec - 1)
            .toString(2)
            .split('')
            .map(function (v) { return String.fromCharCode(v.charCodeAt(0) ^ 1); })
            .join('');
    }
    else {
        num = dec.toString(2);
    }
    return num.padStart(len, signExt && dec < 0 ? '1' : '0');
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
    return binToHex(decToBin(dec, len, false), zeroX);
}
exports.decToHex = decToHex;
/**
 * 十六进制转十进制
 */
function hexToDec(hex) {
    return parseInt(hex, 16);
}
exports.hexToDec = hexToDec;
/**
 * 将十六进制每位转换为4位二进制，参数带不带0x头都可以
 */
function hexToBin(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.substr(2);
    }
    var table = Array(16)
        .fill('')
        .map(function (_, i) { return decToBin(i, 4, false); });
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
/**
 * 获取变量组分或指令占用的字节数
 */
function sizeof(type) {
    var size = {
        byte: 1,
        half: 2,
        word: 4,
        space: 1,
        ascii: 1,
        ins: 4,
    }[type] || -1;
    assert(size !== -1, "\u9519\u8BEF\u7684\u53D8\u91CF\u7C7B\u578B\uFF1A" + type);
    return size;
}
exports.sizeof = sizeof;
/**
 * 算地址偏移量
 */
function getOffset(holder) {
    return ((holder.byte || 0) * sizeof('byte') +
        (holder.half || 0) * sizeof('half') +
        (holder.word || 0) * sizeof('word') +
        (holder.ascii || 0) * sizeof('ascii') +
        (holder.space || 0) +
        (holder.ins || 0) * sizeof('word'));
}
exports.getOffset = getOffset;
/**
 * 算偏移后的地址
 * @param baseAddr 基地址，十六进制或十进制
 */
function getOffsetAddr(baseAddr, offsetBit) {
    var base = baseAddr.startsWith('0x') ? hexToDec(baseAddr) : Number(baseAddr);
    return base + offsetBit;
}
exports.getOffsetAddr = getOffsetAddr;
//# sourceMappingURL=utils.js.map