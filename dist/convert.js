"use strict";
/**
 * Minisys汇编器 - coe、txt文件导出
 * by Withod, z0gSh1u @ 2020-10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coeToTxt = exports.textSegToCoe = exports.dataSegToCoe = void 0;
var utils_1 = require("./utils");
/**
 * 数据段转coe文件
 * @param padTo 补齐到多少KByte
 */
function dataSegToCoe(dataSeg, padTo) {
    if (padTo === void 0) { padTo = 64; }
    var wordLength = utils_1.sizeof('word');
    var coe = 'memory_initialization_radix = 16;\nmemory_initialization_vector =\n';
    var lineLimit = (padTo * 1024) / wordLength;
    var buf = '', lineno = 0;
    dataSeg.vars.forEach(function (v) {
        if (v.addr / wordLength - lineno > 0 && buf.length > 0) {
            coe += buf.padStart(8, '0') + ',\n';
            buf = '';
            lineno++;
        }
        coe += '00000000,\n'.repeat(v.addr / wordLength - lineno);
        lineno = v.addr / wordLength;
        buf = '00'.repeat(((v.addr % wordLength) - buf.length / 2 + wordLength) % wordLength) + buf;
        v.comps.forEach(function (comp) {
            utils_1.assert(lineno < lineLimit, "\u53D8\u91CF " + v.name + " \u5730\u5740\u8D85\u51FA\u9650\u5236");
            switch (comp.type) {
                case 'ascii':
                    comp.val.split('').forEach(function (c) {
                        buf = utils_1.decToHex(c.charCodeAt(0), 8, false) + buf;
                        if (buf.length == 8) {
                            coe += buf + ',\n';
                            buf = '';
                            lineno++;
                        }
                    });
                    utils_1.assert(lineno < lineLimit, "\u53D8\u91CF " + v.name + " \u5730\u5740\u8D85\u51FA\u9650\u5236");
                    break;
                case 'space':
                    buf = '00' + buf;
                    break;
                default:
                    buf = utils_1.binToHex(utils_1.literalToBin(comp.val, utils_1.sizeof(comp.type) * 8, true), false) + buf;
            }
            utils_1.assert(buf.length <= 8, "\u53D8\u91CF " + v.name + " \u4E2D\u5B58\u5728\u672A\u5BF9\u9F50\u5730\u5740");
            if (buf.length == 8) {
                coe += buf + ',\n';
                buf = '';
                lineno++;
            }
        });
    });
    if (buf.length > 0) {
        coe += '0'.repeat(8 - buf.length) + buf + ',\n';
        lineno++;
    }
    coe += '00000000,\n'.repeat(lineLimit - lineno);
    return coe.slice(0, -2) + ';\n';
}
exports.dataSegToCoe = dataSegToCoe;
/**
 * 代码段转coe文件
 * @param padTo 补齐到多少KByte
 */
function textSegToCoe(textSeg, padTo) {
    if (padTo === void 0) { padTo = 64; }
    var wordLength = utils_1.sizeof('word');
    var coe = 'memory_initialization_radix = 16;\nmemory_initialization_vector =\n';
    var lineLimit = (padTo * 1024) / wordLength;
    var startLine = Number(textSeg.startAddr) / wordLength;
    var lineno = 0;
    coe += '00000000,\n'.repeat(startLine);
    textSeg.ins.forEach(function (ins) {
        utils_1.assert(lineno + startLine < lineLimit, "\u7B2C " + lineno + " \u6761\u6307\u4EE4 " + ins.symbol + " \u5730\u5740\u8D85\u51FA\u9650\u5236");
        var buf = '';
        ins.components.forEach(function (comp) {
            buf += comp.val;
        });
        coe += utils_1.binToHex(buf, false) + ',\n';
        lineno++;
    });
    coe += '00000000,\n'.repeat(lineLimit - lineno - startLine);
    return coe.slice(0, -2) + ';\n';
}
exports.textSegToCoe = textSegToCoe;
/**
 * 将两个coe文件并为可用UART串口写入的ASCII流文件
 */
function coeToTxt(programCoe, dataCoe) {
    var introSignal = '03020000'; // 前导握手信号
    /**
     * coe文件内容转hex流串
     */
    var toStream = function (coe) {
        return coe
            .replace(/\r\n/, '\n')
            .split('\n')
            .filter(function (v) { return v.trim(); })
            .slice(2)
            .map(function (x) { return x.replace(',', ''); })
            .join('');
    };
    var content = "" + introSignal + toStream(programCoe) + toStream(dataCoe);
    return content;
}
exports.coeToTxt = coeToTxt;
//# sourceMappingURL=convert.js.map