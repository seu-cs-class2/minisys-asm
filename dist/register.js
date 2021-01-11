"use strict";
/**
 * Minisys寄存器定义
 * by Withod, z0gSh1u @ 2020-10
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
    't8', 't9',
    'k0', 'k1',
    'gp', 'sp', 'fp',
    'ra',
];
/**
 * 返回寄存器对应的五位二进制号
 * @example $1 1 sp $sp
 * @warn 请勿在本函数内覆盖RegExp.$x
 */
function regToBin(reg) {
    reg = reg.replace('$', '').trim();
    var regNumber;
    if (reg.split('').every(function (x) { return '0123456789'.includes(x); })) {
        regNumber = Number(reg);
    }
    else {
        regNumber = registerNames.indexOf(reg);
    }
    utils_1.assert(regNumber >= 0 && regNumber <= 31, "\u65E0\u6548\u7684\u5BC4\u5B58\u5668: " + reg);
    return utils_1.decToBin(regNumber, 5);
}
exports.regToBin = regToBin;
//# sourceMappingURL=register.js.map