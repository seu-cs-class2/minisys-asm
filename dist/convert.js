"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coeToTxt = exports.textSegToCoe = exports.dataSegToCoe = void 0;
function dataSegToCoe(dataSeg, padTo) {
    if (padTo === void 0) { padTo = 64; }
    // TODO:
    return;
}
exports.dataSegToCoe = dataSegToCoe;
function textSegToCoe(textSeg, padTo) {
    if (padTo === void 0) { padTo = 64; }
    // TODO:
    return;
}
exports.textSegToCoe = textSegToCoe;
/**
 * 将两个coe文件并为可用UART串口写入的ASCII流文件
 */
function coeToTxt(programCoe, dataCoe) {
    var toStream = function (coe) {
        return coe
            .replace(/\r\n/, '\n')
            .split('\n')
            .filter(function (v) { return v.trim(); })
            .slice(2)
            .map(function (x) { return x.replace(',', ''); })
            .join('');
    };
    var content = "03020000" + toStream(programCoe) + toStream(dataCoe);
    return content;
}
exports.coeToTxt = coeToTxt;
