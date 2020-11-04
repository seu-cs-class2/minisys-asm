"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assembler_1 = require("../assembler");
var convert_1 = require("../convert");
var lastModifiedInfo = "";
// @ts-ignore
var editor = window.editor;
function $(selector) {
    return document.querySelector(selector);
}
function setStatus(to, trace) {
    var statusBackDOM = $('.status');
    var statusDOM = $('#asm-status');
    var traceDOM = $('#asm-failTrace');
    var successColor = '#cf9';
    var failColor = '#f99';
    if (to === 'success') {
        statusBackDOM.style.background = successColor;
        statusDOM.innerText = '成功';
        traceDOM.innerText = '';
    }
    else if (to === 'fail') {
        statusBackDOM.style.background = failColor;
        statusDOM.innerText = '失败';
        traceDOM.innerText = trace || '';
    }
}
function assembleBrowser() {
    var resultDOM = $('#asm-result');
    var asmCode = editor.getValue();
    try {
        var result = assembler_1.assemble(asmCode);
        var binary = result.textSeg.toBinary();
        resultDOM.value = binary;
        setStatus('success');
    }
    catch (ex) {
        setStatus('fail', ex);
        console.log(ex);
        resultDOM.value = '';
    }
}
function downloadFile(content, filename) {
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
}
;
window.addEventListener('load', function () {
    $('#asm-assemble').onclick = assembleBrowser;
    $('#asm-download-coe').onclick = function () {
        try {
            var result = assembler_1.assemble(editor.getValue());
            downloadFile(convert_1.dataSegToCoe(result.dataSeg), 'dmem32.coe');
        }
        catch (ex) {
            setStatus('fail', ex);
            console.log(ex);
        }
    };
    $('#asm-download-txt').onclick = function () {
        alert('该功能暂未支持。');
    };
    $('#asm-lastModified').innerHTML = lastModifiedInfo;
});
