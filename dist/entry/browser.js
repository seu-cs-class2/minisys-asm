"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assembler_1 = require("../assembler");
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
window.addEventListener('load', function () {
    $('#asm-assemble').onclick = assembleBrowser;
    $('#asm-download-coe').onclick = function () {
        alert('该功能暂未支持。');
    };
    $('#asm-download-txt').onclick = function () {
        alert('该功能暂未支持。');
    };
    $('#asm-lastModified').innerHTML = lastModifiedInfo;
});
