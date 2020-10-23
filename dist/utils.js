"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffsetAddr = exports.getOffset = exports.serialString = exports.hexToBin = exports.hexToDec = exports.decToHex = exports.binToHex = exports.decToBin = exports.literalToBin = exports.assert = void 0;
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
 * 把字面量数字转换为二进制
 * @example 10
 * @example 0xabcd
 */
// FIXME: 符号扩展不正确
function literalToBin(literal, len, pad) {
    if (pad === void 0) { pad = '0'; }
    if (literal.startsWith('0x')) {
        return hexToBin(literal).padStart(len, pad);
    }
    else {
        return decToBin(parseInt(literal), len, pad);
    }
}
exports.literalToBin = literalToBin;
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
/**
 * 算地址偏移量
 */
function getOffset(holder) {
    var WORD_LEN = 4;
    var HALF_LEN = WORD_LEN / 2;
    var BYTE_LEN = 1;
    var INS_LEN = WORD_LEN;
    return ((holder.byte || 0) * BYTE_LEN +
        (holder.half || 0) * HALF_LEN +
        (holder.word || 0) * WORD_LEN +
        (holder.space || 0) +
        (holder.instruction || 0) * INS_LEN);
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
