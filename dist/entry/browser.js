"use strict";
/**
 * Minisys汇编器 - 浏览器端编译入口
 * by Withod, z0gSh1u @ 2020-10
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assembler_1 = require("../assembler");
var convert_1 = require("../convert");
var utils_1 = require("../utils");
var minisys_bios_asm_1 = __importDefault(require("../snippet/minisys-bios.asm"));
var minisys_interrupt_entry_asm_1 = __importDefault(require("../snippet/minisys-interrupt-entry.asm"));
var minisys_interrupt_handler_asm_1 = __importDefault(require("../snippet/minisys-interrupt-handler.asm"));
var linker_1 = require("../linker");
function $(selector) {
    return document.querySelector(selector);
}
// @ts-ignore
var editor = window.editor;
var statusBgDOM = $('.status');
var statusDOM = $('#asm-status');
var traceDOM = $('#asm-failTrace');
var resultDOM = $('#asm-result');
var linkResultDOM = $('#link-result');
var jOffset = +1280;
/**
 * 修改提示状态
 */
function setStatus(to, trace) {
    var successColor = '#cf9';
    var failColor = '#f99';
    if (to === 'success') {
        statusBgDOM.style.background = successColor;
        statusDOM.innerText = '成功';
        traceDOM.innerText = '';
    }
    if (to === 'fail') {
        statusBgDOM.style.background = failColor;
        statusDOM.innerText = '失败';
        traceDOM.innerText = trace || '';
    }
}
/**
 * 转换汇编结果的进制
 * @param res 原汇编结果
 */
function assembleResultSwitch(res) {
    return res
        .split('\n')
        .map(function (binaryLine) { return ($('#hexSwitch').checked ? utils_1.binToHex(binaryLine, false) : utils_1.hexToBin(binaryLine)); })
        .join('\n');
}
function assemble(asmCode, link) {
    if (!link) {
        return assembler_1.assemble(asmCode);
    }
    else {
        var asm = (asmCode + '\n')
            .replace(/\r\n/g, '\n')
            .replace(/#(.*)\n/g, '\n')
            .split('\n');
        // 挑出代码段和数据段
        var dataSegStartLine = asm.findIndex(function (v) { return v.match(/\.data/); });
        var textSegStartLine = asm.findIndex(function (v) { return v.match(/\.text/); });
        utils_1.assert(dataSegStartLine !== -1, '未找到数据段开始');
        utils_1.assert(textSegStartLine !== -1, '未找到代码段开始');
        utils_1.assert(dataSegStartLine < textSegStartLine, '数据段不能位于代码段之后');
        // 链接完成后汇编
        var allProgram = asm.slice(dataSegStartLine, textSegStartLine).join('\n') +
            '\n' +
            '.text\n' +
            linker_1.linkAll(minisys_bios_asm_1.default, asm.slice(textSegStartLine + 1).join('\n'), minisys_interrupt_entry_asm_1.default, minisys_interrupt_handler_asm_1.default);
        linkResultDOM.value = allProgram;
        var all = assembler_1.assemble(allProgram);
        return all;
    }
}
/**
 * 网页端触发汇编
 */
function assembleBrowser() {
    resultDOM.value = '';
    linkResultDOM.value = '';
    var asmCode = editor.getValue();
    var link = $('#linkSwitch').checked;
    // @ts-ignore
    globalThis._minisys = {
        _userAppOffset: link ? jOffset : 0,
    };
    try {
        var result = assemble(asmCode, link);
        var binary = result.textSeg.toBinary();
        if ($('#hexSwitch').checked) {
            resultDOM.value = assembleResultSwitch(binary);
        }
        else {
            resultDOM.value = binary;
        }
        setStatus('success');
    }
    catch (ex) {
        setStatus('fail', ex);
        console.error(ex);
        resultDOM.value = '';
    }
}
/**
 * 形成文件供下载
 */
function downloadFile(content, filename) {
    var linkDOM = document.createElement('a');
    linkDOM.download = filename;
    linkDOM.style.display = 'none';
    // 字符内容转二进制大对象
    var blob = new Blob([content]);
    linkDOM.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(linkDOM);
    linkDOM.click();
    // 移除
    document.body.removeChild(linkDOM);
}
window.addEventListener('load', function () {
    $('#j-offset').innerHTML = '+' + String(jOffset);
    // 汇编结果进制切换处理逻辑
    $('#hexSwitch').onchange = function () {
        resultDOM.value = assembleResultSwitch(resultDOM.value);
    };
    // 按钮处理逻辑
    $('#asm-assemble').onclick = assembleBrowser;
    $('#asm-download-coe').onclick = function () {
        var link = $('#linkSwitch').checked;
        // @ts-ignore
        globalThis._minisys = {
            _userAppOffset: link ? jOffset : 0,
        };
        try {
            var result = assemble(editor.getValue(), link);
            downloadFile(convert_1.dataSegToCoe(result.dataSeg), 'dmem32.coe');
            downloadFile(convert_1.textSegToCoe(result.textSeg), 'prgmip32.coe');
            setStatus('success');
        }
        catch (ex) {
            setStatus('fail', ex);
            console.error(ex);
        }
    };
    $('#asm-download-txt').onclick = function () {
        var link = $('#linkSwitch').checked;
        // @ts-ignore
        globalThis._minisys = {
            _userAppOffset: link ? jOffset : 0,
        };
        try {
            var result = assemble(editor.getValue(), link);
            var dataCoe = convert_1.dataSegToCoe(result.dataSeg);
            var textCoe = convert_1.textSegToCoe(result.textSeg);
            downloadFile(convert_1.coeToTxt(textCoe, dataCoe), 'serial.txt');
            setStatus('success');
        }
        catch (ex) {
            setStatus('fail', ex);
            console.error(ex);
        }
    };
});
