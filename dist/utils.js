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
